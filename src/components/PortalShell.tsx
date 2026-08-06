import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, History, User, Settings, Droplets, Moon, Sun, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/portal/beranda", label: "Beranda", icon: Home },
  { to: "/portal/riwayat", label: "Riwayat", icon: History },
  { to: "/portal/profil", label: "Profil", icon: User },
  { to: "/portal/pengaturan", label: "Pengaturan", icon: Settings },
] as const;

export function PortalShell({
  title, children, onRefresh, refreshing,
}: { title: string; children: ReactNode; onRefresh?: () => void; refreshing?: boolean }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const d = localStorage.getItem("sumur_bor_dark") === "1";
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
  }, []);

  const toggleDark = () => {
    const nd = !dark;
    setDark(nd);
    document.documentElement.classList.toggle("dark", nd);
    localStorage.setItem("sumur_bor_dark", nd ? "1" : "0");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-20 bg-gradient-primary text-primary-foreground shadow-elegant">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Droplets className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide opacity-80 leading-tight">Portal Pelanggan</p>
              <h1 className="truncate text-base font-semibold leading-tight">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onRefresh && (
              <Button variant="ghost" size="icon" onClick={onRefresh}
                className="text-primary-foreground hover:bg-white/20">
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={toggleDark}
              className="text-primary-foreground hover:bg-white/20">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 p-4 animate-in fade-in duration-300">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg">
          {nav.map((n) => {
            const active = path === n.to;
            return (
              <Link key={n.to} to={n.to}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] transition-colors ${
                  active ? "text-primary font-semibold" : "text-muted-foreground"
                }`}>
                <n.icon className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`} />
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
