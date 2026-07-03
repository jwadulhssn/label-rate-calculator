import { useRef, useState } from "react";
import type { LabelParams, CalculationResult } from "../types";
import { labelTypes, formatCurrency, formatRate } from "../data";
import { FileText, Printer, Download, X, Loader } from "lucide-react";
import jsPDF from "jspdf";

interface QuoteData {
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  quoteDate: string;
  quoteNumber: string;
}

interface QuoteModalProps {
  params: LabelParams;
  result: CalculationResult;
  quote: QuoteData;
  onClose: () => void;
}

export default function QuoteModal({ params, result, quote, onClose }: QuoteModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const selectedType = labelTypes.find((l) => l.id === params.labelTypeId);
  const variant = selectedType?.variants.find((v) => v.color === params.color);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const content = printRef.current?.innerHTML || "";
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quote #${quote.quoteNumber}</title>
        <style>
          @page { margin: 15mm; size: A4; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 3px solid #4f46e5; }
          .brand h1 { font-size: 28px; }
          .brand p { color: #64748b; font-size: 13px; margin-top: 2px; }
          .quote-meta { text-align: right; }
          .quote-meta h2 { font-size: 22px; color: #4f46e5; margin-bottom: 4px; }
          .quote-meta p { font-size: 13px; color: #64748b; }
          .billing { margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
          .billing h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px; }
          .billing p { font-size: 15px; color: #1e293b; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { text-align: left; padding: 12px 16px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; background: #f1f5f9; border-bottom: 2px solid #e2e8f0; }
          td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid #e2e8f0; }
          td:last-child, th:last-child { text-align: right; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        ${content}
        <script>
          window.onload = function() { window.print(); window.close(); }
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPdf = () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const ml = 20, mr = 20;
      const contentWidth = pw - ml - mr;
      let y = 20;

      function write(str: string, x: number, yPos: number, align: "left" | "center" | "right" = "left") {
        pdf.text(str, x, yPos, { align });
      }
      function setColor(hex: string) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        pdf.setTextColor(r, g, b);
      }

      // Header
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(26);
      setColor("#4f46e5");
      write("LabelPro", ml, y);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      setColor("#64748b");
      write("Premium Label Solutions", ml, y + 6);
      // Right side
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      setColor("#4f46e5");
      write("QUOTE", pw - mr, ml + 2, "right");
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      setColor("#64748b");
      write(`#${quote.quoteNumber}`, pw - mr, ml + 9, "right");
      write(quote.quoteDate, pw - mr, ml + 15, "right");

      y = Math.max(y + 14, 40);
      pdf.setDrawColor("#4f46e5");
      pdf.setLineWidth(0.8);
      pdf.line(ml, y, pw - mr, y);
      y += 10;

      // Bill To
      if (quote.customerName || quote.customerCompany || quote.customerEmail || quote.customerPhone || quote.customerAddress) {
        const billH = quote.customerCompany ? 35 : 30;
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(ml, y, contentWidth, billH, 3, 3, "F");
        pdf.setDrawColor(226, 232, 240);
        pdf.roundedRect(ml, y, contentWidth, billH, 3, 3, "S");
        y += 5;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        setColor("#94a3b8");
        write("BILL TO", ml + 6, y);
        y += 5;
        if (quote.customerName) {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(11);
          setColor("#1e293b");
          write(quote.customerName, ml + 6, y);
          y += 4;
        }
        if (quote.customerCompany) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          setColor("#64748b");
          write(quote.customerCompany, ml + 6, y);
          y += 4;
        }
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        setColor("#64748b");
        const contactLine = [quote.customerEmail, quote.customerPhone].filter(Boolean).join("  |  ");
        if (contactLine) { write(contactLine, ml + 6, y); y += 4; }
        if (quote.customerAddress) { write(quote.customerAddress, ml + 6, y); y += 4; }
        y += 4;
      }

      // Specs
      const specs = [
        { l: "Label Type", v: `${selectedType?.name} - ${params.color}` },
        { l: "Item Code", v: variant?.itemCode ?? "-" },
        { l: "Label Size", v: `${params.width} × ${params.length} mm` },
        { l: "Quantity", v: `${params.qty.toLocaleString()} labels` },
      ];
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      const specW = contentWidth / 2;
      specs.forEach((s, i) => {
        const sx = ml + (i % 2) * specW;
        if (i % 2 === 0) {
          pdf.roundedRect(ml, y, contentWidth, 22, 3, 3, "F");
          pdf.roundedRect(ml, y, contentWidth, 22, 3, 3, "S");
        }
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        setColor("#94a3b8");
        write(s.l.toUpperCase(), sx + 8, y + 6);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        setColor("#1e293b");
        write(s.v, sx + 8, y + 15);
        if (i % 2 === 1) y += 26;
      });
      if (specs.length % 2 === 1) y += 26;
      y += 4;

      // Table header
      const colX = [ml, pw - mr - 75, pw - mr - 45, pw - mr];
      const rowH = 8;
      pdf.setFillColor(241, 245, 249);
      pdf.rect(ml, y, contentWidth, rowH, "F");
      pdf.setDrawColor(226, 232, 240);
      pdf.line(ml, y + rowH, pw - mr, y + rowH);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      setColor("#64748b");
      write("DESCRIPTION", ml + 4, y + 5.5);
      write("QTY", colX[1] + 15, y + 5.5, "right");
      write("RATE", colX[2] + 15, y + 5.5, "right");
      write("AMOUNT", colX[3] - 4, y + 5.5, "right");
      y += rowH;

      function addRow(desc: string, qty: string, rate: string, amt: string) {
        if (y > ph - 30) { pdf.addPage(); y = 20; }
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        setColor("#1e293b");
        write(desc, ml + 4, y + 4);
        setColor("#64748b");
        write(qty, colX[1] + 15, y + 4, "right");
        write(rate, colX[2] + 15, y + 4, "right");
        pdf.setFont("helvetica", "bold");
        setColor("#1e293b");
        write(amt, colX[3] - 4, y + 4, "right");
        y += 7;
        pdf.setDrawColor(241, 245, 249);
        pdf.line(ml, y, pw - mr, y);
        y += 2;
      }

      addRow("Material Cost", params.qty.toLocaleString(), `${formatRate(variant?.labelRate ?? 0)}/mm²`, formatCurrency(result.materialCost));
      if (params.blockQty > 0) addRow("Block Charges", String(params.blockQty), formatCurrency(params.blockRate), formatCurrency(result.blockCharges));
      if (params.colorQty > 0) addRow("Color Process Charges", String(params.colorQty), formatCurrency(params.colorRate), formatCurrency(result.colorCharges));
      if (params.designQty > 0) addRow("Design Charges", String(params.designQty), formatCurrency(params.designRate), formatCurrency(result.designCharges));

      y += 4;

      // Totals
      const totalsX = pw - mr - 90;
      pdf.setDrawColor("#4f46e5");
      pdf.setLineWidth(0.6);
      pdf.line(totalsX, y, pw - mr, y);
      y += 4;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      setColor("#64748b");
      write("Subtotal", totalsX, y);
      pdf.setFont("helvetica", "bold");
      setColor("#1e293b");
      write(formatCurrency(result.totalCost), pw - mr, y, "right");
      y += 6;

      const oneTime = result.blockCharges + result.colorCharges + result.designCharges;
      if (params.blockQty > 0 || params.colorQty > 0 || params.designQty > 0) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        setColor("#94a3b8");
        write("One-time charges", totalsX, y);
        write(formatCurrency(oneTime), pw - mr, y, "right");
        y += 6;
      }

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      setColor("#64748b");
      write("Unit Price", totalsX, y);
      write(`${formatCurrency(result.unitPrice)} / label`, pw - mr, y, "right");
      y += 4;

      pdf.setDrawColor("#4f46e5");
      pdf.setLineWidth(0.8);
      pdf.line(totalsX, y, pw - mr, y);
      y += 4;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      setColor("#4f46e5");
      write("Total Amount", totalsX, y);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      write(formatCurrency(result.totalCost), pw - mr, y, "right");
      y += 10;

      // Roll Info
      if (y > ph - 40) { pdf.addPage(); y = 20; }
      pdf.setFillColor(238, 242, 255);
      pdf.roundedRect(ml, y, contentWidth, 18, 3, 3, "F");
      pdf.setDrawColor(199, 210, 254);
      pdf.roundedRect(ml, y, contentWidth, 18, 3, 3, "S");
      y += 4;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      setColor("#6366f1");
      write("ROLL PRICING", ml + 6, y);
      y += 4;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      setColor("#4338ca");
      write(`Price per 200m roll (${params.width}mm width): ${formatCurrency(result.rollPricePer200m)}`, ml + 6, y);
      const labelsPerRoll = Math.floor(200000 / params.length);
      const rollsNeeded = Math.ceil(params.qty / labelsPerRoll);
      write(`  |  Approx. ${labelsPerRoll.toLocaleString()} labels/roll  |  ${rollsNeeded} roll(s) required`, ml + 100, y);
      y += 6;

      // Footer
      if (y > ph - 30) { pdf.addPage(); y = 20; }
      pdf.setDrawColor(226, 232, 240);
      pdf.line(ml, y, pw - mr, y);
      y += 4;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      setColor("#94a3b8");
      write("This is a computer-generated quote. Terms and conditions apply. Quote valid for 15 days.", pw / 2, y, "center");
      y += 4;
      write("LabelPro  ·  Premium Label Solutions  ·  contact@labelpro.com", pw / 2, y, "center");

      pdf.save(`Quote-${quote.quoteNumber}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("Failed to generate PDF. Please try using Print instead.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Quote Preview</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownloadPdf} disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-all disabled:opacity-50">
              {downloading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {downloading ? "Generating..." : "Download PDF"}
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-xl hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-6 sm:p-8" ref={printRef}>
          <div className="flex justify-between items-start mb-8 pb-6" style={{ borderBottom: "3px solid #4f46e5" }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#4f46e5" }}>LabelPro</h1>
              <p className="text-slate-500 text-sm mt-0.5">Premium Label Solutions</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-indigo-600">QUOTE</h2>
              <p className="text-sm text-slate-500 mt-0.5">#{quote.quoteNumber}</p>
              <p className="text-sm text-slate-500">{quote.quoteDate}</p>
            </div>
          </div>

          {(quote.customerName || quote.customerCompany || quote.customerEmail || quote.customerPhone || quote.customerAddress) && (
            <div className="mb-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Bill To</h3>
              {quote.customerName && <p className="text-base font-semibold text-slate-800">{quote.customerName}</p>}
              {quote.customerCompany && <p className="text-sm text-slate-500">{quote.customerCompany}</p>}
              {quote.customerEmail && <p className="text-sm text-slate-500">{quote.customerEmail}</p>}
              {quote.customerPhone && <p className="text-sm text-slate-500">{quote.customerPhone}</p>}
              {quote.customerAddress && <p className="text-sm text-slate-500">{quote.customerAddress}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              ["Label Type", `${selectedType?.name} - ${params.color}`],
              ["Item Code", variant?.itemCode ?? "-"],
              ["Label Size", `${params.width} × ${params.length} mm`],
              ["Quantity", `${params.qty.toLocaleString()} labels`],
            ].map(([label, value]) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          <table className="w-full mb-6">
            <thead>
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100">Description</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100">Qty</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100">Rate</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3.5 text-sm text-slate-800">Material Cost</td>
                <td className="px-4 py-3.5 text-sm text-right text-slate-600">{params.qty.toLocaleString()}</td>
                <td className="px-4 py-3.5 text-sm text-right text-slate-600">{formatRate(variant?.labelRate ?? 0)}/mm²</td>
                <td className="px-4 py-3.5 text-sm text-right font-medium text-slate-800">{formatCurrency(result.materialCost)}</td>
              </tr>
              {params.blockQty > 0 && (
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3.5 text-sm text-slate-800">Block Charges</td>
                  <td className="px-4 py-3.5 text-sm text-right text-slate-600">{params.blockQty}</td>
                  <td className="px-4 py-3.5 text-sm text-right text-slate-600">{formatCurrency(params.blockRate)}</td>
                  <td className="px-4 py-3.5 text-sm text-right font-medium text-slate-800">{formatCurrency(result.blockCharges)}</td>
                </tr>
              )}
              {params.colorQty > 0 && (
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3.5 text-sm text-slate-800">Color Process Charges</td>
                  <td className="px-4 py-3.5 text-sm text-right text-slate-600">{params.colorQty}</td>
                  <td className="px-4 py-3.5 text-sm text-right text-slate-600">{formatCurrency(params.colorRate)}</td>
                  <td className="px-4 py-3.5 text-sm text-right font-medium text-slate-800">{formatCurrency(result.colorCharges)}</td>
                </tr>
              )}
              {params.designQty > 0 && (
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3.5 text-sm text-slate-800">Design Charges</td>
                  <td className="px-4 py-3.5 text-sm text-right text-slate-600">{params.designQty}</td>
                  <td className="px-4 py-3.5 text-sm text-right text-slate-600">{formatCurrency(params.designRate)}</td>
                  <td className="px-4 py-3.5 text-sm text-right font-medium text-slate-800">{formatCurrency(result.designCharges)}</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="ml-auto w-full sm:w-80 space-y-2 pt-4 mt-2" style={{ borderTop: "2px solid #4f46e5" }}>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>{formatCurrency(result.totalCost)}</span>
            </div>
            {(params.blockQty > 0 || params.colorQty > 0 || params.designQty > 0) && (
              <div className="flex justify-between text-sm text-slate-500">
                <span>One-time charges</span>
                <span>{formatCurrency(result.blockCharges + result.colorCharges + result.designCharges)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-slate-600">
              <span>Unit Price</span>
              <span>{formatCurrency(result.unitPrice)} / label</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-indigo-600 pt-2" style={{ borderTop: "2px solid #4f46e5" }}>
              <span>Total Amount</span>
              <span>{formatCurrency(result.totalCost)}</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-1">Roll Pricing</p>
            <p className="text-sm text-indigo-700">
              Price per 200m roll ({params.width}mm width): <strong>{formatCurrency(result.rollPricePer200m)}</strong>
              &nbsp;·&nbsp; Approx. {Math.floor(200000 / params.length).toLocaleString()} labels per roll
              &nbsp;·&nbsp; ~{Math.ceil(params.qty / Math.floor(200000 / params.length))} roll(s) required
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400">
              This is a computer-generated quote. Terms and conditions apply.
              Quote valid for 15 days from the date of issue.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              LabelPro · Premium Label Solutions · contact@labelpro.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
