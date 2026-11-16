import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutGrid, PenLine, Library, Settings, LogOut, AlertTriangle, RotateCw, ChevronRight, Sparkles, Clapperboard, Image } from "lucide-react";
import { useGetFarmSettings, type JobStatus, type JobFormat } from "@workspace/api-client-react";
import { useFarmAuth } from "@/lib/auth";
import { statusMeta } from "@/lib/farm";
import { cn } from "@/lib/utils";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export function Mark({ className }: { className?: string }) {
  return <img src={`${basePath}/triznes-logo.jpeg`} alt="Логотип ТРИЗНЕС" className={cn("h-10 w-10 rounded-xl object-cover object-[center_42%] ring-1 ring-white/25", className)} />;
}

const nav = [
  { href: "/studio", label: "Студия", icon: LayoutGrid },
  { href: "/new", label: "Новое творение", icon: PenLine },
  { href: "/montages", label: "Монтаж", icon: Clapperboard },
  { href: "/images", label: "Изображения", icon: Image },
  { href: "/library", label: "Библиотека", icon: Library },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [loc] = useLocation();
  const { signOut, user } = useFarmAuth();
  const { data: settings } = useGetFarmSettings();
  const initials = (user?.firstName?.[0] ?? user?.email?.[0] ?? "Н").toUpperCase();
  const active = (h: string) => loc === h || (h === "/studio" && loc.startsWith("/jobs"));

  return (
    <div className="grain min-h-[100dvh] bg-background md:flex">
      <aside className="hidden md:flex w-[252px] shrink-0 flex-col bg-sidebar text-sidebar-foreground sticky top-0 h-[100dvh] border-r border-cyan-300/15 px-4 py-7">
        <Link href="/studio" className="flex items-center gap-3 px-2" data-testid="link-home">
          <Mark className="h-11 w-11" />
          <div>
            <div className="font-display text-[11px] leading-tight font-semibold">ТРИЗНЕС</div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-cyan-200/70 truncate max-w-[150px]" data-testid="text-workspace">
              {settings?.workspaceName ?? "студия"}
            </div>
          </div>
        </Link>
        <div className="mt-11 px-3 font-mono text-[10px] tracking-[.22em] text-cyan-200/55">НАВИГАЦИЯ / 01</div>
        <nav className="mt-4 flex flex-col gap-2">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              data-testid={`link-nav-${n.href.slice(1)}`}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors",
                active(n.href) ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_8px_30px_-18px_hsl(179_82%_51%)]" : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <n.icon className="h-4 w-4 transition-transform group-hover:-rotate-6" />
              <span className="flex-1">{n.label}</span>{active(n.href) && <ChevronRight className="h-3.5 w-3.5" />}
            </Link>
          ))}
        </nav>
        <div className="mt-10 mx-1 rounded-2xl border border-cyan-200/20 bg-cyan-300/5 p-4">
          <Sparkles className="h-5 w-5 text-cyan-300" />
          <p className="font-display mt-4 text-xs leading-relaxed">ЖИЗНЬ КАК КИНО</p>
          <p className="mt-2 text-xs leading-relaxed text-sidebar-foreground/55">История начинается с вашего взгляда.</p>
        </div>
        <div className="mt-auto flex items-center gap-3 border-t border-sidebar-border pt-4">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-accent font-display text-xs text-accent-foreground">{initials}</div>
          <div className="min-w-0 flex-1 text-xs">
            <div className="truncate">{user?.fullName || user?.email}</div>
          </div>
          <button
            onClick={() => signOut()}
            className="rounded-lg p-2 hover:bg-sidebar-accent"
            title="Выйти"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
      <header className="md:hidden sticky top-0 z-40 flex items-center gap-2 border-b border-cyan-200/20 bg-sidebar/95 px-3 py-2 text-sidebar-foreground backdrop-blur-xl">
        <Link href="/studio" aria-label="Студия" data-testid="link-mobile-home"><Mark className="h-9 w-9" /></Link>
        <span className="font-display text-[10px] leading-tight">ТРИЗНЕС<br /><span className="text-cyan-200/60">СТУДИЯ</span></span>
        <div className="flex flex-1 justify-end gap-0.5">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} title={n.label} aria-label={n.label} className={cn("rounded-lg p-2.5", active(n.href) && "bg-sidebar-primary text-sidebar-primary-foreground")} data-testid={`link-mnav-${n.href.slice(1)}`}>
              <n.icon className="h-4 w-4" />
            </Link>
          ))}
          <button onClick={() => signOut()} title="Выйти" aria-label="Выйти" className="rounded-lg p-2.5" data-testid="button-mlogout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>
      <main className="app-main flex-1 min-w-0 px-4 py-8 sm:px-6 md:px-9 md:py-10 xl:px-14">{children}</main>
    </div>
  );
}

export function StatusPill({ status }: { status: JobStatus }) {
  const m = statusMeta[status];
  return (
    <span data-testid={`status-${status}`} className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide", m.tone)}>
      {status === "processing" && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
      {m.label}
    </span>
  );
}

export function FormatGlyph({ format }: { format: JobFormat }) {
  const size = format === "9:16" ? "w-3 h-5" : format === "16:9" ? "w-5 h-3" : "w-4 h-4";
  return <span className={cn("inline-block rounded-[3px] border-2 border-current", size)} aria-label={format} />;
}

export function PageHead({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="rise mb-9 flex flex-wrap items-end justify-between gap-5 border-b border-border pb-7">
      <div>
        <div className="eyebrow flex items-center gap-2 text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> {kicker}</div>
        <h1 className="font-display mt-3 text-3xl font-semibold leading-tight md:text-[2.8rem]">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function ErrorPanel({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-5" data-testid="panel-error">
      <AlertTriangle className="h-5 w-5 text-destructive" />
      <p className="flex-1 text-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-4 py-2 text-sm hover:bg-foreground hover:text-background transition-colors" data-testid="button-retry">
          <RotateCw className="h-3.5 w-3.5" /> Повторить
        </button>
      )}
    </div>
  );
}

export function Pulse({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-muted", className)} />;
}
