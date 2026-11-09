import { createFileRoute } from "@tanstack/react-router";
import { getRequestIP, getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

// Best-effort in-memory rate limit. Cloudflare Workers may run multiple
// isolates, so this is per-instance — not a strict global limit.
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 5;
const COOLDOWN_MS = 15_000;
const hits = new Map<string, number[]>();
const recent = new Map<string, number>();
const TELEGRAM_CHAT_ID = -5371454194;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function rateLimit(key: string) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) {
    return { ok: false, retry: Math.ceil((WINDOW_MS - (now - arr[0])) / 1000) };
  }
  if (arr.length && now - arr[arr.length - 1] < COOLDOWN_MS) {
    return { ok: false, retry: Math.ceil((COOLDOWN_MS - (now - arr[arr.length - 1])) / 1000) };
  }
  arr.push(now);
  hits.set(key, arr);
  // Opportunistic GC
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  }
  return { ok: true as const };
}

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  company: z.string().trim().max(150).optional().default(""),
  role: z.string().trim().max(150).optional().default(""),
  message: z.string().trim().max(1000).optional().default(""),
  interests: z.array(z.string().max(80)).max(20).optional().default([]),
  website: z.string().max(0).optional().default(""), // honeypot — must be empty
  elapsedMs: z.number().int().nonnegative().max(86_400_000),
});

export const Route = createFileRoute("/api/public/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
        const parsed = schema.safeParse(payload);
        if (!parsed.success) {
          return Response.json({ error: "Invalid input" }, { status: 400 });
        }
        const data = parsed.data;
        if (data.website) {
          // Honeypot tripped — fake success.
          return Response.json({ ok: true });
        }
        if (data.elapsedMs < 3000) {
          return Response.json({ error: "Submitted too fast" }, { status: 429 });
        }

        const ip =
          getRequestHeader("cf-connecting-ip") ||
          getRequestIP({ xForwardedFor: true }) ||
          "unknown";
        const rl = rateLimit(ip);
        if (!rl.ok) {
          return Response.json(
            { error: "Too many requests", retryAfter: rl.retry },
            { status: 429, headers: { "Retry-After": String(rl.retry) } },
          );
        }

        // Duplicate prevention: identical submission within the window is acknowledged but not resent.
        const fp = `${data.email.toLowerCase()}|${data.name}|${data.message}|${data.interests.join(",")}`;
        const now = Date.now();
        for (const [k, t] of recent) if (now - t > WINDOW_MS) recent.delete(k);
        if (recent.has(fp)) return Response.json({ ok: true, duplicate: true });

        const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
        const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
        if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY) {
          console.error("[contact] Telegram not configured");
          return Response.json({ error: "Could not send your message. Please try again later." }, { status: 500 });
        }

        const dash = (v: string) => (v ? esc(v) : "—");
        const ts = new Date().toLocaleString("en-GB", { timeZone: "Europe/Riga", dateStyle: "medium", timeStyle: "short" }) + " (Riga)";
        const text = [
          "🚀 <b>NEW LEAD — EMPATIX</b>",
          "",
          "👤 <b>CONTACT INFORMATION</b>",
          `• <b>Full Name:</b> ${dash(data.name)}`,
          `• <b>Email:</b> ${dash(data.email)}`,
          `• <b>Company:</b> ${dash(data.company)}`,
          `• <b>Role:</b> ${dash(data.role)}`,
          "",
          "🎯 <b>SERVICES</b>",
          `• <b>Interested in:</b> ${data.interests.length ? esc(data.interests.join(", ")) : "—"}`,
          "",
          "📝 <b>PROJECT DETAILS</b>",
          dash(data.message),
          "",
          "🌐 <b>Source:</b> Empatix Website — Contact Form",
          "",
          `🕒 <b>Submitted:</b> ${esc(ts)}`,
        ].join("\n");

        const res = await fetch("https://connector-gateway.lovable.dev/telegram/sendMessage", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": TELEGRAM_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: "HTML", disable_web_page_preview: true }),
        });
        const body = await res.text();
        if (!res.ok || !body.includes('"ok":true')) {
          console.error(`[contact] Telegram send failed [${res.status}]: ${body}`);
          return Response.json({ error: "Could not send your message. Please try again later." }, { status: 502 });
        }
        recent.set(fp, now);
        return Response.json({ ok: true });
      },
    },
  },
});
