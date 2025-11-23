import { getState } from "./storage.js";
import {
  formatCurrency,
  formatDateTime,
  getTodayIso,
  sumBy,
} from "./utils.js";

export function initReports() {
  const dateFromInput = document.getElementById("reportDateFrom");
  const dateToInput = document.getElementById("reportDateTo");
  const paymentSelect = document.getElementById("reportPaymentType");
  const refreshBtn = document.getElementById("reportRefreshBtn");
  const exportBtn = document.getElementById("reportExportBtn");

  // Default: today
  const todayIso = getTodayIso();
  dateFromInput.value = todayIso;
  dateToInput.value = todayIso;

  refreshBtn.addEventListener("click", () => renderReports());
  exportBtn.addEventListener("click", () => exportCSV());

  // Also auto-refresh when filters change
  dateFromInput.addEventListener("change", () => renderReports());
  dateToInput.addEventListener("change", () => renderReports());
  paymentSelect.addEventListener("change", () => renderReports());

  // When POS adds a new sale, auto refresh if user is on Reports
  window.addEventListener("salesUpdated", () => renderReports());

  renderReports();
}

function getFilteredSales() {
  const { sales } = getState();
  const dateFrom = document.getElementById("reportDateFrom").value;
  const dateTo = document.getElementById("reportDateTo").value;
  const paymentType = document.getElementById("reportPaymentType").value;

  return sales.filter((s) => {
    const saleDate = s.dateIso || s.dateTime?.slice(0, 10);
    if (dateFrom && saleDate < dateFrom) return false;
    if (dateTo && saleDate > dateTo) return false;
    if (paymentType !== "all" && s.paymentType !== paymentType) return false;
    return true;
  });
}

function renderReports() {
  const tbody = document.getElementById("reports-table-body");
  tbody.innerHTML = "";

  const filtered = getFilteredSales();

  if (!filtered.length) {
    const tr = document.createElement("tr");
    tr.className = "empty-row";
    tr.innerHTML = '<td colspan="8">No sales for selected period</td>';
    tbody.appendChild(tr);
  } else {
    filtered
      .slice()
      .sort(
        (a, b) =>
          new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
      )
      .forEach((s) => {
        const tr = document.createElement("tr");
        const paymentLabel =
          s.paymentType === "cash"
            ? "Cash"
            : s.paymentType === "gcash"
            ? "GCash"
            : "Card/Other";

        tr.innerHTML = `
          <td>${formatDateTime(s.dateTime)}</td>
          <td>${s.ticketNumber}</td>
          <td>${s.customerName || "Walk-in"}</td>
          <td>${s.barberName || "-"}</td>
          <td>${paymentLabel}</td>
          <td>${formatCurrency(s.subtotal || 0)}</td>
          <td>${formatCurrency(s.tax || 0)}</td>
          <td>${formatCurrency(s.total || 0)}</td>
        `;
        tbody.appendChild(tr);
      });
  }

  // Summary
  const totalTickets = filtered.length;
  const totalRevenue = sumBy(filtered, (s) => s.total || 0);
  const averageTicket = totalTickets ? totalRevenue / totalTickets : 0;

  document.getElementById("reportTotalTickets").textContent = totalTickets;
  document.getElementById("reportTotalRevenue").textContent =
    formatCurrency(totalRevenue);
  document.getElementById("reportAverageTicket").textContent =
    formatCurrency(averageTicket);
}

function exportCSV() {
  const filtered = getFilteredSales();
  if (!filtered.length) {
    alert("No sales to export for the selected period.");
    return;
  }

  const header = [
    "DateTime",
    "TicketNumber",
    "Customer",
    "Barber",
    "PaymentType",
    "Subtotal",
    "DiscountAmount",
    "Tax",
    "Total",
  ];

  const rows = filtered.map((s) => [
    formatDateTime(s.dateTime),
    s.ticketNumber,
    s.customerName || "Walk-in",
    s.barberName || "",
    s.paymentType || "",
    (s.subtotal || 0).toFixed(2),
    (s.discountAmount || 0).toFixed(2),
    (s.tax || 0).toFixed(2),
    (s.total || 0).toFixed(2),
  ]);

  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  const from = document.getElementById("reportDateFrom").value || "all";
  const to = document.getElementById("reportDateTo").value || "all";
  link.download = `balong-sales-${from}-to-${to}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
