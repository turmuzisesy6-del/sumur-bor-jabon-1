import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { isAuthed } from "@/lib/auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppShell({ children, title }: { children: ReactNode; title: string }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (!isAuthed()) {
      navigate({ to: "/" });
    } else {
      setReady(true);
    }
    const d = localStorage.getItem("sumur_bor_dark") === "1";
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
  }, [navigate]);

  const toggleDark = () => {
    const nd = !dark;
    setDark(nd);
    document.documentElement.classList.toggle("dark", nd);
    localStorage.setItem("sumur_bor_dark", nd ? "1" : "0");
  };

  if (!ready) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 shadow-card">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold truncate">{title}</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleDark}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-x-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
