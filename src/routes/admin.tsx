import { createFileRoute, Link, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyRoles } from "@/lib/admin/users.functions";
import {
  Image as ImageIcon,
  Users,
  ScrollText,
  LogOut,
  Moon,
  Sun,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  MousePointerClick,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // Allow public login page through; everything else requires session.
    if (location.pathname.startsWith("/admin/login")) return;
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/admin/login", search: { redirect: location.pathname } });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const router = useRouter();
  const path = router.state.location.pathname;
  const isLogin = path.startsWith("/admin/login");

  if (isLogin) {
    return (
      <div className="min-h-screen bg-background text-foreground antialiased">
        <Outlet />
      </div>
    );
  }

  return <AdminShell />;
}

function AdminShell() {
  const router = useRouter();
  const getRolesFn = useServerFn(getMyRoles);
  const [open, setOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("admin-sidebar-collapsed");
    if (stored === "1") setDesktopCollapsed(true);
  }, []);
  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", desktopCollapsed ? "1" : "0");
  }, [desktopCollapsed]);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("admin-theme") as "light" | "dark" | null;
    const initial = stored ?? "dark";
    setTheme(initial);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("admin-theme", theme);
    return () => {
      document.documentElement.classList.remove("light");
    };
  }, [theme]);

  const rolesQuery = useQuery({
    queryKey: ["admin", "my-roles"],
    queryFn: () => getRolesFn(),
  });

  const roles = rolesQuery.data ?? [];
  const isSuper = roles.includes("super_admin");
  const isAdmin = isSuper || roles.includes("admin");

  if (rolesQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading admin…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <div className="max-w-md space-y-3">
          <h1 className="text-2xl font-semibold">Access denied</h1>
          <p className="text-sm text-muted-foreground">
            Your account is signed in but does not have admin privileges. Contact a Super Admin.
          </p>
          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              router.navigate({ to: "/admin/login" });
            }}
          >
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  const nav = [
    { to: "/admin/editor", label: "Visual Editor", icon: MousePointerClick, exact: false },
    { to: "/admin/media", label: "Media Library", icon: ImageIcon, exact: false },
    { to: "/admin/users", label: "Admins", icon: Users, exact: false },
    { to: "/admin/audit", label: "Audit Log", icon: ScrollText, exact: false },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`${
            open ? "translate-x-0" : "-translate-x-full"
          } ${desktopCollapsed ? "lg:hidden" : "lg:translate-x-0"} fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-card transition-transform lg:static`}
        >
          <div className="flex h-14 items-center justify-between gap-2 border-b border-border px-4">
            <Link to="/admin" className="text-lg font-semibold tracking-tight">
              Empatix <span className="text-muted-foreground">Admin</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex -mr-2"
              onClick={() => setDesktopCollapsed(true)}
              title="Hide sidebar"
            >
              <PanelLeftClose className="size-4" />
            </Button>
          </div>
          <nav className="flex flex-col gap-0.5 overflow-y-auto p-2" style={{ maxHeight: "calc(100vh - 56px)" }}>
            {nav.map((item, i) => {
              const prev = i > 0 ? (nav[i - 1] as any).group : undefined;
              const showHeader = (item as any).group && (item as any).group !== prev;
              return (
                <div key={item.to}>
                  {showHeader && (
                    <p className="mt-3 px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {(item as any).group}
                    </p>
                  )}
                  <Link
                    to={item.to}
                    activeProps={{ className: "bg-accent text-accent-foreground" }}
                    activeOptions={{ exact: item.exact }}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground/80 hover:bg-accent hover:text-accent-foreground"
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-0">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setOpen((v) => !v)}
                title="Toggle sidebar"
              >
                <Menu className="size-5" />
              </Button>
              {desktopCollapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden lg:inline-flex"
                  onClick={() => setDesktopCollapsed(false)}
                  title="Show sidebar"
                >
                  <PanelLeftOpen className="size-5" />
                </Button>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                title="Toggle theme"
              >
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.navigate({ to: "/admin/login" });
                }}
              >
                <LogOut className="size-4" />
                Sign out
              </Button>
            </div>
          </header>
          <main className="min-w-0 flex-1 overflow-hidden p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
