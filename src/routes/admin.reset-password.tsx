import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/reset-password")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Set your password — Empatix Admin" },
    { name: "description", content: "Securely set your Empatix administrator password." },
    { property: "og:title", content: "Set your password — Empatix Admin" },
    { property: "og:description", content: "Securely set your Empatix administrator password." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [linkError, setLinkError] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function requestNewLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError("");
    const { error: sendError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/admin/reset-password` });
    setSending(false);
    if (sendError) { setError(sendError.message); return; }
    setSent(true);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, "") || window.location.search);
    const code = params.get("error_code");
    if (params.get("error") || code) {
      setLinkError(code === "otp_expired"
        ? "This link has already been used or has expired. Only the most recent email works, and each link can be opened once within 1 hour."
        : (params.get("error_description") || "This link is not valid.").replace(/\+/g, " "));
      window.history.replaceState(null, "", window.location.pathname);
    }
    const recovery = /type=(recovery|invite)/.test(window.location.hash);
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || (recovery && event === "SIGNED_IN")) setReady(true);
    });
    if (recovery) {
      void supabase.auth.getSession().then(({ data: session }) => {
        if (session.session) setReady(true);
      });
    }
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || password.length < 12 || password !== confirmation) return;
    setBusy(true);
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) { setError(updateError.message); return; }
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  }

  return <div className="flex min-h-screen items-center justify-center bg-background px-4">
    <Card className="w-full max-w-sm">
      <CardHeader><CardTitle>Set your password</CardTitle></CardHeader>
      <CardContent>
        {!ready ? (linkError ? <div className="space-y-4">
            <p role="alert" className="text-sm text-destructive">{linkError}</p>
            {sent ? <p className="text-sm text-muted-foreground">A new link has been sent. Open the newest email and click the button once.</p> :
              <form onSubmit={requestNewLink} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Your email</Label>
                  <Input id="reset-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={sending}>{sending ? "Sending…" : "Send a new link"}</Button>
              </form>}
          </div> : <p className="text-sm text-muted-foreground">Open the password setup link from your email. If it has expired, request a new link.</p>) :
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New password (at least 12 characters)</Label>
              <Input id="new-password" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input id="confirm-password" type="password" autoComplete="new-password" required value={confirmation} onChange={e => setConfirmation(e.target.value)} />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy || password.length < 12 || password !== confirmation}>{busy ? "Saving…" : "Save password"}</Button>
          </form>}
      </CardContent>
    </Card>
  </div>;
}