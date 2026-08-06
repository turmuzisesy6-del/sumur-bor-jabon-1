import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Receipt, Wallet, CheckCircle2, XCircle,
  Settings, LogOut, Droplets, ScanLine, ClipboardCheck, Smartphone,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const menuUtama = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Pindai Meteran", url: "/pindai", icon: ScanLine },
];
const masterData = [
  { title: "Data Pelanggan", url: "/pelanggan", icon: Users },
  { title: "Tagihan Bulanan", url: "/tagihan", icon: Receipt },
  { title: "Kas", url: "/kas", icon: Wallet },
  { title: "Sudah Bayar", url: "/sudah-bayar", icon: CheckCircle2 },
  { title: "Belum Bayar", url: "/belum-bayar", icon: XCircle },
];
const lain = [
  { title: "Pengajuan Pelanggan", url: "/pengajuan", icon: ClipboardCheck },
  { title: "Portal Pelanggan", url: "/portal", icon: Smartphone },
  { title: "Pengaturan", url: "/pengaturan", icon: Settings },
];


export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();

  const isActive = (u: string) => path === u;
  const cls = (u: string) =>
    isActive(u)
      ? "bg-gradient-primary text-primary-foreground font-medium shadow-elegant"
      : "hover:bg-sidebar-accent";

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  const Group = ({ label, items }: { label: string; items: typeof menuUtama }) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((it) => (
            <SidebarMenuItem key={it.url}>
              <SidebarMenuButton asChild>
                <Link to={it.url} className={cls(it.url)}>
                  <it.icon className="h-4 w-4" />
                  {!collapsed && <span>{it.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-elegant">
            <Droplets className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight">SUMUR BOR</span>
              <span className="text-xs text-muted-foreground leading-tight">JABON 1</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <Group label="Menu Utama" items={menuUtama} />
        <Group label="Master Data" items={masterData} />
        <Group label="Lainnya" items={lain} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <Button variant="ghost" size="sm" onClick={handleLogout} className="justify-start">
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Keluar</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
