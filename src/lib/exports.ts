import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportExcel(filename: string, rows: any[], sheetName = "Data") {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

export function exportPDF(
  title: string,
  columns: string[],
  rows: (string | number)[][],
  filename: string,
) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("SUMUR BOR JABON 1", 14, 15);
  doc.setFontSize(11);
  doc.text(title, 14, 22);
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 28,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 100, 200] },
  });
  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
