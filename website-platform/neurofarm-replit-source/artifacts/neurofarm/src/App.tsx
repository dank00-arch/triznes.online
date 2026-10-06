import { useEffect, useRef, type ReactNode } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from "wouter";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Mark } from "@/components/farm-ui";
import { FarmAuthProvider, useFarmAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Studio from "@/pages/studio";
import JobDetail from "@/pages/job-detail";
import NewJob from "@/pages/new-job";
import LibraryPage from "@/pages/library";
import SettingsPage from "@/pages/settings";
import { MontageList, MontageEditor } from "@/pages/montages";
import ImagesPage from "@/pages/images";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function HomeRedirect() {
  const { loading, isAdmin } = useFarmAuth();
  if (loading) return <div className="p-8 text-center text-sm text-muted-foreground">Проверяем доступ администратора…</div>;
  return isAdmin ? <Redirect to="/studio" /> : <AdminOnlyNotice />;
}

function Protected({ children }: { children: ReactNode }) {
  const { loading, isAdmin } = useFarmAuth();
  if (loading) return <div className="p-8 text-center text-sm text-muted-foreground">Проверяем доступ администратора…</div>;
  return isAdmin ? children : <AdminOnlyNotice />;
}

function AdminOnlyNotice() {
  return <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center"><h1 className="font-display text-xl font-semibold">Доступ только администратору TRIZNES</h1><p className="mt-2 text-sm text-muted-foreground">Войдите в админ-панель сайта в соседней вкладке и откройте Neurofarm повторно.</p><a href="/admin.html" className="mt-4 inline-block rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Открыть админ-панель</a></div>;
}

function AuthQueryClientCacheInvalidator() {
  const { user } = useFarmAuth();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const userId = user?.id ?? null;
    if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) qc.clear();
    prevUserIdRef.current = userId;
  }, [user?.id, qc]);

  return null;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function NeurofarmRoutes() {
  const [, setLocation] = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
        <AuthQueryClientCacheInvalidator />
        <TooltipProvider>
          <RoutedErrorBoundary>
            <Switch>
              <Route path="/" component={HomeRedirect} />
              <Route path="/studio"><Protected><Studio /></Protected></Route>
              <Route path="/new"><Protected><NewJob /></Protected></Route>
              <Route path="/jobs/:id"><Protected><JobDetail /></Protected></Route>
              <Route path="/library"><Protected><LibraryPage /></Protected></Route>
              <Route path="/images"><Protected><ImagesPage /></Protected></Route>
               <Route path="/montages"><Protected><MontageList /></Protected></Route>
               <Route path="/montages/new"><Protected><MontageEditor /></Protected></Route>
               <Route path="/montages/:id"><Protected><MontageEditor /></Protected></Route>
              <Route path="/settings"><Protected><SettingsPage /></Protected></Route>
              <Route component={NotFound} />
            </Switch>
          </RoutedErrorBoundary>
          <Toaster />
        </TooltipProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <FarmAuthProvider>
        <NeurofarmRoutes />
      </FarmAuthProvider>
    </WouterRouter>
  );
}

export default App;
