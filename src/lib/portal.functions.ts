import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Ambil digit saja */
function digits(v: string): string {
  return (v || "").replace(/\D/g, "");
}

/** Normalisasi nomor HP Indonesia -> hanya digit, awalan 62 dibuang jadi 0 */
function normHp(v: string): string {
  let d = digits(v);
  if (d.startsWith("62")) d = "0" + d.slice(2);
  if (d && !d.startsWith("0")) d = "0" + d;
  return d;
}

/** Cocok jika sama persis (digit), sama setelah normalisasi, atau salah satu akhiran yang lain */
function hpMatch(input: string, stored: string): boolean {
  const a = digits(input);
  const b = digits(stored);
  if (!a || !b) return false;
  if (a === b) return true;
  if (normHp(a) === normHp(b)) return true;
  const na = normHp(a).replace(/^0+/, "");
  const nb = normHp(b).replace(/^0+/, "");
  if (na && nb && na === nb) return true;
  if (a.length >= 8 && b.length >= 8 && (a.endsWith(b) || b.endsWith(a))) return true;
  return false;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function findPelangganByHp(hp: string) {
  const db = await admin();
  const target = digits(hp);
  if (target.length < 3) return null;
  const { data, error } = await db.from("pelanggan").select("*");
  if (error) throw error;
  const rows = data || [];
  return (
    rows.find((p) => digits(p.no_hp || "") === target) ??
    rows.find((p) => hpMatch(target, p.no_hp || "")) ??
    null
  );
}

/** Login pelanggan hanya dengan nomor HP */
export const portalLogin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ no_hp: z.string().min(4).max(30) }).parse(d))
  .handler(async ({ data }) => {
    const p = await findPelangganByHp(data.no_hp);
    if (!p) return { ok: false as const };
    return { ok: true as const, id: p.id as string };
  });

/** Semua data yang dibutuhkan portal pelanggan */
export const portalData = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();

    const { data: pelanggan, error: e1 } = await db
      .from("pelanggan").select("*").eq("id", data.id).maybeSingle();
    if (e1) throw e1;
    if (!pelanggan) return { ok: false as const };

    const { data: tagihan } = await db
      .from("tagihan").select("*").eq("pelanggan_id", data.id).order("tanggal", { ascending: false });

    const { data: pengaturan } = await db
      .from("pengaturan").select("nama_sumur, nama_petugas, no_hp_petugas, tarif, beban, email, website")
      .eq("id", 1).maybeSingle();

    const { data: pengajuan } = await db
      .from("pengajuan_perubahan").select("*").eq("pelanggan_id", data.id)
      .order("created_at", { ascending: false }).limit(1);

    return {
      ok: true as const,
      pelanggan,
      tagihan: tagihan || [],
      pengaturan: pengaturan || null,
      pengajuan: pengajuan?.[0] ?? null,
    };
  });

/** Kirim pengajuan perubahan data (tidak mengubah data pelanggan langsung) */
export const portalAjukanPerubahan = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      nama_baru: z.string().trim().min(1).max(100),
      no_hp_baru: z.string().trim().min(6).max(30),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin();

    const { data: p } = await db.from("pelanggan").select("*").eq("id", data.id).maybeSingle();
    if (!p) return { ok: false as const, error: "Pelanggan tidak ditemukan" };

    const { data: pending } = await db
      .from("pengajuan_perubahan").select("id").eq("pelanggan_id", data.id)
      .eq("status", "menunggu").limit(1);
    if (pending && pending.length > 0) {
      return { ok: false as const, error: "Masih ada pengajuan yang menunggu persetujuan" };
    }

    const { error } = await db.from("pengajuan_perubahan").insert({
      pelanggan_id: data.id,
      nama_lama: p.nama,
      no_hp_lama: p.no_hp,
      nama_baru: data.nama_baru,
      no_hp_baru: data.no_hp_baru,
      status: "menunggu",
    });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

/** Login pelanggan lewat tautan unik (token) */
export const portalLoginToken = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ token: z.string().min(10).max(64) }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: p } = await db
      .from("pelanggan").select("id").eq("akses_token", data.token).maybeSingle();
    if (!p) return { ok: false as const };
    return { ok: true as const, id: p.id as string };
  });
