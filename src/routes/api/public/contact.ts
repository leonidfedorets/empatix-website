import { createFileRoute } from "@tanstack/react-router";
import { getRequestIP, getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

// Best-effort in-memory rate limit. Cloudflare Workers may run multiple
// isolates, so this is per-instance — not a strict global limit.
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 5;
const COOLDOWN_MS = 15_000;
const hits = new Map<string, number[]>();

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

        // No persistence layer wired yet — just log so it appears in worker logs.
        console.log("[contact] new submission", {
          ip,
          email: data.email,
          interests: data.interests,
          message_len: data.message.length,
        });

        return Response.json({ ok: true });
      },
    },
  },
});
