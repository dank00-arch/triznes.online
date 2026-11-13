import { useMemo } from "react";
import { Link } from "wouter";
import { ExternalLink, Library } from "lucide-react";
import { useListJobs } from "@workspace/api-client-react";
import { AppShell, PageHead, StatusPill, FormatGlyph, ErrorPanel, Pulse } from "@/components/farm-ui";
import { errorMessage, formatDate, kindLabel } from "@/lib/farm";

export default function LibraryPage() {
  const jobs = useListJobs();
  const items = useMemo(
    () => (jobs.data ?? []).filter((j) => j.status === "completed" || ((j.status === "approved" || j.status === "script_ready") && j.script.trim())),
    [jobs.data],
  );

  return (
    <AppShell>
      <PageHead kicker="библиотека" title="Готовые сценарии и ролики" />
      {jobs.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">{[0, 1, 2, 3].map((i) => <Pulse key={i} className="h-52" />)}</div>
      ) : jobs.isError ? (
        <ErrorPanel message={errorMessage(jobs.error)} onRetry={() => jobs.refetch()} />
      ) : items.length === 0 ? (
        <div className="game-panel dotgrid rounded-2xl p-10 text-center sm:p-16" data-testid="empty-library">
          <Library className="mx-auto mb-5 h-9 w-9 text-primary" />
          <h3 className="font-display text-xl">Полка пока пустая</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">Сюда попадают задачи с готовым сценарием и завершённые ролики.</p>
          <Link href="/studio" className="mt-6 inline-block rounded-xl bg-sidebar px-5 py-3 text-sm text-sidebar-foreground hover:bg-primary transition-colors" data-testid="link-to-studio">В студию</Link>
        </div>
      ) : (
        <div className="columns-1 gap-4 md:columns-2 xl:columns-3">
          {items.map((j, i) => (
            <article key={j.id} className="game-panel rise lift mb-4 break-inside-avoid rounded-2xl p-6" style={{ animationDelay: `${i * 50}ms` }} data-testid={`card-library-${j.id}`}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground"><FormatGlyph format={j.format} /> {kindLabel[j.kind]} · {formatDate(j.createdAt)}</span>
                <StatusPill status={j.status} />
              </div>
              <Link href={`/jobs/${j.id}`} className="font-display mt-4 block text-lg hover:text-primary" data-testid={`link-library-${j.id}`}>{j.title}</Link>
              <p className="mt-3 line-clamp-6 whitespace-pre-line font-mono text-xs leading-relaxed text-muted-foreground">{j.script}</p>
              {(j.videoUrl || j.driveUrl) && (
                <div className="mt-4 flex gap-4 border-t border-border pt-4 text-sm">
                  {j.videoUrl && <a href={j.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-primary" data-testid={`link-video-${j.id}`}>Видео <ExternalLink className="h-3 w-3" /></a>}
                  {j.driveUrl && <a href={j.driveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-primary" data-testid={`link-drive-${j.id}`}>Drive <ExternalLink className="h-3 w-3" /></a>}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}
