import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { portalData } from "./portal.functions";
import { getPortalId, clearPortalId, readCache, writeCache } from "./portal-session";

export interface Pelanggan {
  id: string; nama: string; no_hp: string | null; foto_url: string | null;
  alamat: string | null; nomor_pelanggan: string | null; status_aktif: boolean;
  created_at: string;
}
export interface Tagihan {
  id: string; tanggal: string; meter_lama: number; meter_baru: number; pemakaian: number;
  tarif: number; beban: number; total: number; status: string;
}
export interface Pengaturan {
  nama_sumur: string | null; nama_petugas: string | null; no_hp_petugas: string | null;
  tarif: number | null; beban: number | null; email: string | null; website: string | null;
}
export interface Pengajuan {
  id: string; nama_lama: string | null; no_hp_lama: string | null;
  nama_baru: string | null; no_hp_baru: string | null;
  status: string; alasan_penolakan: string | null; created_at: string;
}
export interface PortalPayload {
  pelanggan: Pelanggan; tagihan: Tagihan[]; pengaturan: Pengaturan | null; pengajuan: Pengajuan | null;
}

export function usePortal() {
  const navigate = useNavigate();
  const [data, setData] = useState<PortalPayload | null>(() => readCache<PortalPayload>());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const mounted = useRef(true);

  const load = useCallback(async (silent = false) => {
    const id = getPortalId();
    if (!id) { navigate({ to: "/portal" }); return; }
    if (!silent) setRefreshing(true);
    try {
      const res = await portalData({ data: { id } });
      if (!mounted.current) return;
      if (!res.ok) { clearPortalId(); navigate({ to: "/portal" }); return; }
      const payload = res as unknown as PortalPayload;
      setData(payload);
      writeCache(payload);
    } catch {
      /* offline: pakai cache */
    } finally {
      if (mounted.current) { setLoading(false); setRefreshing(false); }
    }
  }, [navigate]);

  useEffect(() => {
    mounted.current = true;
    load(true);
    const t = setInterval(() => load(true), 20000);
    const onFocus = () => load(true);
    window.addEventListener("focus", onFocus);
    return () => { mounted.current = false; clearInterval(t); window.removeEventListener("focus", onFocus); };
  }, [load]);

  return { data, loading, refreshing, refresh: () => load(false) };
}
