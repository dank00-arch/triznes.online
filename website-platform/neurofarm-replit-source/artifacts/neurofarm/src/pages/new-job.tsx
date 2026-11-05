import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import {
  useCreateJob, getListJobsQueryKey, getGetFarmOverviewQueryKey,
  type JobInputKind, type JobInputFormat,
} from "@workspace/api-client-react";
import { AppShell, PageHead, FormatGlyph } from "@/components/farm-ui";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/farm";
import { cn } from "@/lib/utils";

const formats: { v: JobInputFormat; label: string }[] = [
  { v: "9:16", label: "Вертикаль — Reels, Shorts" },
  { v: "16:9", label: "Горизонталь — YouTube" },
  { v: "1:1", label: "Квадрат — лента" },
];

export default function NewJob() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const create = useCreateJob();
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [kind, setKind] = useState<JobInputKind>("video");
  const [format, setFormat] = useState<JobInputFormat>("9:16");
  const valid = title.trim().length > 0 && brief.trim().length >= 10;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    create.mutate(
      { data: { title: title.trim(), brief: brief.trim(), kind, format } },
      {
        onSuccess: (job) => {
          qc.invalidateQueries({ queryKey: getListJobsQueryKey() });
          qc.invalidateQueries({ queryKey: getGetFarmOverviewQueryKey() });
          toast({ title: "Творение сохранено" });
          setLocation(`/jobs/${job.id}`);
        },
        onError: (err) => toast({ title: "Не удалось создать", description: errorMessage(err), variant: "destructive" }),
      },
    );
  };

  return (
    <AppShell>
      <PageHead kicker="ваша жизнь как кино" title="Какую историю расскажем?" />
      <p className="mb-8 max-w-2xl leading-relaxed text-muted-foreground">Расскажите о себе, своём мастерстве или мечте. Можно начать с одного настоящего момента: как вы строите дом, готовите блюдо или впервые выходите на сцену. Пока принимается текстовое описание, не файлы с телефона.</p>
      <form onSubmit={submit} className="rise grid max-w-4xl gap-8">
        <div className="game-panel flex items-start gap-4 rounded-2xl p-5"><span className="font-mono text-sm font-semibold text-primary">01 /</span><div><h2 className="font-display text-sm">Начните с настоящего</h2><p className="mt-1 text-sm text-muted-foreground">Бриф сохранится как черновик. Сценарий и видео запускаются отдельно — вы контролируете каждый этап.</p></div></div>
        <label className="block">
          <span className="eyebrow text-primary">02 / Название</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={140}
            placeholder="Например: Я строю дома и мечтаю построить свой"
            className="font-display mt-2 w-full border-b-2 border-input bg-transparent py-4 text-xl outline-none transition-colors focus:border-primary placeholder:text-muted-foreground/50 sm:text-2xl"
            data-testid="input-title"
          />
        </label>
        <label className="block">
          <span className="eyebrow text-primary">03 / Бриф</span>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={8}
            placeholder="Кто вы? Что создаёте? Какой момент своей жизни хотите показать? Что должен почувствовать зритель? Укажите реальные детали, настроение и пожелания. Отдельно отметьте, какие сцены можно придумать с ИИ."
            className="mt-2 w-full resize-y rounded-2xl border border-input bg-card p-5 leading-relaxed outline-none transition-shadow focus:shadow-[0_0_0_3px_hsl(var(--primary)/.25)]"
            data-testid="input-brief"
          />
          <span className="mt-1 block text-right font-mono text-[11px] text-muted-foreground">{brief.length} симв. {brief.trim().length < 10 && "· минимум 10"}</span>
        </label>

        <div>
          <span className="eyebrow text-primary">04 / Что на выходе</span>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(["text", "video"] as JobInputKind[]).map((k) => (
              <button
                type="button"
                key={k}
                onClick={() => setKind(k)}
                data-testid={`option-kind-${k}`}
                className={cn("lift rounded-2xl border-2 p-5 text-left transition-colors", kind === k ? "border-primary bg-sidebar text-sidebar-foreground" : "border-border bg-card hover:border-primary")}
              >
                <div className="font-display">{k === "text" ? "Только сценарий" : "Сценарий и видео"}</div>
                <div className="mt-1 text-sm opacity-70">{k === "text" ? "Gemini пишет текст, вы правите и одобряете." : "После одобрения сценарий уходит в Kling."}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="eyebrow text-primary">05 / Формат кадра</span>
          <div className="mt-3 flex flex-wrap gap-3">
            {formats.map((f) => (
              <button
                type="button"
                key={f.v}
                onClick={() => setFormat(f.v)}
                data-testid={`option-format-${f.v}`}
                className={cn("flex items-center gap-3 rounded-xl border-2 px-4 py-2.5 text-sm transition-colors", format === f.v ? "border-primary bg-secondary/60 text-foreground" : "border-border bg-card hover:border-primary")}
              >
                <FormatGlyph format={f.v} />
                <span className="font-mono">{f.v}</span>
                <span className="hidden text-muted-foreground sm:inline">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6">
          <button
            type="submit"
            disabled={!valid || create.isPending}
            className="group inline-flex items-center gap-2 rounded-xl bg-sidebar px-7 py-4 font-semibold text-sidebar-foreground transition-colors hover:bg-primary disabled:opacity-40"
            data-testid="button-create-job"
          >
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Сохранить творение
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <span className="text-sm text-muted-foreground">Генерация запускается отдельно, на странице задачи.</span>
        </div>
      </form>
    </AppShell>
  );
}
