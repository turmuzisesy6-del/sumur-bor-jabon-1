import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Droplets, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { portalLoginToken } from "@/lib/portal.functions";
import { setPortalId } from "@/lib/portal-session";

export const Route = createFileRoute("/p/$token")({
  head: () => ({
    meta: [
      { title: "Masuk Portal Pelanggan — Sumur Bor Jabon 1" },
      { name: "description", content: "Tautan pribadi pelanggan Sumur Bor Jabon 1 untuk melihat tagihan air dan struk pembayaran." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Masuk Portal Pelanggan — Sumur Bor Jabon 1" },
      { property: "og:description", content: "Tautan pribadi pelanggan untuk melihat tagihan air dan struk pembayaran." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PortalTokenLogin,
});

function PortalTokenLogin() {
  const { token } = Route.useParams();
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    portalLoginToken({ data: { token } })
      .then((res) => {
        if (!alive) return;
        if (res.ok) {
          setPortalId(res.id);
          toast.success("✅ Login berhasil");
          navigate({ to: "/portal/beranda" });
        } else {
          toast.error("❌ Tautan tidak valid atau sudah kedaluwarsa");
          navigate({ to: "/portal" });
        }
      })
      .catch(() => {
        if (!alive) return;
        toast.error("❌ Gagal terhubung ke server");
        navigate({ to: "/portal" });
      });
    return () => { alive = false; };
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="text-center text-white">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm shadow-elegant">
          <Droplets className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">SUMUR BOR JABON 1</h1>
        <p className="text-white/85 text-sm mt-1">Portal Pelanggan</p>
        <div className="mt-8 flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-white/80" />
          <p className="text-white/80 text-sm">Membuka portal Anda...</p>
        </div>
      </div>
    </div>
  );
}
