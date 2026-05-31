import QRCode from "qrcode";
import jsPDF from "jspdf";
import type { Booking } from "./api";

export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { width: 400, margin: 1, color: { dark: "#1a0b2e", light: "#ffffff" } });
}

export async function generateTicketPdf(booking: Booking): Promise<string> {
  const qr = await generateQrDataUrl(booking.qr_code);
  const doc = new jsPDF({ unit: "pt", format: "a5", orientation: "landscape" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Background band
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, W, 60, "F");
  doc.setFillColor(236, 72, 153);
  doc.rect(0, H - 30, W, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("STUDENT EVENT PORTAL", 24, 38);

  doc.setTextColor(20, 20, 30);
  doc.setFontSize(22);
  doc.text(booking.event?.title || "Event", 24, 100);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 100);
  const date = booking.event ? new Date(booking.event.date).toLocaleString() : "";
  doc.text(`Date:     ${date}`, 24, 130);
  doc.text(`Venue:    ${booking.event?.location || ""}`, 24, 150);
  doc.text(`Booking:  ${booking.id}`, 24, 170);
  doc.text(`Status:   ${booking.status.toUpperCase()}`, 24, 190);

  doc.addImage(qr, "PNG", W - 180, 80, 150, 150);
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 140);
  doc.text("Scan QR at entry", W - 165, 245);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("Powered by SEP — Have an amazing time!", 24, H - 11);

  return doc.output("dataurlstring");
}

export function downloadPdf(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}
