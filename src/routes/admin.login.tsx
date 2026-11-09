import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { seoMeta } from "@/lib/seo";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => seoMeta({title: "Sign in — Empatix Admin", description: "Secure email sign-in for Empatix administrators and Insights editors.", path: "/admin/login", noindex: true}),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgot, setForgot] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (forgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin/reset-password` });
        if (error) throw error;
        setSent(true); return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in");
      navigate({ to: "/admin" });
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Empatix Admin</CardTitle>
          <p className="text-sm text-muted-foreground">Sign in to manage content.</p>
        </CardHeader>
        <CardContent>
          {sent && <p role="status" className="mb-4 text-sm text-muted-foreground">If this account exists, a password reset link has been sent. Check your inbox.</p>}
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {!forgot && <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>}
            <Button type="button" variant="link" onClick={() => { setForgot(!forgot); setSent(false); }}>{forgot ? "Back to sign in" : "Forgot password?"}</Button>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "…" : forgot ? "Send reset link" : "Sign in"}
            </Button>
            <div className="flex items-center justify-end text-xs">
              <Link to="/" className="text-muted-foreground hover:text-foreground">
                ← Back to site
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
