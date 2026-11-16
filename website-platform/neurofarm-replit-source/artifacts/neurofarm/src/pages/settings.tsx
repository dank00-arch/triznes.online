import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Users } from "lucide-react";
import {
  useGetFarmSettings, useUpdateFarmSettings, useGetFarmIntegrations, useGetFarmSession,
  getGetFarmSettingsQueryKey, getGetFarmIntegrationsQueryKey, getGetFarmSessionQueryKey,
} from "@workspace/api-client-react";
import { AppShell, PageHead, ErrorPanel, Pulse } from "@/components/farm-ui";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/farm";
import { cn } from "@/lib/utils";

const dot = { connected: "bg-[hsl(150_45%_40%)]", missing: "bg-primary", unavailable: "bg-muted-foreground" } as const;
const word = { connected: "подключено", missing: "не настроено", unavailable: "недоступно" } as const;

export default function SettingsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const settings = useGetFarmSettings();
  const integrations = useGetFarmIntegrations();
  const session = useGetFarmSession();
  const update = useUpdateFarmSettings();
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("10");
  const init = useRef(false);

  useEffect(() => {
    if (settings.data && !init.current) {
      init.current = true;
      setName(settings.data.workspaceName);
      setLimit(String(settings.data.dailyLimit));
    }
  }, [settings.data]);

  const n = Number(limit);
  const validLimit = Number.isInteger(n) && n >= 1 && n <= 100;
  const dirty = !!settings.data && (name !== settings.data.workspaceName || n !== settings.data.dailyLimit);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validLimit || !name.trim()) return;
    update.mutate(
      { data: { workspaceName: name.trim(), dailyLimit: n } },
      {
        onSuccess: (s) => {
          qc.setQueryData(getGetFarmSettingsQueryKey(), s);
          toast({ title: "Настройки сохранены" });
        },
        onError: (err) => toast({ title: "Не сохранилось", description: errorMessage(err), variant: "destructive" }),
      },
    );
  };

  const refresh = () => {
    qc.invalidateQueries({ queryKey: getGetFarmIntegrationsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetFarmSessionQueryKey() });
  };

  return (
    <AppShell>
      <PageHead kicker="настройки" title="Ваша ферма" />
      <div className="grid max-w-5xl gap-10 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-lg">Пространство создания</h2>
          {settings.isLoading ? <Pulse className="mt-4 h-48" /> : settings.isError ? (
            <div className="mt-4"><ErrorPanel message={errorMessage(settings.error)} onRetry={() => settings.refetch()} /></div>
          ) : (
            <form onSubmit={save} className="game-panel mt-4 space-y-5 rounded-2xl p-6">
              <label className="block">
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Название студии</span>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-primary" data-testid="input-workspace-name" />
              </label>
              <label className="block">
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Дневной лимит задач</span>
                <input type="number" min={1} max={100} value={limit} onChange={(e) => setLimit(e.target.value)} className={cn("mt-2 w-32 rounded-xl border bg-background px-4 py-3 font-mono outline-none focus:border-primary", validLimit ? "border-input" : "border-destructive")} data-testid="input-daily-limit" />
                <span className="mt-1 block text-xs text-muted-foreground">От 1 до 100 в день.</span>
              </label>
              <button type="submit" disabled={!dirty || !validLimit || !name.trim() || update.isPending} className="inline-flex items-center gap-2 rounded-xl bg-sidebar px-5 py-3 text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-primary disabled:opacity-40" data-testid="button-save-settings">
                {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Сохранить
              </button>
            </form>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Интеграции</h2>
            <button onClick={refresh} className="text-xs text-muted-foreground hover:text-foreground" data-testid="button-refresh-integrations">Обновить</button>
          </div>
          {integrations.isLoading ? <Pulse className="mt-4 h-48" /> : integrations.isError ? (
            <div className="mt-4"><ErrorPanel message={errorMessage(integrations.error)} onRetry={() => integrations.refetch()} /></div>
          ) : (integrations.data ?? []).length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Сервер не сообщил ни одной интеграции.</p>
          ) : (
            <ul className="game-panel mt-4 divide-y divide-border rounded-2xl">
              {integrations.data!.map((it) => (
                <li key={it.id} className="flex items-start gap-3 p-5" data-testid={`integration-${it.id}`}>
                  <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", dot[it.status])} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{it.name}</span>
                      <span className="font-mono text-[11px] uppercase text-muted-foreground">{word[it.status]}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{it.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lg:col-span-2">
          <h2 className="font-display text-lg">Владелец фермы</h2>
          <div className="mt-4 rounded-2xl bg-sidebar p-6 text-sidebar-foreground" data-testid="panel-owner">
            {session.isLoading ? <Pulse className="h-16 bg-sidebar-accent" /> : session.isError ? (
              <ErrorPanel message={errorMessage(session.error)} onRetry={() => session.refetch()} />
            ) : session.data?.owner ? (
              <p>Вы — владелец. Генерация через Gemini и Kling, монтаж через JSON2Video и экспорт в общий Google Drive доступны вам, если соответствующие ключи подключены. Платный рендер монтажа запускается только после подтверждения.</p>
            ) : (
              <div className="space-y-3 text-sm leading-relaxed text-sidebar-foreground/85">
                <p className="font-semibold text-sidebar-foreground">
                  {session.data?.configured ? "Вы не владелец этой фермы." : "Владелец ещё не назначен."}
                </p>
                <p>Платные действия (Gemini, Kling) и экспорт в общий Google Drive разрешены только одному аккаунту — владельцу. Он задаётся на сервере секретом <code className="rounded bg-sidebar-accent px-1.5 py-0.5 font-mono text-accent">FARM_OWNER_USER_ID</code> — это ID пользователя Clerk.</p>
                <p>Владельца нельзя назначить из интерфейса — кнопки «стать владельцем» нет намеренно. Роль задаёт администратор проекта: после входа он берёт Clerk user ID нужного аккаунта (начинается с <span className="font-mono">user_</span>), сохраняет его в секретах сервера как FARM_OWNER_USER_ID и перезапускает сервер.</p><p>До этого брифы и сценарии можно вести вручную, а генерация видео и сохранение сценария в Drive заблокированы. Ключи Kling и Google тоже задаются только в секретах сервера.</p>
              </div>
            )}
          </div>
        </section>

        <section className="lg:col-span-2">
          <div className="flex items-start gap-4 rounded-2xl border border-dashed border-primary/40 bg-secondary/25 p-6" data-testid="panel-team">
            <Users className="mt-0.5 h-5 w-5" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg">Команда</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] uppercase">недоступно</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Совместное создание не входит в первую версию. Сейчас каждая студия — это один автор и его собственные задачи.</p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
