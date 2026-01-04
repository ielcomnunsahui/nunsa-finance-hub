import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { IncomeRecord, ExpenseRecord, CafeSettings } from "@/hooks/useFinanceData";
import { format, startOfMonth, endOfMonth } from "date-fns";

interface ReceiptData {
  receiptNumber: string;
  amount: number;
  category: string;
  description?: string;
  date: Date;
  recordedBy: string;
}

interface UserSalaryData {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  monthly_income: number;
  estimated_salary: number;
}

export function generateReceiptPDF(data: ReceiptData, settings: CafeSettings | null): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(5, 46, 22); // Emerald dark
  doc.rect(0, 0, pageWidth, 45, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(settings?.cafe_name || "NUNSA HUI Café", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(settings?.address || "Al-Hikmah University, Ilorin", pageWidth / 2, 30, { align: "center" });
  doc.text(`Tel: ${settings?.phone || "N/A"} | Email: ${settings?.email || "N/A"}`, pageWidth / 2, 38, { align: "center" });
  
  // Receipt Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT RECEIPT", pageWidth / 2, 60, { align: "center" });
  
  // Receipt Details
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  const startY = 75;
  const leftMargin = 25;
  const rightMargin = pageWidth - 25;
  
  // Receipt number and date
  doc.setFont("helvetica", "bold");
  doc.text("Receipt No:", leftMargin, startY);
  doc.setFont("helvetica", "normal");
  doc.text(data.receiptNumber, leftMargin + 35, startY);
  
  doc.setFont("helvetica", "bold");
  doc.text("Date:", rightMargin - 60, startY);
  doc.setFont("helvetica", "normal");
  doc.text(format(data.date, "dd MMM yyyy, hh:mm a"), rightMargin - 60 + 15, startY);
  
  // Horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(leftMargin, startY + 10, rightMargin, startY + 10);
  
  // Amount Box
  doc.setFillColor(240, 253, 244); // Light green
  doc.roundedRect(leftMargin, startY + 20, pageWidth - 50, 35, 3, 3, "F");
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(5, 46, 22);
  doc.text("Amount Received", pageWidth / 2, startY + 32, { align: "center" });
  
  doc.setFontSize(28);
  doc.text(`₦${data.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`, pageWidth / 2, startY + 48, { align: "center" });
  
  // Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  
  const detailsY = startY + 70;
  
  doc.setFont("helvetica", "bold");
  doc.text("Category:", leftMargin, detailsY);
  doc.setFont("helvetica", "normal");
  doc.text(data.category, leftMargin + 30, detailsY);
  
  if (data.description) {
    doc.setFont("helvetica", "bold");
    doc.text("Description:", leftMargin, detailsY + 12);
    doc.setFont("helvetica", "normal");
    doc.text(data.description, leftMargin + 35, detailsY + 12);
  }
  
  doc.setFont("helvetica", "bold");
  doc.text("Recorded By:", leftMargin, detailsY + 24);
  doc.setFont("helvetica", "normal");
  doc.text(data.recordedBy, leftMargin + 38, detailsY + 24);
  
  // Footer
  doc.setDrawColor(200, 200, 200);
  doc.line(leftMargin, 250, rightMargin, 250);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("This is a computer-generated receipt and is valid without signature.", pageWidth / 2, 260, { align: "center" });
  doc.text("Thank you for your patronage!", pageWidth / 2, 268, { align: "center" });
  
  // Save
  doc.save(`Receipt-${data.receiptNumber}.pdf`);
}

interface ReportData {
  income: IncomeRecord[];
  expenses: ExpenseRecord[];
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalExpenses: number;
}

export function generateReportPDF(data: ReportData, settings: CafeSettings | null): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(5, 46, 22);
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(settings?.cafe_name || "NUNSA HUI Café", pageWidth / 2, 18, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("FINANCIAL REPORT", pageWidth / 2, 32, { align: "center" });
  
  // Report Period
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text(
    `Period: ${format(data.startDate, "dd MMM yyyy")} - ${format(data.endDate, "dd MMM yyyy")}`,
    pageWidth / 2,
    50,
    { align: "center" }
  );
  doc.text(`Generated: ${format(new Date(), "dd MMM yyyy, hh:mm a")}`, pageWidth / 2, 58, { align: "center" });
  
  // Summary Cards
  const summaryY = 70;
  const cardWidth = 55;
  const cardHeight = 25;
  
  // Total Income
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(20, summaryY, cardWidth, cardHeight, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(22, 101, 52);
  doc.text("Total Income", 20 + cardWidth / 2, summaryY + 10, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`₦${data.totalIncome.toLocaleString("en-NG")}`, 20 + cardWidth / 2, summaryY + 20, { align: "center" });
  
  // Total Expenses
  doc.setFillColor(254, 226, 226);
  doc.roundedRect(80, summaryY, cardWidth, cardHeight, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(153, 27, 27);
  doc.text("Total Expenses", 80 + cardWidth / 2, summaryY + 10, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`₦${data.totalExpenses.toLocaleString("en-NG")}`, 80 + cardWidth / 2, summaryY + 20, { align: "center" });
  
  // Net Balance
  const netBalance = data.totalIncome - data.totalExpenses;
  const balanceColor = netBalance >= 0 ? [220, 252, 231] : [254, 226, 226];
  const textColor = netBalance >= 0 ? [22, 101, 52] : [153, 27, 27];
  doc.setFillColor(balanceColor[0], balanceColor[1], balanceColor[2]);
  doc.roundedRect(140, summaryY, cardWidth, cardHeight, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("Net Balance", 140 + cardWidth / 2, summaryY + 10, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`₦${Math.abs(netBalance).toLocaleString("en-NG")}`, 140 + cardWidth / 2, summaryY + 20, { align: "center" });
  
  // Income Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text("Income Records", 20, 110);
  
  const incomeData = data.income.map((i) => [
    format(new Date(i.created_at), "dd/MM/yyyy"),
    i.category_name || "N/A",
    i.description || "-",
    `₦${Number(i.amount).toLocaleString("en-NG")}`,
  ]);
  
  autoTable(doc, {
    startY: 115,
    head: [["Date", "Category", "Description", "Amount"]],
    body: incomeData.length > 0 ? incomeData : [["No income records", "", "", ""]],
    theme: "striped",
    headStyles: { fillColor: [5, 46, 22] },
    styles: { fontSize: 9 },
    columnStyles: { 3: { halign: "right" } },
  });
  
  // Expenses Table
  const expenseStartY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Expense Records", 20, expenseStartY);
  
  const expenseData = data.expenses.map((e) => [
    format(new Date(e.created_at), "dd/MM/yyyy"),
    e.category_name || "N/A",
    e.description || "-",
    `₦${Number(e.amount).toLocaleString("en-NG")}`,
  ]);
  
  autoTable(doc, {
    startY: expenseStartY + 5,
    head: [["Date", "Category", "Description", "Amount"]],
    body: expenseData.length > 0 ? expenseData : [["No expense records", "", "", ""]],
    theme: "striped",
    headStyles: { fillColor: [153, 27, 27] },
    styles: { fontSize: 9 },
    columnStyles: { 3: { halign: "right" } },
  });
  
  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `${settings?.cafe_name || "NUNSA HUI Café"} | ${settings?.address || ""} | ${settings?.email || ""}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );
  
  // Save
  doc.save(`Financial-Report-${format(data.startDate, "yyyyMMdd")}-${format(data.endDate, "yyyyMMdd")}.pdf`);
}

export function generateSalaryReportPDF(
  users: UserSalaryData[],
  salaryPercentage: number,
  settings: CafeSettings | null
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  // Header
  doc.setFillColor(5, 46, 22);
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(settings?.cafe_name || "NUNSA HUI Café", pageWidth / 2, 18, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("MONTHLY SALARY REPORT", pageWidth / 2, 32, { align: "center" });
  
  // Report Period
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text(
    `Period: ${format(monthStart, "dd MMM yyyy")} - ${format(monthEnd, "dd MMM yyyy")}`,
    pageWidth / 2,
    50,
    { align: "center" }
  );
  doc.text(`Generated: ${format(now, "dd MMM yyyy, hh:mm a")}`, pageWidth / 2, 58, { align: "center" });
  doc.text(`Salary Percentage: ${salaryPercentage}% of income generated`, pageWidth / 2, 66, { align: "center" });
  
  // Summary Cards
  const summaryY = 78;
  const cardWidth = 55;
  const cardHeight = 25;
  
  const totalMonthlyIncome = users.reduce((sum, u) => sum + u.monthly_income, 0);
  const totalSalaries = users.reduce((sum, u) => sum + u.estimated_salary, 0);
  
  // Total Monthly Income
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(25, summaryY, cardWidth, cardHeight, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(22, 101, 52);
  doc.text("Total Monthly Income", 25 + cardWidth / 2, summaryY + 10, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`₦${totalMonthlyIncome.toLocaleString("en-NG")}`, 25 + cardWidth / 2, summaryY + 20, { align: "center" });
  
  // Total Staff
  doc.setFillColor(219, 234, 254);
  doc.roundedRect(85, summaryY, cardWidth, cardHeight, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(29, 78, 216);
  doc.text("Total Staff", 85 + cardWidth / 2, summaryY + 10, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`${users.length}`, 85 + cardWidth / 2, summaryY + 20, { align: "center" });
  
  // Total Salaries
  doc.setFillColor(254, 249, 195);
  doc.roundedRect(145, summaryY, cardWidth, cardHeight, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(161, 98, 7);
  doc.text("Total Salaries", 145 + cardWidth / 2, summaryY + 10, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`₦${totalSalaries.toLocaleString("en-NG")}`, 145 + cardWidth / 2, summaryY + 20, { align: "center" });
  
  // Salary Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text("Staff Salary Details", 20, 118);
  
  const salaryData = users.map((u) => [
    u.full_name || "No name",
    u.email,
    u.role || "No role",
    `₦${u.monthly_income.toLocaleString("en-NG")}`,
    `₦${u.estimated_salary.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
  ]);
  
  autoTable(doc, {
    startY: 123,
    head: [["Name", "Email", "Role", "Monthly Income", `Salary (${salaryPercentage}%)`]],
    body: salaryData.length > 0 ? salaryData : [["No staff records", "", "", "", ""]],
    theme: "striped",
    headStyles: { fillColor: [5, 46, 22] },
    styles: { fontSize: 9 },
    columnStyles: { 
      3: { halign: "right" },
      4: { halign: "right" },
    },
  });
  
  // Totals row
  const finalY = (doc as any).lastAutoTable.finalY + 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("TOTAL PAYROLL:", 20, finalY + 10);
  doc.setTextColor(22, 101, 52);
  doc.text(`₦${totalSalaries.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`, pageWidth - 20, finalY + 10, { align: "right" });
  
  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `${settings?.cafe_name || "NUNSA HUI Café"} | ${settings?.address || ""} | ${settings?.email || ""}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );
  
  // Save
  doc.save(`Salary-Report-${format(now, "MMMM-yyyy")}.pdf`);
}
