import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { seoMeta } from "@/lib/seo";

export const Route = createFileRoute("/admin/account")({
  ssr: false,
  head: () => seoMeta({title: "Account — Empatix Admin", description: "Securely change your Empatix account password.", path: "/admin/account", noindex: true}),
  component: Account,
});
function Account() {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return <div className="max-w-lg space-y-6">
    <h1 className="text-2xl font-semibold">Account settings</h1>
    <form className="space-y-4" onSubmit={async e => {
      e.preventDefault(); setBusy(true); setMessage("");
      try {
        const { error } = await supabase.auth.updateUser({ password, current_password: current });
        if (error) throw error;
        setMessage("Password changed successfully"); setCurrent(""); setPassword(""); setConfirm("");
      } catch (error) { setMessage(error instanceof Error ? error.message : "Could not change password"); }
      finally { setBusy(false); }
    }}>
      <div className="space-y-2"><Label htmlFor="current">Current password</Label><Input id="current" type="password" autoComplete="current-password" required value={current} onChange={e => setCurrent(e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="new">New password (at least 12 characters)</Label><Input id="new" type="password" autoComplete="new-password" required minLength={12} value={password} onChange={e => setPassword(e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="confirm">Confirm new password</Label><Input id="confirm" type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} /></div>
      {message && <p role="status" className="text-sm">{message}</p>}
      <Button disabled={busy || password.length < 12 || password !== confirm}>Change password</Button>
    </form>
  </div>;
}