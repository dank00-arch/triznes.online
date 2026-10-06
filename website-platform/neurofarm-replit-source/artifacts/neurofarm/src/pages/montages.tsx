import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Clapperboard, ExternalLink, GripVertical, Loader2, Plus, Trash2 } from "lucide-react";
import {
  useListMontages, useGetMontage, useCreateMontage, useUpdateMontage, useRenderMontage, useGetFarmSession,
  getListMontagesQueryKey, getGetMontageQueryKey,
  type MontageInputFormat, type Montage,
} from "@workspace/api-client-react";
import { AppShell, PageHead, ErrorPanel, Pulse } from "@/components/farm-ui";
import { errorMessage, formatDate } from "@/lib/farm";
import { useToast } from "@/hooks/use-toast";

const statusLabel: Record<Montage["status"], string> = {
  draft: "Черновик", submitting: "Отправка · исход неизвестен", processing: "Рендерится",
  completed: "Готово", failed: "Ошибка рендера",
};
const formats: MontageInputFormat[] = ["16:9", "9:16", "1:1"];
type ClipForm = { url: string; seek: string; duration: string };
const blank = (): ClipForm => ({ url: "", seek: "0", duration: "5" });

export function MontageList() {
  const list = useListMontages();
  return <AppShell>
    <PageHead kicker="видеостудия / монтаж" title="Монтажная">
      <Link href="/montages/new" className="inline-flex items-center gap-2 rounded-xl bg-sidebar px-5 py-3 font-semibold text-sidebar-foreground hover:bg-primary">
        <Plus className="h-4 w-4" /> Новое творение
      </Link>
    </PageHead>
    <div className="mb-8 rounded-2xl border border-primary/25 bg-secondary/30 p-5 text-sm leading-relaxed text-muted-foreground">
      Соедините публичные HTTPS-видео по порядку. Черновик сохраняется без оплаты. Только владелец может отдельно запустить платный рендер JSON2Video. Готовый MP4 — внешняя ссылка провайдера, долговременное хранение не гарантируется.
    </div>
    {list.isLoading ? <Pulse className="h-40" /> : list.isError ? <ErrorPanel message={errorMessage(list.error)} onRetry={() => list.refetch()} /> :
      !list.data?.length ? <div className="game-panel rounded-2xl p-10 text-center"><Clapperboard className="mx-auto h-10 w-10 text-primary" /><h2 className="font-display mt-5 text-lg">Пока нет монтажей</h2><p className="mt-2 text-sm text-muted-foreground">Начните с видеоклипа и сохраните первое творение.</p></div> :
        <div className="grid gap-3">{list.data.map(item => <Link key={item.id} href={`/montages/${item.id}`} className="game-panel group flex flex-wrap items-center gap-4 rounded-2xl p-5 hover:border-primary/50">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary"><Clapperboard className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1"><h2 className="truncate font-display text-sm">{item.title}</h2><p className="mt-1 text-xs text-muted-foreground">{item.clips.length} клип(ов) · {item.format} · {formatDate(item.createdAt)}</p></div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">{statusLabel[item.status]}</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>)}</div>}
  </AppShell>;
}

export function MontageEditor() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const detail = useGetMontage(id ?? "", { query: { queryKey: getGetMontageQueryKey(id ?? ""), enabled: !!id, refetchInterval: query => query.state.data?.status === "processing" ? 15000 : false } });
  const session = useGetFarmSession();
  const create = useCreateMontage();
  const update = useUpdateMontage();
  const render = useRenderMontage();
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState<MontageInputFormat>("16:9");
  const [clips, setClips] = useState<ClipForm[]>([blank()]);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  useEffect(() => {
    if (detail.data && loadedId !== detail.data.id) {
      setTitle(detail.data.title);
      setFormat(detail.data.format);
      setClips(detail.data.clips.map(c => ({ url: c.url, seek: String(c.seek), duration: String(c.duration) })));
      setLoadedId(detail.data.id);
    }
  }, [detail.data, loadedId]);
  const montage = detail.data;
  const editable = !id || montage?.status === "draft";
  const numericClips = clips.map(c => ({ url: c.url.trim(), seek: Number(c.seek), duration: Number(c.duration) }));
  const total = numericClips.reduce((sum, clip) => sum + (Number.isFinite(clip.duration) ? clip.duration : 0), 0);
  const valid = !!title.trim() && title.trim().length <= 120 && clips.length > 0 && clips.length <= 12 &&
    total <= 300 && numericClips.every(c => /^https:\/\/[^/\s]+/i.test(c.url) && Number.isFinite(c.seek) && c.seek >= 0 &&
      Number.isFinite(c.duration) && c.duration > 0 && c.duration <= 120);
  const changeClip = (index: number, key: keyof ClipForm, value: string) =>
    setClips(old => old.map((clip, i) => i === index ? { ...clip, [key]: value } : clip));
  const saved = (data: Montage) => {
    qc.setQueryData(getGetMontageQueryKey(data.id), data);
    qc.invalidateQueries({ queryKey: getListMontagesQueryKey() });
    toast({ title: "Творение сохранено" });
    if (!id) navigate(`/montages/${data.id}`);
  };
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid || !editable) return;
    const data = { title: title.trim(), format, clips: numericClips };
    if (id) update.mutate({ id, data }, { onSuccess: saved, onError: e => toast({ title: "Не удалось сохранить", description: errorMessage(e), variant: "destructive" }) });
    else create.mutate({ data }, { onSuccess: saved, onError: e => toast({ title: "Не удалось сохранить", description: errorMessage(e), variant: "destructive" }) });
  };
  const startRender = () => {
    if (!id || !session.data?.owner || montage?.status !== "draft" || !valid || render.isPending || update.isPending) return;
    const unsaved = title.trim() !== montage.title || format !== montage.format ||
      JSON.stringify(numericClips) !== JSON.stringify(montage.clips);
    if (unsaved) { toast({ title: "Сначала сохраните изменения", variant: "destructive" }); return; }
    if (!window.confirm("Запустить платный рендер JSON2Video? Повторная отправка этого монтажа будет заблокирована даже при сетевой ошибке.")) return;
    render.mutate({ id }, {
      onSuccess: data => {
        qc.setQueryData(getGetMontageQueryKey(id), data);
        qc.invalidateQueries({ queryKey: getListMontagesQueryKey() });
        toast({ title: "Монтаж отправлен на рендер" });
      },
      onError: e => {
        qc.invalidateQueries({ queryKey: getGetMontageQueryKey(id) });
        toast({ title: "Не удалось подтвердить отправку", description: errorMessage(e), variant: "destructive" });
      },
    });
  };
  return <AppShell>
    <Link href="/montages" className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Все монтажи</Link>
    <PageHead kicker="монтаж / творение" title={id ? (montage?.title ?? "Монтаж") : "Новое творение"}>
      {montage && <span className="rounded-full border border-primary/30 bg-secondary px-4 py-2 text-xs font-semibold text-primary">{statusLabel[montage.status]}</span>}
    </PageHead>
    {id && detail.isLoading ? <Pulse className="h-72" /> : id && detail.isError ? <ErrorPanel message={errorMessage(detail.error)} onRetry={() => detail.refetch()} /> :
      <div className="grid max-w-6xl gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <form onSubmit={save} className="space-y-7">
          <div className="game-panel rounded-2xl p-5 sm:p-7">
            <div className="eyebrow text-primary">01 / ПАРАМЕТРЫ</div>
            <label className="mt-6 block text-sm font-semibold">Название творения
              <input value={title} onChange={e => setTitle(e.target.value)} disabled={!editable} maxLength={120} placeholder="Моя история в кадрах" className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-primary disabled:opacity-60" />
            </label>
            <div className="mt-6 text-sm font-semibold">Формат MP4</div>
            <div className="mt-3 flex flex-wrap gap-2">{formats.map(f => <button key={f} type="button" disabled={!editable} onClick={() => setFormat(f)} className={`rounded-xl border px-5 py-3 font-mono text-sm transition-colors ${format === f ? "border-primary bg-primary text-primary-foreground" : "border-input hover:border-primary"}`}>{f}</button>)}</div>
          </div>
          <div>
            <div className="flex items-center justify-between gap-3"><div><div className="eyebrow text-primary">02 / ТАЙМЛАЙН</div><h2 className="font-display mt-2 text-lg">Клипы по порядку</h2></div><span className="font-mono text-sm text-muted-foreground">{total.toFixed(1)} / 300 с</span></div>
            <p className="mt-2 text-sm text-muted-foreground">Только публичные HTTPS-ссылки. Сервис JSON2Video загрузит их для рендера. Максимум 12 клипов, каждый до 120 секунд.</p>
            <div className="mt-5 space-y-3">{clips.map((clip, index) => <div key={index} className="game-panel rounded-2xl p-5">
              <div className="mb-4 flex items-center gap-2"><GripVertical className="h-4 w-4 text-muted-foreground" /><span className="font-mono text-xs font-semibold text-primary">КАДР {String(index + 1).padStart(2, "0")}</span>
                {editable && <div className="ml-auto flex items-center gap-2"><button type="button" disabled={index === 0} onClick={() => setClips(v => { const next = [...v]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; })} className="rounded-lg border border-input px-2 py-1 text-xs disabled:opacity-30">↑</button><button type="button" disabled={index === clips.length - 1} onClick={() => setClips(v => { const next = [...v]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; return next; })} className="rounded-lg border border-input px-2 py-1 text-xs disabled:opacity-30">↓</button><button type="button" disabled={clips.length === 1} onClick={() => setClips(v => v.filter((_, i) => i !== index))} className="rounded-lg p-2 text-destructive disabled:opacity-30" aria-label="Удалить клип"><Trash2 className="h-4 w-4" /></button></div>}
              </div>
              <label className="block text-xs text-muted-foreground">Публичная HTTPS-ссылка на видео<input type="url" required value={clip.url} onChange={e => changeClip(index, "url", e.target.value)} disabled={!editable} placeholder="https://example.com/video.mp4" className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm text-foreground outline-none focus:border-primary disabled:opacity-60" /></label>
              <div className="mt-4 grid grid-cols-2 gap-4"><label className="text-xs text-muted-foreground">Начало · секунды<input type="number" min="0" step="any" value={clip.seek} onChange={e => changeClip(index, "seek", e.target.value)} disabled={!editable} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 font-mono text-sm text-foreground" /></label><label className="text-xs text-muted-foreground">Длительность · секунды<input type="number" min="0.01" max="120" step="any" value={clip.duration} onChange={e => changeClip(index, "duration", e.target.value)} disabled={!editable} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 font-mono text-sm text-foreground" /></label></div>
            </div>)}</div>
            {editable && <button type="button" disabled={clips.length >= 12} onClick={() => setClips(v => [...v, blank()])} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/50 py-4 text-sm font-semibold text-primary hover:bg-secondary disabled:opacity-40"><Plus className="h-4 w-4" /> Добавить клип</button>}
          </div>
          {editable && <button type="submit" disabled={!valid || create.isPending || update.isPending} className="inline-flex items-center gap-2 rounded-xl bg-sidebar px-6 py-3 text-sm font-semibold text-sidebar-foreground hover:bg-primary disabled:opacity-40">{(create.isPending || update.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Сохранить черновик</button>}
        </form>
        <aside className="space-y-5">
          <div className="rounded-2xl bg-sidebar p-6 text-sidebar-foreground">
            <div className="eyebrow text-cyan-200">03 / РЕНДЕР</div>
            <h2 className="font-display mt-4 text-base">Финальный фильм</h2>
            <p className="mt-3 text-sm leading-relaxed text-sidebar-foreground/70">Сохранение бесплатно. Рендер оплачивается через JSON2Video и запускается только после вашего подтверждения.</p>
            {montage?.status === "draft" && (session.data?.owner ?
              <button type="button" onClick={startRender} disabled={!valid || render.isPending} className="mt-6 w-full rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-40">{render.isPending ? "Отправка…" : "Запустить платный рендер"}</button> :
              <p className="mt-5 rounded-lg border border-cyan-200/25 p-3 text-xs">Платный рендер доступен только владельцу фермы.</p>)}
            {!montage && <p className="mt-5 text-xs text-sidebar-foreground/70">Сохраните творение, чтобы открыть рендер.</p>}
            {montage?.status === "submitting" && <p className="mt-5 text-sm text-amber-200">Исход отправки не подтверждён. Повторный запуск заблокирован во избежание двойной оплаты. Проверьте проект в JSON2Video.</p>}
            {montage?.status === "processing" && <p className="mt-5 text-sm text-cyan-200">Рендер выполняется у провайдера. Статус обновляется каждые 15 секунд, пока открыта эта страница.</p>}
            {montage?.status === "processing" && montage.error && <p className="mt-3 text-sm text-amber-200">{montage.error}</p>}
            {montage?.status === "failed" && <p className="mt-5 text-sm text-rose-200">{montage.error || "Рендер завершился с ошибкой."} Для нового рендера создайте новый черновик.</p>}
            {montage?.projectId && <p className="mt-5 break-all font-mono text-[11px] text-sidebar-foreground/60">Проект: {montage.projectId}</p>}
          </div>
          {montage?.status === "completed" && montage.videoUrl && <div className="game-panel rounded-2xl p-5">
            <h3 className="font-display text-sm">Готовый MP4</h3>
            <video controls preload="metadata" src={montage.videoUrl} className="mt-4 w-full rounded-lg bg-black" />
            <a href={montage.videoUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 break-all text-sm text-primary underline"><ExternalLink className="h-4 w-4 shrink-0" /> Открыть внешнюю ссылку MP4</a>
            <p className="mt-3 text-xs text-muted-foreground">Файл хранится у провайдера. Долговременная доступность ссылки не гарантируется.</p>
          </div>}
        </aside>
      </div>}
  </AppShell>;
}