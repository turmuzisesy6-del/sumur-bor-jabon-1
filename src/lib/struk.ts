import jsPDF from "jspdf";
import { rupiah, tanggalID } from "./format";

export interface StrukData {
  namaSumur: string;
  namaPetugas: string;
  hpPetugas: string;
  namaPelanggan: string;
  hpPelanggan: string;
  tanggal: string;
  meterLama: number;
  meterBaru: number;
  pemakaian: number;
  tarif: number;
  beban: number;
  total: number;
}

function drawStruk(d: StrukData): HTMLCanvasElement {
  const w = 480, h = 720;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  // bg gradient
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(1, "#f0f9ff");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

  // header
  ctx.fillStyle = "#1e40af";
  ctx.fillRect(0, 0, w, 90);
  ctx.fillStyle = "#10b981";
  ctx.fillRect(0, 80, w, 10);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 22px Arial";
  ctx.textAlign = "center";
  ctx.fillText(d.namaSumur, w / 2, 40);
  ctx.font = "13px Arial";
  ctx.fillText("STRUK PEMBAYARAN AIR", w / 2, 65);

  // body
  ctx.textAlign = "left";
  ctx.fillStyle = "#1f2937";
  let y = 120;
  const line = (label: string, val: string, bold = false) => {
    ctx.font = "12px Arial";
    ctx.fillStyle = "#6b7280";
    ctx.fillText(label, 30, y);
    ctx.font = bold ? "bold 14px Arial" : "13px Arial";
    ctx.fillStyle = "#111827";
    ctx.textAlign = "right";
    ctx.fillText(val, w - 30, y);
    ctx.textAlign = "left";
    y += 26;
  };

  line("Tanggal", tanggalID(d.tanggal));
  line("Petugas", `${d.namaPetugas} (${d.hpPetugas})`);
  y += 8;
  ctx.strokeStyle = "#e5e7eb"; ctx.beginPath();
  ctx.moveTo(30, y); ctx.lineTo(w - 30, y); ctx.stroke(); y += 20;

  line("Nama Pelanggan", d.namaPelanggan);
  line("No. HP", d.hpPelanggan || "-");
  y += 8;
  ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(w - 30, y); ctx.stroke(); y += 20;

  line("Tarif per M³", rupiah(d.tarif));
  line("Beban", rupiah(d.beban));
  line("Meter Lama", `${d.meterLama} M³`);
  line("Meter Baru", `${d.meterBaru} M³`);
  line("Pemakaian", `${d.pemakaian} M³`);

  y += 10;
  ctx.fillStyle = "#1e40af";
  ctx.fillRect(20, y, w - 40, 60);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 14px Arial";
  ctx.fillText("TOTAL BAYAR", 40, y + 26);
  ctx.textAlign = "right";
  ctx.font = "bold 22px Arial";
  ctx.fillText(rupiah(d.total), w - 40, y + 40);
  ctx.textAlign = "left";
  y += 90;

  ctx.fillStyle = "#6b7280";
  ctx.font = "11px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Terima kasih telah membayar tepat waktu", w / 2, y);
  ctx.fillText("~ SUMUR BOR JABON 1 ~", w / 2, y + 18);

  return c;
}

export function downloadStrukJPG(d: StrukData, filename = "struk.jpg") {
  const c = drawStruk(d);
  const a = document.createElement("a");
  a.href = c.toDataURL("image/jpeg", 0.95);
  a.download = filename;
  a.click();
}

export function downloadStrukPDF(d: StrukData, filename = "struk.pdf") {
  const c = drawStruk(d);
  const img = c.toDataURL("image/jpeg", 0.95);
  const pdf = new jsPDF({ unit: "px", format: [c.width, c.height] });
  pdf.addImage(img, "JPEG", 0, 0, c.width, c.height);
  pdf.save(filename);
}
