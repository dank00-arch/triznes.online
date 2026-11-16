import type { JobStatus } from "@workspace/api-client-react";

export const statusMeta: Record<JobStatus, { label: string; tone: string; step: number }> = {
  draft: { label: "Бриф", tone: "bg-muted text-foreground", step: 0 },
  script_ready: { label: "Сценарий готов", tone: "bg-secondary text-secondary-foreground", step: 1 },
  approved: { label: "Одобрено", tone: "bg-accent text-accent-foreground", step: 2 },
  processing: { label: "Создание", tone: "bg-foreground text-background", step: 3 },
  completed: { label: "Готово", tone: "bg-primary text-primary-foreground", step: 4 },
  failed: { label: "Ошибка", tone: "bg-destructive text-destructive-foreground", step: -1 },
};

export const kindLabel = { text: "Текст", video: "Видео" } as const;

export function errorMessage(err: unknown, fallback = "Что-то пошло не так"): string {
  if (!err) return fallback;
  const e = err as { data?: { error?: string }; message?: string };
  return e.data?.error || e.message || fallback;
}

export function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  } catch {
    return iso;
  }
}
