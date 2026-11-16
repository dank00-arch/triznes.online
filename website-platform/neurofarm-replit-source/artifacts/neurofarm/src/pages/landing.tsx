import { Link } from "wouter";
import { ArrowUpRight, ArrowDown, FileText, Check, Clapperboard, FolderUp, ScanLine, Play, Sparkles } from "lucide-react";
import { Mark } from "@/components/farm-ui";

const steps = [
  { n: "01", icon: FileText, title: "Бриф", text: "Опишите идею своими словами: о чём ролик, для кого, какой тон. Выберите формат — 9:16, 16:9 или 1:1." },
  { n: "02", icon: Check, title: "Сценарий и одобрение", text: "Gemini превращает бриф в сценарий. Вы правите его вручную и одобряете — без вашего «да» дальше ничего не идёт." },
  { n: "03", icon: Clapperboard, title: "Видео", text: "Одобренный сценарий (до 2500 символов) уходит в Kling как промпт. Статус задачи виден в студии, пока ролик собирается." },
  { n: "04", icon: FolderUp, title: "Google Drive", text: "Сценарий и ссылка на ролик сохраняются текстовым файлом в Drive. Само видео — по ссылке Kling, она живёт около 30 дней." },
];

export default function Landing() {
  return (
    <div className="grain min-h-[100dvh] overflow-x-hidden bg-background text-foreground">
      <header className="relative z-20 flex items-center justify-between border-b border-border/70 bg-[hsl(190_60%_99%/.9)] px-4 py-3 backdrop-blur-xl md:px-10">
        <div className="flex items-center gap-3">
          <Mark className="h-11 w-11" />
          <span className="font-display text-[10px] font-semibold leading-tight sm:text-xs">ТРИЗНЕС</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-6 hidden font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground lg:block">Платформа историй / Сочи</span>
          <Link href="/sign-in" className="rounded-xl px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors sm:px-4 sm:text-sm" data-testid="link-signin">Войти</Link>
          <Link href="/sign-up" className="rounded-xl bg-sidebar px-3 py-2.5 text-xs font-semibold text-sidebar-foreground transition-colors hover:bg-primary sm:px-5 sm:text-sm" data-testid="link-signup">Создать студию <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></Link>
        </div>
      </header>

      <section className="hero-world relative isolate flex min-h-[720px] flex-col justify-center overflow-hidden px-5 py-20 text-white sm:px-10 md:min-h-[780px] lg:px-[max(4rem,calc((100vw-1440px)/2))]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[hsl(220_55%_13%/.35)] to-transparent" />
        <div className="relative z-10 max-w-4xl">
          <div className="rise flex items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[.24em] text-cyan-200 sm:text-xs"><span className="h-px w-8 bg-cyan-300" /> ТРИЗНЕС / ЖИЗНЬ КАК КИНО <span className="ml-2 rounded border border-cyan-200/40 px-2 py-1 text-[9px]">01 / НОВАЯ РЕАЛЬНОСТЬ</span></div>
          <h1 className="rise font-display mt-9 text-[clamp(2.65rem,7.1vw,7.5rem)] font-extrabold leading-[1.08] tracking-[-.075em]" style={{ animationDelay: "80ms" }}>
            Ваша жизнь.<br />Ваш талант.<br /><span className="text-[hsl(179_82%_70%)]">Ваше кино.</span>
          </h1>
          <p className="rise mt-8 max-w-xl text-base leading-relaxed text-[hsl(184_63%_95%)] md:text-lg" style={{ animationDelay: "160ms" }}>
            Увидеть себя со стороны. Открыть для себя истории других людей. Заметить свой талант и сделать шаг к мечте. Нейроферма ТРИЗНЕС — пространство создания выразительных роликов из ваших идей и историй. Не нужно быть профессиональным артистом, чтобы стать автором.
          </p>
          <div className="rise mt-10 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <Link href="/sign-up" className="group inline-flex items-center gap-3 rounded-xl bg-[hsl(179_82%_62%)] px-6 py-4 font-semibold text-[hsl(220_55%_13%)] transition-colors hover:bg-[hsl(47_97%_74%)]" data-testid="link-hero-signup">
              Рассказать свою историю
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link href="/sign-in" className="inline-flex items-center rounded-xl border border-white/40 bg-white/5 px-6 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15" data-testid="link-hero-signin">
              У меня уже есть аккаунт
            </Link>
          </div>
        </div>
        <div className="absolute bottom-6 left-5 z-10 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[.2em] text-white/75 sm:left-10"><ArrowDown className="h-4 w-4" /> Исследовать мир</div>
        <div className="absolute bottom-6 right-5 z-10 hidden items-center gap-2 rounded-lg border border-white/25 bg-[hsl(220_55%_13%/.45)] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur-md md:flex"><ScanLine className="h-4 w-4 text-cyan-200" /> Ваш взгляд меняет кадр</div>
      </section>

      <div className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-3 px-5 py-5 font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-muted-foreground sm:grid-cols-3 sm:gap-8">
          <span className="flex items-center gap-3"><Play className="h-4 w-4 text-primary" /> Идея становится сценарием</span>
          <span className="flex items-center gap-3"><Sparkles className="h-4 w-4 text-primary" /> Автор решает, что дальше</span>
          <span className="flex items-center gap-3"><Clapperboard className="h-4 w-4 text-primary" /> История становится видео</span>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-5 py-24 md:py-32">
        <div className="grid gap-12 lg:grid-cols-[.72fr_1fr] lg:gap-20">
          <div className="relative"><span className="chapter-number">01</span><p className="eyebrow relative mt-5 text-primary">ТЫ — ГЛАВНЫЙ ГЕРОЙ</p><h2 className="font-display relative mt-5 text-3xl font-semibold leading-tight md:text-5xl">Не обязательно играть кого-то.<br /><span className="text-primary">Можно показать себя.</span></h2></div>
          <div>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">Строитель снимает, как из замысла появляется дом. Повар — как рождается любимое блюдо. Музыкант — свою первую песню. В каждом ремесле есть мастерство, выбор и живой человек. Для ТРИЗНЕС это достойные истории, а не «обычная жизнь», которую нечего показывать.</p>
          <div className="mt-10 grid gap-3">
            <div className="game-panel rounded-2xl p-5"><span className="eyebrow text-primary">01 / РАКУРС</span><h3 className="font-display mt-2 text-base">Увидеть себя</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Посмотреть на собственный путь со стороны: заметить, что получается, что волнует и куда хочется двигаться.</p></div>
            <div className="game-panel rounded-2xl p-5"><span className="eyebrow text-primary">02 / ВСТРЕЧА</span><h3 className="font-display mt-2 text-base">Открыть других</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Узнавать людей через их истории, учиться друг у друга и снимать с уважением к личным границам и согласию участников.</p></div>
            <div className="game-panel rounded-2xl p-5"><span className="eyebrow text-primary">03 / ГОЛОС</span><h3 className="font-display mt-2 text-base">Проявить талант</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Создавать содержательное, красивое кино, которое помогает показать своё мастерство и найти единомышленников.</p></div>
          </div>
          <div className="mt-10 border-t border-border pt-6">
            <p className="max-w-3xl text-muted-foreground">Изобилие в философии ТРИЗНЕС — стремление к жизни, в которой есть творчество, связи, возможности и пространство для мечты. Съёмка может стать шагом к этому, но сама по себе не гарантирует доход, популярность или исполнение желаний.</p>
          </div>
          </div>
        </div>
      </section>

      <section className="bg-sidebar text-sidebar-foreground">
        <div className="mx-auto max-w-7xl px-5 py-24 md:py-32">
          <p className="eyebrow text-cyan-300">02 / МАРШРУТ СОЗДАНИЯ</p>
          <h2 className="font-display mt-5 max-w-3xl text-3xl font-semibold leading-tight md:text-5xl">От вашей истории к ролику.<br /><span className="text-cyan-300">С вашим участием.</span></h2>
          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-cyan-200/20 bg-cyan-200/20 md:grid-cols-2">
            {steps.map((s) => (
              <div key={s.n} className="group bg-sidebar p-8 transition-colors hover:bg-sidebar-accent md:p-10">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-cyan-300">ЭТАП / {s.n}</span>
                  <s.icon className="h-6 w-6 text-cyan-200/70 transition-transform group-hover:scale-110 group-hover:text-cyan-300" />
                </div>
                <h3 className="font-display mt-8 text-xl">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-sidebar-foreground/75">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-24 md:grid-cols-[.7fr_1fr] md:py-32">
        <div>
          <span className="chapter-number">03</span>
          <p className="eyebrow mt-5 text-primary">БЕЗ ВЫДУМАННЫХ ВОЗМОЖНОСТЕЙ</p>
          <h2 className="font-display mt-4 text-3xl font-semibold md:text-4xl">Честно о первой версии</h2>
        </div>
        <ul className="divide-y divide-border border-y border-border text-sm leading-relaxed text-muted-foreground md:text-base">
          <li className="py-5"><b className="text-foreground">Только текстовый бриф.</b> Загрузки изображений пока нет.</li>
          <li className="py-5"><b className="text-foreground">«Кино жизни» — следующий этап.</b> Загрузка съёмок с телефона и их монтаж с ИИ-сценами пока не доступны. Сейчас можно описать свою историю и создать сценарий и ИИ-видео.</li>
          <li className="py-5"><b className="text-foreground">Платные действия — у владельца.</b> Генерация через Gemini и Kling и экспорт в общий Drive доступны только аккаунту владельца фермы.</li>
          <li className="py-5"><b className="text-foreground">Никакой имитации.</b> Если ключ интеграции не подключён, студия прямо скажет об этом и не покажет выдуманный результат.</li>
          <li className="py-5"><b className="text-foreground">Команды — позже.</b> Сейчас это студия одного автора.</li>
        </ul>
      </section>

      <section className="relative overflow-hidden bg-[hsl(179_69%_84%)] px-5 py-20 text-center md:py-28">
        <div className="absolute inset-0 dotgrid opacity-30" />
        <div className="relative mx-auto max-w-3xl"><p className="eyebrow text-primary">ВАША СЦЕНА ЖДЁТ</p><h2 className="font-display mt-5 text-3xl font-semibold leading-tight md:text-5xl">Не ждите идеального момента.<br />Начните с настоящего.</h2><p className="mx-auto mt-5 max-w-xl text-muted-foreground">Опишите историю своими словами. Вы всегда сможете изменить сценарий, прежде чем он станет видео.</p><Link href="/sign-up" className="mt-8 inline-flex items-center gap-3 rounded-xl bg-sidebar px-7 py-4 font-semibold text-sidebar-foreground transition-transform hover:-translate-y-1" data-testid="link-cta-signup">Открыть студию <ArrowUpRight className="h-4 w-4" /></Link></div>
      </section>
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground">
          <span className="font-display text-xs text-foreground">НЕЙРОФЕРМА ТРИЗНЕС</span>
          <span className="font-mono text-[10px] uppercase tracking-widest">Жизнь как кино / Сочи</span>
          <Link href="/sign-up" className="font-semibold hover:text-primary" data-testid="link-footer-signup">Открыть студию <ArrowUpRight className="inline h-4 w-4" /></Link>
        </div>
      </footer>
    </div>
  );
}
