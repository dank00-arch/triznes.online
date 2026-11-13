import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Image, Download, Loader2, Sparkles } from "lucide-react";
import {
  useListImages, useCreateImage, useGenerateImage, useGetFarmSession,
  getListImagesQueryKey, type ImageInputFormat, type ImageInputModel, type FarmImage,
} from "@workspace/api-client-react";
import { AppShell, PageHead, ErrorPanel, Pulse } from "@/components/farm-ui";
import { errorMessage, formatDate } from "@/lib/farm";

const formats: ImageInputFormat[] = ["1:1", "16:9", "9:16"];
const status: Record<FarmImage["status"], string> = {
  draft: "Черновик", processing: "Создаётся", completed: "Готово", failed: "Не удалось создать", interrupted: "Прервано",
};

export default function ImagesPage() {
  const qc = useQueryClient();
  const list = useListImages({ query: { queryKey: getListImagesQueryKey(), refetchInterval: 15000 } });
  const session = useGetFarmSession();
  const create = useCreateImage();
  const generate = useGenerateImage();
  const pending = useRef(false);
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [format, setFormat] = useState<ImageInputFormat>("1:1");
  const [model, setModel] = useState<ImageInputModel>("gemini-3.1-flash-image");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: getListImagesQueryKey() });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (pending.current || !title.trim() || prompt.trim().length < 10 || prompt.length > 2000) return;
    pending.current = true;
    setMessage("");
    try {
      await create.mutateAsync({ data: { title: title.trim(), prompt: prompt.trim(), format, model } });
      setTitle(""); setPrompt("");
      await refresh();
      setMessage("Творение сохранено. Для платной генерации нажмите «Создать изображение» в галерее.");
    } catch (err) { setMessage(errorMessage(err)); }
    finally { pending.current = false; }
  }

  async function start(image: FarmImage) {
    if (pending.current || image.status !== "draft" || !session.data?.owner) return;
    if (!window.confirm(`Запустить платную генерацию Gemini (${image.model === "gemini-3-pro-image" ? "Pro — более дорогая модель" : "Flash"})? Будет списан один шаг дневного лимита. Один черновик отправляется только один раз, даже при ошибке сети. Проверьте описание перед подтверждением.`)) return;
    pending.current = true; setBusyId(image.id); setMessage("");
    try {
      await generate.mutateAsync({ id: image.id });
      setMessage("Изображение готово и сохранено в галерее.");
    } catch (err) { setMessage(`${errorMessage(err)} Проверьте галерею: повторная отправка этого творения заблокирована.`); }
    finally { pending.current = false; setBusyId(null); await refresh(); }
  }

  async function download(image: FarmImage) {
    if (!image.imageUrl) return;
    try {
      const response = await fetch(image.imageUrl, { credentials: "include", cache: "no-store" });
      if (!response.ok) throw new Error(`Не удалось загрузить файл (${response.status}).`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${image.title.replace(/[\\/:*?"<>|]/g, "_").slice(0, 80)}.${blob.type === "image/jpeg" ? "jpg" : blob.type === "image/webp" ? "webp" : "png"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { setMessage(errorMessage(err)); }
  }

  return <AppShell>
    <PageHead kicker="творческая студия / изображения" title="Изображения" />
    <p className="mb-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">Создавайте изображение из текста через Gemini. Пока доступны только текстовые описания — загрузки референсов нет. Внешность или личность человека по одному тексту не сохраняется.</p>
    <form onSubmit={save} className="game-panel mb-12 grid max-w-3xl gap-5 rounded-2xl p-6">
      <h2 className="font-display text-lg">Новое творение</h2>
      <label className="grid gap-2 text-sm font-semibold">Название <input value={title} onChange={e => setTitle(e.target.value)} maxLength={120} required placeholder="Например: Город будущего" className="rounded-xl border border-input bg-card px-4 py-3 outline-none focus:border-primary" /></label>
      <label className="grid gap-2 text-sm font-semibold">Описание кадра
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} minLength={10} maxLength={2000} rows={5} required placeholder="Опишите объекты, освещение, стиль и настроение..." className="resize-y rounded-xl border border-input bg-card px-4 py-3 outline-none focus:border-primary" />
        <span className="text-xs font-normal text-muted-foreground">{prompt.length}/2000 символов · минимум 10</span>
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">Формат кадра<select value={format} onChange={e => setFormat(e.target.value as ImageInputFormat)} className="rounded-xl border border-input bg-card px-4 py-3">{formats.map(f => <option key={f} value={f}>{f}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-semibold">Модель<select value={model} onChange={e => setModel(e.target.value as ImageInputModel)} className="rounded-xl border border-input bg-card px-4 py-3"><option value="gemini-3.1-flash-image">Gemini 3.1 Flash Image · по умолчанию</option><option value="gemini-3-pro-image">Gemini 3 Pro Image · дороже</option></select></label>
      </div>
      {model === "gemini-3-pro-image" && <p className="rounded-xl border border-amber-500/40 bg-amber-100/40 p-3 text-sm text-amber-900">Внимание: Pro — платная модель с более высокой стоимостью. Выбор и запуск подтверждаются отдельно.</p>}
      <p className="text-xs text-muted-foreground">Сохранение черновика бесплатно. Запуск генерации отдельно подтверждается и может тарифицироваться провайдером.</p>
      <button disabled={create.isPending || !title.trim() || prompt.trim().length < 10} className="w-fit rounded-xl bg-sidebar px-5 py-3 text-sm font-semibold text-sidebar-foreground disabled:opacity-50">{create.isPending ? "Сохраняем..." : "Сохранить творение"}</button>
    </form>
    <h2 className="font-display mb-5 text-xl">Галерея творений</h2>
    {message && <div role="status" className="mb-5 rounded-xl border border-primary/30 bg-secondary/40 p-4 text-sm">{message}</div>}
    {list.isLoading ? <div className="grid gap-5 md:grid-cols-2">{[1, 2].map(x => <Pulse key={x} className="h-64" />)}</div> :
      list.isError ? <ErrorPanel message={errorMessage(list.error)} onRetry={() => list.refetch()} /> :
      !list.data?.length ? <div className="game-panel rounded-2xl p-12 text-center text-muted-foreground"><Image className="mx-auto mb-3 h-9 w-9" />Создайте первое творение — оно появится здесь и останется после перезагрузки.</div> :
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{list.data.map(image => <article key={image.id} className="game-panel overflow-hidden rounded-2xl">
        {image.imageUrl ? <a href={image.imageUrl} target="_blank" rel="noreferrer" title="Открыть изображение"><img src={image.imageUrl} alt={image.title} className="aspect-square w-full bg-secondary object-contain" loading="lazy" /></a> : <div className="flex aspect-video items-center justify-center bg-secondary/50"><Image className="h-10 w-10 text-primary/40" /></div>}
        <div className="grid gap-3 p-5"><div className="flex items-start justify-between gap-3"><h3 className="font-display text-sm">{image.title}</h3><span className="shrink-0 rounded-full bg-secondary px-2 py-1 text-xs text-primary">{status[image.status]}</span></div>
          <p className="line-clamp-3 text-sm text-muted-foreground">{image.prompt}</p>
          <p className="text-xs text-muted-foreground">{image.format} · {image.model === "gemini-3-pro-image" ? "Pro" : "Flash"} · {formatDate(image.createdAt)}</p>
          {image.error && <p className="text-sm text-destructive">{image.error}</p>}
          {image.status === "draft" && <button type="button" onClick={() => start(image)} disabled={!session.data?.owner || !!busyId} className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busyId === image.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{busyId === image.id ? "Генерируем..." : "Создать изображение · платно"}</button>}
          {image.status === "draft" && !session.data?.owner && <p className="text-xs text-muted-foreground">Генерация доступна только владельцу фермы.</p>}
          {image.imageUrl && <button type="button" onClick={() => download(image)} className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary"><Download className="h-4 w-4" /> Скачать</button>}
        </div>
      </article>)}</div>}
  </AppShell>;
}