import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  adminListUsers,
  adminCreateUser,
  adminDeleteUser,
  adminSetUserDisabled,
  adminSetUserRole,
  adminSendPasswordEmail,
  adminSetUserPassword,
  getMyRoles,
} from "@/lib/admin/users.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Ban, CheckCircle2, Mail, KeyRound } from "lucide-react";
import { seoMeta } from "@/lib/seo";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  ssr: false,
  head: () => seoMeta({title: "Users — Empatix Admin", description: "Manage Empatix administrator and Insights editor access and invitations.", path: "/admin/users", noindex: true}),
  component: UsersPage,
});

function UsersPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListUsers);
  const createFn = useServerFn(adminCreateUser);
  const deleteFn = useServerFn(adminDeleteUser);
  const disableFn = useServerFn(adminSetUserDisabled);
  const roleFn = useServerFn(adminSetUserRole);
  const emailFn = useServerFn(adminSendPasswordEmail);
  const passwordFn = useServerFn(adminSetUserPassword);
  const [passwordTarget, setPasswordTarget] = useState<{ id: string; email: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const closePassword = () => {
    setPasswordTarget(null); setNewPassword(""); setPasswordConfirm(""); setPasswordError("");
  };
  const changePassword = useMutation({
    mutationFn: (value: { user_id: string; password: string }) => passwordFn({ data: value }),
    gcTime: 0,
    onSuccess: () => { closePassword(); toast.success("Password changed successfully"); },
    onError: (error: Error) => setPasswordError(error.message),
    onSettled: (_result, _error, variables) => { variables.password = ""; },
  });
  const rolesFn = useServerFn(getMyRoles);
  const {data: myRoles = []} = useQuery({queryKey: ["admin", "my-roles"], queryFn: () => rolesFn()});
  const isSuper = myRoles.includes("super_admin");
  const sendEmail = useMutation({mutationFn: (user_id: string) => emailFn({data: {user_id}}), onSuccess: () => toast.success("Password setup email sent"), onError: (e: Error) => toast.error(e.message)});

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => listFn(),
  });

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "super_admin" | "editor">("editor");

  const create = useMutation({
    mutationFn: () => createFn({ data: { email, role } }),
    onSuccess: () => {
      toast.success("Invitation sent");
      setEmail("");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onDelete = useMutation({
    mutationFn: (user_id: string) => deleteFn({ data: { user_id } }),
    onSuccess: () => {
      toast.success("User deleted");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onToggle = useMutation({
    mutationFn: (v: { user_id: string; disabled: boolean }) => disableFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const onRole = useMutation({
    mutationFn: (v: { user_id: string; role: "admin" | "super_admin" | "editor"; grant: boolean }) =>
      roleFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invite user</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 sm:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="new-email">Email</Label>
              <Input id="new-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                  {isSuper && <SelectItem value="super_admin">Super Admin</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-4">
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Sending…" : "Send invitation"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Roles</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-4 text-muted-foreground" colSpan={5}>
                  Loading…
                </td>
              </tr>
            ) : (
              (users as any[]).map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      {(["editor", "admin", ...(isSuper ? ["super_admin" as const] : [])] as const).map((r) => {
                        const has = u.roles.includes(r);
                        return (
                          <Button type="button" variant="ghost" size="sm" disabled={onRole.isPending}
                            key={r}
                            onClick={() =>
                              onRole.mutate({ user_id: u.id, role: r, grant: !has })
                            }
                            className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                              has
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {r}
                          </Button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {u.disabled ? (
                      <span className="text-amber-600 dark:text-amber-400">Disabled</span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" title="Set password" aria-label={`Set password for ${u.email}`} disabled={!isSuper && u.roles.includes("super_admin")} onClick={() => { changePassword.reset(); setPasswordError(""); setPasswordTarget({ id: u.id, email: u.email }); }}><KeyRound className="size-4" /></Button>
                      <Button size="icon" variant="ghost" title={u.invited ? "Resend password setup invitation" : "Send password reset"} disabled={sendEmail.isPending} onClick={() => sendEmail.mutate(u.id)}><Mail className="size-4" /></Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title={u.disabled ? "Enable" : "Disable"}
                        onClick={() =>
                          onToggle.mutate({ user_id: u.id, disabled: !u.disabled })
                        }
                      >
                        {u.disabled ? <CheckCircle2 className="size-4" /> : <Ban className="size-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Delete ${u.email}?`)) onDelete.mutate(u.id);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Dialog open={passwordTarget !== null} onOpenChange={(open) => { if (!open && !changePassword.isPending) { closePassword(); changePassword.reset(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set password</DialogTitle>
            <DialogDescription className="break-all">{passwordTarget?.email}</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => {
            event.preventDefault();
            if (!passwordTarget || changePassword.isPending) return;
            if (newPassword !== passwordConfirm) { setPasswordError("Passwords do not match"); return; }
            setPasswordError("");
            changePassword.mutate({ user_id: passwordTarget.id, password: newPassword });
            setNewPassword(""); setPasswordConfirm("");
          }}>
            <div className="space-y-2"><Label htmlFor="admin-new-password">New password (at least 12 characters)</Label><Input id="admin-new-password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} disabled={changePassword.isPending} value={newPassword} onChange={event => setNewPassword(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="admin-confirm-password">Confirm password</Label><Input id="admin-confirm-password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} disabled={changePassword.isPending} value={passwordConfirm} onChange={event => setPasswordConfirm(event.target.value)} /></div>
            {passwordError && <p role="alert" className="text-sm text-destructive">{passwordError}</p>}
            <DialogFooter><Button type="button" variant="outline" disabled={changePassword.isPending} onClick={() => { closePassword(); changePassword.reset(); }}>Cancel</Button><Button type="submit" disabled={changePassword.isPending || newPassword.length < 12 || newPassword !== passwordConfirm}>{changePassword.isPending ? "Saving…" : "Save password"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
