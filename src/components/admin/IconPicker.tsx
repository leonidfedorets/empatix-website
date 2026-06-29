import { useMemo, useState } from "react";
import {
  Compass, Cpu, Workflow, ShieldCheck, Sparkles, Rocket, Bot, Brain,
  Zap, Wrench, Cog, Settings, Database, Server, Cloud, Lock, Key,
  Globe, Network, Plug, Layers, LayoutGrid, Boxes, Box, Package,
  BarChart3, LineChart, PieChart, TrendingUp, Activity, Target,
  Users, User, UserCheck, Briefcase, Building2, Handshake,
  MessageSquare, Mail, Phone, Bell, Star, Heart, Award, Trophy,
  CheckCircle2, Clock, Calendar, Search, Filter, Eye, Lightbulb,
  Code2, Terminal, GitBranch, Puzzle, Wand2, Gauge, Map, Compass as CompassIcon,
  FileText, Folder, Archive, Image as ImageIcon, Video, Mic, Headphones,
  ShoppingCart, CreditCard, DollarSign, Wallet, Receipt, Tag,
  Truck, MapPin, Send, Share2, Link as LinkIcon, ExternalLink,
} from "lucide-react";

export const ICON_OPTIONS = {
  Compass, Cpu, Workflow, ShieldCheck, Sparkles, Rocket, Bot, Brain,
  Zap, Wrench, Cog, Settings, Database, Server, Cloud, Lock, Key,
  Globe, Network, Plug, Layers, LayoutGrid, Boxes, Box, Package,
  BarChart3, LineChart, PieChart, TrendingUp, Activity, Target,
  Users, User, UserCheck, Briefcase, Building2, Handshake,
  MessageSquare, Mail, Phone, Bell, Star, Heart, Award, Trophy,
  CheckCircle2, Clock, Calendar, Search, Filter, Eye, Lightbulb,
  Code2, Terminal, GitBranch, Puzzle, Wand2, Gauge, Map,
  FileText, Folder, Archive, Image: ImageIcon, Video, Mic, Headphones,
  ShoppingCart, CreditCard, DollarSign, Wallet, Receipt, Tag,
  Truck, MapPin, Send, Share2, Link: LinkIcon, ExternalLink,
} as const;

export type IconName = keyof typeof ICON_OPTIONS;

export function IconPicker({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const SelectedIcon = (value && (ICON_OPTIONS as Record<string, typeof Compass>)[value]) || CompassIcon;
  const names = useMemo(() => Object.keys(ICON_OPTIONS) as string[], []);
  const filtered = useMemo(
    () => (q ? names.filter((n) => n.toLowerCase().includes(q.toLowerCase())) : names),
    [names, q],
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
      >
        <span className="flex items-center gap-2">
          <SelectedIcon className="size-4" />
          <span>{value || "Pick icon"}</span>
        </span>
        <span className="text-xs text-muted-foreground">change</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-md">
            <div className="border-b border-border p-2">
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search icon…"
                className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
              />
            </div>
            <div className="max-h-72 overflow-auto p-2">
              <div className="grid grid-cols-6 gap-1">
                {filtered.map((name) => {
                  const Icon = (ICON_OPTIONS as Record<string, typeof Compass>)[name];
                  const active = name === value;
                  return (
                    <button
                      key={name}
                      type="button"
                      title={name}
                      onClick={() => {
                        onChange(name);
                        setOpen(false);
                      }}
                      className={`flex aspect-square items-center justify-center rounded border transition ${
                        active
                          ? "border-brand-sky bg-accent text-accent-foreground"
                          : "border-transparent hover:border-border hover:bg-accent"
                      }`}
                    >
                      <Icon className="size-4" />
                    </button>
                  );
                })}
                {!filtered.length && (
                  <p className="col-span-6 py-4 text-center text-xs text-muted-foreground">
                    No matches
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
