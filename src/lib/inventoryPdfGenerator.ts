import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CafeSettings } from "@/hooks/useFinanceData";
import { format } from "date-fns";

interface InventoryItemReport {
  name: string;
  category: string;
  unit: string;
  current_stock: number;
  initial_stock: number;
  low_stock_threshold: number;
  cost_price: number;
  sell_price: number;
  total_purchased: number;
  total_sold: number;
}

interface TransactionReport {
  created_at: string;
  item_name: string;
  transaction_type: string;
  quantity: number;
  note: string | null;
}

export function generateInventoryReportPDF(
  items: InventoryItemReport[],
  transactions: TransactionReport[],
  settings: CafeSettings | null
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const now = new Date();

  // Header
  doc.setFillColor(5, 46, 22);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(settings?.cafe_name || "NUNSA HUI Café", pageWidth / 2, 18, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("INVENTORY REPORT", pageWidth / 2, 32, { align: "center" });

  // Generated date
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Generated: ${format(now, "dd MMM yyyy, hh:mm a")}`, pageWidth / 2, 50, { align: "center" });

  // Summary cards
  const summaryY = 58;
  const cardW = 42;
  const cardH = 22;
  const totalItems = items.length;
  const lowStock = items.filter(i => i.current_stock <= i.low_stock_threshold && i.current_stock > 0).length;
  const outOfStock = items.filter(i => i.current_stock === 0).length;
  const totalStockValue = items.reduce((s, i) => s + i.current_stock * i.sell_price, 0);
  const totalCostValue = items.reduce((s, i) => s + i.current_stock * i.cost_price, 0);

  const cards = [
    { label: "Total Items", value: `${totalItems}`, bg: [220, 252, 231], fg: [22, 101, 52] },
    { label: "Low Stock", value: `${lowStock}`, bg: [254, 249, 195], fg: [161, 98, 7] },
    { label: "Out of Stock", value: `${outOfStock}`, bg: [254, 226, 226], fg: [153, 27, 27] },
    { label: "Stock Value", value: `₦${totalStockValue.toLocaleString("en-NG")}`, bg: [219, 234, 254], fg: [29, 78, 216] },
  ];

  cards.forEach((card, i) => {
    const x = 14 + i * (cardW + 4);
    doc.setFillColor(card.bg[0], card.bg[1], card.bg[2]);
    doc.roundedRect(x, summaryY, cardW, cardH, 2, 2, "F");
    doc.setFontSize(8);
    doc.setTextColor(card.fg[0], card.fg[1], card.fg[2]);
    doc.text(card.label, x + cardW / 2, summaryY + 9, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(card.value, x + cardW / 2, summaryY + 18, { align: "center" });
    doc.setFont("helvetica", "normal");
  });

  // Stock Levels Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text("Stock Levels", 14, 92);

  const stockData = items.map(i => {
    const profit = (i.sell_price - i.cost_price) * i.total_sold;
    const margin = i.sell_price > 0 ? ((i.sell_price - i.cost_price) / i.sell_price * 100).toFixed(1) : "0";
    const status = i.current_stock === 0 ? "OUT" : i.current_stock <= i.low_stock_threshold ? "LOW" : "OK";
    return [
      i.name,
      i.category,
      `${i.current_stock} ${i.unit}`,
      `${i.total_purchased}`,
      `${i.total_sold}`,
      `₦${i.cost_price.toLocaleString("en-NG")}`,
      `₦${i.sell_price.toLocaleString("en-NG")}`,
      `${margin}%`,
      `₦${profit.toLocaleString("en-NG")}`,
      status,
    ];
  });

  autoTable(doc, {
    startY: 96,
    head: [["Item", "Category", "Stock", "Bought", "Sold", "Cost", "Price", "Margin", "Profit", "Status"]],
    body: stockData.length > 0 ? stockData : [["No items", "", "", "", "", "", "", "", "", ""]],
    theme: "striped",
    headStyles: { fillColor: [5, 46, 22], fontSize: 7 },
    styles: { fontSize: 7 },
    columnStyles: {
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
      6: { halign: "right" },
      7: { halign: "right" },
      8: { halign: "right" },
    },
  });

  // Profit Summary
  const profitY = (doc as any).lastAutoTable.finalY + 10;
  const totalProfit = items.reduce((s, i) => s + (i.sell_price - i.cost_price) * i.total_sold, 0);
  const totalRevenue = items.reduce((s, i) => s + i.sell_price * i.total_sold, 0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Profit Summary", 14, profitY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Revenue: ₦${totalRevenue.toLocaleString("en-NG")}`, 14, profitY + 8);
  doc.text(`Total Cost of Goods Sold: ₦${(totalRevenue - totalProfit).toLocaleString("en-NG")}`, 14, profitY + 15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 101, 52);
  doc.text(`Gross Profit: ₦${totalProfit.toLocaleString("en-NG")}`, 14, profitY + 22);

  // Transaction History (new page)
  if (transactions.length > 0) {
    doc.addPage();
    doc.setFillColor(5, 46, 22);
    doc.rect(0, 0, pageWidth, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Purchase & Sale History", pageWidth / 2, 17, { align: "center" });

    const txData = transactions.map(tx => [
      format(new Date(tx.created_at), "dd/MM/yyyy HH:mm"),
      tx.item_name,
      tx.transaction_type.charAt(0).toUpperCase() + tx.transaction_type.slice(1),
      `${tx.quantity}`,
      tx.note || "-",
    ]);

    autoTable(doc, {
      startY: 35,
      head: [["Date", "Item", "Type", "Qty", "Note"]],
      body: txData,
      theme: "striped",
      headStyles: { fillColor: [5, 46, 22] },
      styles: { fontSize: 9 },
      columnStyles: { 3: { halign: "right" } },
    });
  }

  // Footer on last page
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `${settings?.cafe_name || "NUNSA HUI Café"} | ${settings?.address || ""} | ${settings?.email || ""}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  doc.save(`Inventory-Report-${format(now, "yyyyMMdd-HHmm")}.pdf`);
}
