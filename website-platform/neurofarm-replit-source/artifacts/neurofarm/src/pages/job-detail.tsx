import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, Check, Clapperboard, FolderUp, Trash2, Loader2, Save, ExternalLink, Lock } from "lucide-react";
import {
  useGetJob, useUpdateJob, useDeleteJob, useRunJobAction, useGetFarmSession, useGetFarmIntegrations,
  getGetJobQueryKey, getListJobsQueryKey, getGetFarmOverviewQueryKey,
  type Job, type JobActionAction, type IntegrationStatus,
} from "@workspace/api-client-react";
import { AppShell, StatusPill, FormatGlyph, ErrorPanel, Pulse } from "@/components/farm-ui";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { errorMessage, formatDate, kindLabel, statusMeta } from "@/lib/farm";
import { cn } from "@/lib/utils";

function findIntegration(list: IntegrationStatus[] | undefined, key: string) {
  return list?.find((i) => i.id.toLowerCase().includes(key) || i.name.toLowerCase().includes(key));
}

const stages = ["Бриф", "Сценарий", "Одобрено", "Видео", "Готово"];

export default function JobDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "";
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();

  const job = useGetJob(id, {
    query: {
      enabled: !!id,
      queryKey: getGetJobQueryKey(id),
      refetchInterval: (q) => (q.state.data?.status === "processing" ? 10000 : false),
    },
  });
  const session = useGetFarmSession();
  const integrations = useGetFarmIntegrations();
  const update = useUpdateJob();
  const del = useDeleteJob();
  const run = useRunJobAction();

  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [script, setScript] = useState("");
  const initFor = useRef<string | null>(null);
  const lastScript = useRef<string>("");

  useEffect(() => {
    if (job.data && initFor.current !== id) {
      initFor.current = id;
      setTitle(job.data.title);
      setBrief(job.data.brief);
      setScript(job.data.script);
      lastScript.current = job.data.script;
    }
  }, [job.data, id]);

  // Pick up server-generated script if user hasn't edited locally
  useEffect(() => {
    const s = job.data?.script;
    if (s !== undefined && s !== lastScript.current && script === lastScript.current) {
      setScript(s);
      lastScript.current = s;
    }
  }, [job.data?.script, script]);

  const syncCaches = (j: Job) => {
    qc.setQueryData(getGetJobQueryKey(id), j);
    qc.invalidateQueries({ queryKey: getListJobsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetFarmOverviewQueryKey() });
  };

  if (job.isLoading) {
    return <AppShell><Pulse className="h-12 w-2/3" /><Pulse className="mt-6 h-64" /></AppShell>;
  }
  if (job.isError || !job.data) {
    return (
      <AppShell>
        <Link href="/studio" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" data-testid="link-back"><ArrowLeft className="h-4 w-4" /> В студию</Link>
        <ErrorPanel message={errorMessage(job.error, "Задача не найдена")} onRetry={() => job.refetch()} />
      </AppShell>
    );
  }

  const j = job.data;
  const dirty = title !== j.title || brief !== j.brief || script !== j.script;
  const owner = !!session.data?.owner;
  const gemini = findIntegration(integrations.data, "gemini");
  const kling = findIntegration(integrations.data, "kling");
  const drive = findIntegration(integrations.data, "drive");

  const save = () => {
    update.mutate(
      { id, data: { title: title.trim() || j.title, brief, script } },
      {
        onSuccess: (updated) => {
          lastScript.current = updated.script;
          syncCaches(updated);
          toast({ title: "Сохранено" });
        },
        onError: (err) => toast({ title: "Не сохранилось", description: errorMessage(err), variant: "destructive" }),
      },
    );
  };

  const act = (action: JobActionAction, done: string) => {
    run.mutate(
      { id, data: { action } },
      {
        onSuccess: (updated) => {
          lastScript.current = updated.script;
          setScript(updated.script);
          syncCaches(updated);
          toast({ title: done });
        },
        onError: (err) => toast({ title: "Действие не выполнено", description: errorMessage(err), variant: "destructive" }),
      },
    );
  };

  const remove = () =>
    del.mutate(
      { id },
      {
        onSuccess: () => {
          qc.removeQueries({ queryKey: getGetJobQueryKey(id) });
          qc.invalidateQueries({ queryKey: getListJobsQueryKey() });
          qc.invalidateQueries({ queryKey: getGetFarmOverviewQueryKey() });
          toast({ title: "Задача удалена" });
          setLocation("/studio");
        },
        onError: (err) => toast({ title: "Не удалось удалить", description: errorMessage(err), variant: "destructive" }),
      },
    );

  const block = (integration: IntegrationStatus | undefined, name: string): string | null => {
    if (!owner) return session.data?.configured ? "Доступно только владельцу фермы" : "Владелец фермы не назначен — см. Настройки";
    if (!integration || integration.status !== "connected") return `${name}: ${integration?.detail || "ключ не подключён"}`;
    return null;
  };

  const overLimit = j.kind === "video" && script.length > 2500;
  const step = statusMeta[j.status].step;
  const busy = run.isPending || j.status === "processing";
  const actions: { key: JobActionAction; label: string; icon: typeof Check; show: boolean; blocked: string | null; done: string; primary?: boolean }[] = [
    { key: "generate_script", label: j.script ? "Пересоздать сценарий" : "Сгенерировать сценарий", icon: Sparkles, show: ["draft", "script_ready", "failed"].includes(j.status), blocked: block(gemini, "Gemini"), done: "Сценарий получен", primary: j.status === "draft" },
    { key: "approve", label: "Одобрить сценарий", icon: Check, show: j.status === "script_ready", blocked: script.trim() ? (dirty ? "Сначала сохраните правки" : null) : "Сценарий пуст", done: "Сценарий одобрен", primary: true },
    { key: "generate_video", label: "Собрать видео", icon: Clapperboard, show: j.kind === "video" && j.status === "approved", blocked: block(kling, "Kling") ?? (overLimit ? "Сценарий длиннее 2500 символов — сократите его" : dirty ? "Сначала сохраните правки" : null), done: "Видео запущено", primary: j.status === "approved" },
    { key: "export_drive", label: j.driveUrl ? "Сохранить сценарий в Drive снова" : "Сохранить сценарий в Drive", icon: FolderUp, show: j.status === "completed" || (j.kind === "text" && j.status === "approved"), blocked: block(drive, "Google Drive"), done: "Сценарий сохранён в Drive", primary: !j.driveUrl },
  ];
  const visible = actions.filter((a) => a.show);

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
        <Link href="/studio" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" data-testid="link-back"><ArrowLeft className="h-4 w-4" /> В студию</Link>
        <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
          <FormatGlyph format={j.format} /> {kindLabel[j.kind]} · {j.format} · {formatDate(j.createdAt)}
          <StatusPill status={j.status} />
        </div>
      </div>

      <div className="eyebrow mt-8 text-primary">ПРОЕКТ / {j.kind === "video" ? "ВИДЕО" : "СЦЕНАРИЙ"}</div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="font-display rise mt-3 w-full border-b-2 border-transparent bg-transparent py-2 text-3xl font-semibold outline-none transition-colors focus:border-primary md:text-5xl"
        data-testid="input-title"
      />

      <ol className="game-panel mt-8 flex gap-2 overflow-x-auto rounded-2xl p-4 sm:gap-4 sm:p-5" data-testid="progress-stages">
        {stages.slice(0, j.kind === "text" ? 3 : 5).map((s, i) => (
          <li key={s} className="flex-1">
            <div className={cn("h-1.5 rounded-full transition-colors duration-500", j.status === "failed" ? "bg-destructive/40" : i <= step ? "bg-primary" : "bg-muted")} />
            <div className={cn("mt-2 min-w-14 font-mono text-[9px] uppercase tracking-wide sm:text-[10px] sm:tracking-widest", i <= step ? "font-semibold text-foreground" : "text-muted-foreground")}>{s}</div>
          </li>
        ))}
      </ol>

      {j.error && <div className="mt-6"><ErrorPanel message={j.error} /></div>}

      <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <section className="game-panel rounded-2xl p-5 sm:p-6">
            <h2 className="eyebrow text-primary">01 / Бриф</h2>
            <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={5} className="mt-2 w-full resize-y rounded-2xl border border-input bg-card p-5 leading-relaxed outline-none focus:shadow-[0_0_0_3px_hsl(var(--primary)/.25)]" data-testid="input-brief" />
          </section>
          <section className="game-panel rounded-2xl p-5 sm:p-6">
            <h2 className="eyebrow text-primary">02 / Сценарий</h2>
            {j.status === "draft" && !script ? (
              <div className="dotgrid mt-2 rounded-2xl border border-dashed border-foreground/25 p-10 text-center text-sm text-muted-foreground" data-testid="empty-script">
                Сценария ещё нет. Сгенерируйте его через Gemini — или напишите сами прямо здесь.
                <button onClick={() => setScript(" ")} className="mt-4 block mx-auto rounded-full border border-foreground/20 px-4 py-2 text-foreground hover:bg-muted" data-testid="button-write-manual">Написать вручную</button>
              </div>
            ) : (
              <textarea value={script} onChange={(e) => setScript(e.target.value)} rows={16} maxLength={j.kind === "video" ? 2500 : undefined} className="mt-2 w-full resize-y rounded-2xl border border-input bg-card p-5 font-mono text-sm leading-relaxed outline-none focus:shadow-[0_0_0_3px_hsl(var(--primary)/.25)]" data-testid="input-script" />
            )}
            {j.kind === "video" && script && (
              <p className={cn("mt-1 text-right font-mono text-[11px]", overLimit ? "text-destructive" : "text-muted-foreground")} data-testid="text-script-count">
                {script.length} / 2500 · сценарий уходит в Kling как промпт
              </p>
            )}
          </section>
          {j.status === "completed" && j.videoUrl && (
            <section className="game-panel rounded-2xl p-5 sm:p-6">
              <h2 className="eyebrow text-primary">03 / Видео</h2>
              <video src={j.videoUrl} controls playsInline className={cn("mt-2 max-h-[70vh] rounded-2xl bg-foreground", j.format === "16:9" ? "w-full" : "mx-auto")} data-testid="video-player" />
              <p className="mt-2 text-xs text-muted-foreground">Ссылка Kling действует около 30 дней. Скачайте ролик, если он нужен надолго — в Drive сохраняется только сценарий и ссылка.</p>
            </section>
          )}
          <div className="flex items-center gap-3">
            <button onClick={save} disabled={!dirty || update.isPending} className="inline-flex items-center gap-2 rounded-xl bg-sidebar px-5 py-3 text-sm text-sidebar-foreground transition-colors hover:bg-primary disabled:opacity-30" data-testid="button-save">
              {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Сохранить правки
            </button>
            {dirty && <span className="text-xs text-primary">Есть несохранённые изменения</span>}
          </div>
        </div>

        <aside className="space-y-4 self-start xl:sticky xl:top-8">
          <div className="rounded-2xl border border-cyan-200/20 bg-sidebar p-5 text-sidebar-foreground">
            <span className="eyebrow text-cyan-300">ПАНЕЛЬ ДЕЙСТВИЙ</span>
            <h3 className="font-display mt-2 text-sm">Следующий шаг</h3>
            <div className="mt-4 space-y-2">
              {visible.length === 0 && (
                <p className="text-sm text-sidebar-foreground/70" data-testid="text-no-actions">
                  {j.status === "processing" ? "Kling собирает видео. Страница обновляется сама." : "Для этого статуса действий нет."}
                </p>
              )}
              {visible.map((a) => {
                const disabled = !!a.blocked || busy;
                const running = run.isPending && run.variables?.data.action === a.key;
                return (
                  <div key={a.key}>
                    <button
                      onClick={() => act(a.key, a.done)}
                      disabled={disabled}
                      data-testid={`button-action-${a.key}`}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:translate-x-0.5",
                        a.primary ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-sidebar-accent",
                      )}
                    >
                      {running ? <Loader2 className="h-4 w-4 animate-spin" /> : a.blocked ? <Lock className="h-4 w-4" /> : <a.icon className="h-4 w-4" />}
                      {a.label}
                    </button>
                    {a.blocked && <p className="mt-1 px-1 text-[11px] text-sidebar-foreground/60" data-testid={`text-blocked-${a.key}`}>{a.blocked}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {(j.videoUrl || j.driveUrl) && (
            <div className="game-panel space-y-2 rounded-2xl p-5">
              {j.videoUrl && <a href={j.videoUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between text-sm hover:text-primary" data-testid="link-video">Открыть видео <ExternalLink className="h-4 w-4" /></a>}
              {j.driveUrl && <a href={j.driveUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between text-sm hover:text-primary" data-testid="link-drive">Сценарий в Google Drive <ExternalLink className="h-4 w-4" /></a>}
            </div>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 px-4 py-3 text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors" data-testid="button-delete">
                <Trash2 className="h-4 w-4" /> Удалить задачу
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display">Удалить «{j.title}»?</AlertDialogTitle>
                <AlertDialogDescription>Бриф и сценарий исчезнут из студии. Файлы, уже отправленные в Drive, останутся там.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-delete">Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground" data-testid="button-confirm-delete">
                  {del.isPending ? "Удаляем..." : "Удалить"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </aside>
      </div>
    </AppShell>
  );
}
