import { getState } from "./storage.js";
import { formatCurrency, getTodayIso, groupBy, sumBy } from "./utils.js";

export function initAnalytics() {
  updateDashboard();
  updateAnalytics();

  window.addEventListener("salesUpdated", () => {
    updateDashboard();
    updateAnalytics();
  });

  window.addEventListener("lowStockUpdated", () => {
    updateDashboard();
  });
}

export function updateDashboard() {
  const { sales, products } = getState();
  const todayIso = getTodayIso();
  const todaySales = sales.filter((s) => s.dateIso === todayIso);

  const todayRevenue = sumBy(todaySales, (s) => s.total);
  const todayTickets = todaySales.length;
  const totalTickets = sales.length;
  const totalRevenue = sumBy(sales, (s) => s.total);
  const avgTicket = totalTickets ? totalRevenue / totalTickets : 0;

  // Commissions (simple: 40% of each sale for now)
  const commissionsTotal = sumBy(sales, (s) => s.total * 0.4);
  const commissionsNet = totalRevenue - commissionsTotal;

  document.getElementById("stat-today-revenue").textContent =
    formatCurrency(todayRevenue);
  document.getElementById("stat-today-tickets").textContent =
    todayTickets + " tickets";
  document.getElementById("stat-total-tickets").textContent = totalTickets;
  document.getElementById("stat-average-ticket").textContent =
    "Avg " + formatCurrency(avgTicket);
  document.getElementById("stat-commissions-total").textContent =
    formatCurrency(commissionsTotal);
  document.getElementById("stat-commissions-net").textContent =
    "Net " + formatCurrency(commissionsNet);

  // Top services today
  const tbodyServices = document.getElementById("top-services-body");
  tbodyServices.innerHTML = "";
  const serviceSales = todaySales.flatMap((s) =>
    s.items.filter((i) => i.type === "service")
  );
  if (!serviceSales.length) {
    const tr = document.createElement("tr");
    tr.className = "empty-row";
    tr.innerHTML = '<td colspan="3">No services sold today</td>';
    tbodyServices.appendChild(tr);
  } else {
    const grouped = groupBy(serviceSales, (i) => i.name);
    Object.keys(grouped).forEach((name) => {
      const list = grouped[name];
      const qty = list.length;
      const total = sumBy(list, (i) => i.price);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${name}</td>
        <td>${qty}</td>
        <td>${formatCurrency(total)}</td>
      `;
      tbodyServices.appendChild(tr);
    });
  }

  // Revenue by payment type
  const tbodyPay = document.getElementById("revenue-payment-body");
  tbodyPay.innerHTML = "";
  if (!todaySales.length) {
    const tr = document.createElement("tr");
    tr.className = "empty-row";
    tr.innerHTML = '<td colspan="3">No sales today</td>';
    tbodyPay.appendChild(tr);
  } else {
    const grouped = groupBy(todaySales, (s) => s.paymentType || "other");
    Object.keys(grouped).forEach((p) => {
      const list = grouped[p];
      const tickets = list.length;
      const total = sumBy(list, (s) => s.total);
      const tr = document.createElement("tr");
      const label =
        p === "cash" ? "Cash" : p === "gcash" ? "GCash" : "Card/Other";
      tr.innerHTML = `
        <td>${label}</td>
        <td>${tickets}</td>
        <td>${formatCurrency(total)}</td>
      `;
      tbodyPay.appendChild(tr);
    });
  }

  // Low stock alerts
  const lowList = document.getElementById("low-stock-list");
  lowList.innerHTML = "";
  const lowProducts = products.filter((p) => (p.stock || 0) <= 5);
  if (!lowProducts.length) {
    const li = document.createElement("li");
    li.className = "list-item";
    li.innerHTML = `<span>No low stock items 🎉</span>`;
    lowList.appendChild(li);
  } else {
    lowProducts.forEach((p) => {
      const li = document.createElement("li");
      li.className = "list-item";
      li.innerHTML = `
        <span>${p.name}</span>
        <span class="badge badge-low">${p.stock || 0} left</span>
      `;
      lowList.appendChild(li);
    });
  }
}

function updateAnalytics() {
  const { sales, barbers } = getState();

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const last7 = sales.filter(
    (s) => new Date(s.dateTime) >= sevenDaysAgo && new Date(s.dateTime) <= now
  );
  const last7Revenue = sumBy(last7, (s) => s.total);

  document.getElementById("analytics-7day-revenue").textContent =
    formatCurrency(last7Revenue);

  // Top barber (all time)
  const groupBarber = groupBy(
    sales,
    (s) => s.barberId || s.barberName || "none"
  );
  let topBarber = "N/A";
  let topBarberTotal = 0;
  Object.keys(groupBarber).forEach((id) => {
    const total = sumBy(groupBarber[id], (s) => s.total);
    if (total > topBarberTotal) {
      topBarberTotal = total;
      const barber =
        barbers.find((b) => b.id === id) || { name: groupBarber[id][0].barberName };
      topBarber = (barber && barber.name) || "Unknown";
    }
  });
  document.getElementById("analytics-top-barber").textContent =
    topBarber + (topBarberTotal ? " – " + formatCurrency(topBarberTotal) : "");

  // Top service (all time)
  const allServiceItems = sales.flatMap((s) =>
    s.items.filter((i) => i.type === "service")
  );
  const groupService = groupBy(allServiceItems, (i) => i.name);
  let topService = "N/A";
  let topServiceTotal = 0;
  Object.keys(groupService).forEach((name) => {
    const total = sumBy(groupService[name], (i) => i.price);
    if (total > topServiceTotal) {
      topServiceTotal = total;
      topService = name;
    }
  });
  document.getElementById("analytics-top-service").textContent =
    topService +
    (topServiceTotal ? " – " + formatCurrency(topServiceTotal) : "");
}
