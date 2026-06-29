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
} from "@/lib/admin/users.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Ban, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  ssr: false,
  component: UsersPage,
});

function UsersPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListUsers);
  const createFn = useServerFn(adminCreateUser);
  const deleteFn = useServerFn(adminDeleteUser);
  const disableFn = useServerFn(adminSetUserDisabled);
  const roleFn = useServerFn(adminSetUserRole);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => listFn(),
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "super_admin">("admin");

  const create = useMutation({
    mutationFn: () => createFn({ data: { email, password, role } }),
    onSuccess: () => {
      toast.success("Admin created");
      setEmail("");
      setPassword("");
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
    mutationFn: (v: { user_id: string; role: "admin" | "super_admin"; grant: boolean }) =>
      roleFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Administrators</h1>
        <p className="text-sm text-muted-foreground">
          Only Super Admins can create, disable, or remove other admin users.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create new admin</CardTitle>
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
              <Label htmlFor="new-password">Password</Label>
              <Input
                id="new-password"
                type="password"
                required
                minLength={12}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-4">
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Creating…" : "Create admin"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-lg border border-border">
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
                      {(["admin", "super_admin"] as const).map((r) => {
                        const has = u.roles.includes(r);
                        return (
                          <button
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
                          </button>
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
    </div>
  );
}
