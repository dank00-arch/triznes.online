import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Plus, ArrowRight, Film, ScanLine } from "lucide-react";
import { useListJobs, useGetFarmOverview, useGetFarmSession, type JobStatus } from "@workspace/api-client-react";
import { AppShell, PageHead, StatusPill, FormatGlyph, ErrorPanel, Pulse } from "@/components/farm-ui";
import { errorMessage, formatDate, kindLabel, statusMeta } from "@/lib/farm";
import { cn } from "@/lib/utils";

export default function Studio() {
  const jobs = useListJobs();
  const overview = useGetFarmOverview();
  const session = useGetFarmSession();
  const [filter, setFilter] = useState<JobStatus | "all">("all");
  const list = useMemo(() => (jobs.data ?? []).filter((j) => filter === "all" || j.status === filter), [jobs.data, filter]);

  const stats = [
    { k: "Все истории", v: overview.data?.total, c: "bg-card" },
    { k: "Брифы", v: overview.data?.drafts, c: "bg-secondary" },
    { k: "В создании", v: overview.data?.active, c: "bg-accent" },
    { k: "Готово", v: overview.data?.completed, c: "bg-sidebar text-sidebar-foreground" },
  ];

  return (
    <AppShell>
      <PageHead kicker="студия ТРИЗНЕС" title="Ваши истории">
        <Link href="/new" className="group inline-flex items-center gap-2 rounded-xl bg-sidebar px-5 py-3 text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-primary" data-testid="link-new-job">
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" /> Новое творение
        </Link>
      </PageHead>
      <div className="world-card rise relative mb-8 min-h-56 overflow-hidden rounded-2xl bg-[url('/paradise-city.jpg')] bg-cover bg-center p-6 sm:p-8" data-testid="panel-studio-intro">
        <div className="relative z-10 max-w-xl"><div className="eyebrow flex items-center gap-2 text-cyan-200"><ScanLine className="h-4 w-4" /> ВАША СТУДИЯ / СЦЕНА ОТКРЫТА</div><h2 className="font-display mt-5 text-2xl leading-snug sm:text-3xl">Обычный день.<br />Необычный ракурс.</h2><p className="mt-3 max-w-sm text-sm text-white/85">Каждый проект начинается с вашего взгляда. Соберите историю, которую хочется показать.</p></div>
        <Film className="absolute bottom-6 right-7 z-10 h-10 w-10 text-cyan-200/70" />
      </div>

      {session.data && !session.data.owner && (
        <div className="rise mb-8 rounded-xl border border-primary/25 bg-secondary/40 p-4 text-sm text-foreground" data-testid="text-owner-note">
          {session.data.configured
            ? "Вы не владелец фермы: брифы и сценарии можно вести вручную, а генерация и экспорт в Drive доступны только владельцу."
            : "Владелец фермы ещё не назначен (FARM_OWNER_USER_ID не задан). Генерация и экспорт в Drive заблокированы до настройки — подробности в разделе «Настройки»."}
        </div>
      )}

      <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {overview.isError ? (
          <div className="col-span-full"><ErrorPanel message={errorMessage(overview.error)} onRetry={() => overview.refetch()} /></div>
        ) : (
          stats.map((s, i) => (
            <div key={s.k} className={cn("rise lift relative overflow-hidden rounded-2xl border border-border/60 p-5", s.c)} style={{ animationDelay: `${i * 60}ms` }}>
              <div className="font-mono text-[11px] uppercase tracking-widest opacity-70">{s.k}</div>
              {overview.isLoading ? <Pulse className="mt-3 h-9 w-12 bg-foreground/10" /> : (
                <div className="font-display mt-2 text-4xl font-semibold" data-testid={`stat-${i}`}>{s.v ?? 0}</div>
              )}
              <span className="absolute bottom-4 right-4 font-mono text-[10px] opacity-35">0{i + 1}</span>
            </div>
          ))
        )}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {(["all", ...Object.keys(statusMeta)] as (JobStatus | "all")[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            data-testid={`filter-${s}`}
            className={cn("rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors", filter === s ? "border-sidebar bg-sidebar text-sidebar-foreground" : "border-border bg-card hover:border-primary")}
          >
            {s === "all" ? "Все" : statusMeta[s].label}
          </button>
        ))}
      </div>

      {jobs.isLoading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Pulse key={i} className="h-20" />)}</div>
      ) : jobs.isError ? (
        <ErrorPanel message={errorMessage(jobs.error, "Не удалось загрузить задачи")} onRetry={() => jobs.refetch()} />
      ) : list.length === 0 ? (
        <div className="game-panel dotgrid rounded-2xl p-10 text-center sm:p-16" data-testid="empty-jobs">
          <Film className="mx-auto mb-5 h-9 w-9 text-primary" />
          <h3 className="font-display text-xl">{filter === "all" ? "Пока пусто — и это хорошее начало" : "Задач с этим статусом нет"}</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">Ваша жизнь достойна истории. Начните с трёх предложений о себе, своём мастерстве и мечте. Сценарий можно изменить перед созданием видео.</p>
          <Link href="/new" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sidebar px-5 py-3 text-sm text-sidebar-foreground hover:bg-primary transition-colors" data-testid="link-empty-new">
            Создать творение <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {list.map((j, i) => (
            <li key={j.id} className="rise" style={{ animationDelay: `${i * 40}ms` }}>
              <Link href={`/jobs/${j.id}`} className="group flex flex-wrap items-center gap-3 px-4 py-5 transition-colors hover:bg-secondary/40 sm:flex-nowrap sm:gap-4 sm:px-6" data-testid={`row-job-${j.id}`}>
                <span className="text-muted-foreground"><FormatGlyph format={j.format} /></span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{j.title}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{kindLabel[j.kind]} · {j.format} · {formatDate(j.createdAt)}</div>
                </div>
                <span className="ml-6 sm:ml-0"><StatusPill status={j.status} /></span>
                <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
