import { getState, updateState } from "./storage.js";
import { formatCurrency, generateId, getTodayIso } from "./utils.js";

let cart = [];
let currentTab = "services";

export function initPOS() {
  const searchInput = document.getElementById("pos-search-input");
  const tabServices = document.getElementById("pos-tab-services");
  const tabProducts = document.getElementById("pos-tab-products");
  const checkoutButton = document.getElementById("checkoutButton");
  const discountType = document.getElementById("discountType");
  const discountValue = document.getElementById("discountValue");
  const paymentTypeSelect = document.getElementById("paymentTypeSelect");
  const barberSelect = document.getElementById("posBarberSelect");

  // Populate barber select
  const { barbers } = getState();
  barberSelect.innerHTML = "";
  barbers.forEach((b) => {
    const opt = document.createElement("option");
    opt.value = b.id;
    opt.textContent = b.name;
    barberSelect.appendChild(opt);
  });

  searchInput.addEventListener("input", () => renderCards());

  tabServices.addEventListener("click", () => {
    currentTab = "services";
    tabServices.classList.add("active");
    tabProducts.classList.remove("active");
    renderCards();
  });

  tabProducts.addEventListener("click", () => {
    currentTab = "products";
    tabProducts.classList.add("active");
    tabServices.classList.remove("active");
    renderCards();
  });

  discountType.addEventListener("change", () => updateCartTotals());
  discountValue.addEventListener("input", () => updateCartTotals());
  paymentTypeSelect.addEventListener("change", () => {});

  checkoutButton.addEventListener("click", handleCheckout);

  renderCards();
  renderCart();
}

function renderCards() {
  const { services, products } = getState();
  const grid = document.getElementById("pos-card-grid");
  const search = document
    .getElementById("pos-search-input")
    .value.toLowerCase()
    .trim();

  grid.innerHTML = "";

  const items =
    currentTab === "services"
      ? services.map((s) => ({ type: "service", ...s }))
      : products.map((p) => ({ type: "product", ...p }));

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search)
  );

  if (filtered.length === 0) {
    grid.innerHTML =
      '<div style="font-size:12px;color:#6b7280;">No items found.</div>';
    return;
  }

  filtered.forEach((item) => {
    const card = document.createElement("div");
    card.className = "service-card";
    card.innerHTML = `
      <div class="service-card-title">
        <span class="material-symbols-outlined">${
          item.type === "service" ? "content_cut" : "inventory_2"
        }</span>
        <span>${item.name}</span>
      </div>
      <div class="service-card-price">${formatCurrency(
        item.price || 0
      )}</div>
      <div class="service-card-duration">${
        item.type === "service"
          ? (item.duration || 0) + " min"
          : item.category || ""
      }</div>
    `;
    card.addEventListener("click", () => addToCart(item));
    grid.appendChild(card);
  });
}

function addToCart(item) {
  cart.push({
    id: generateId("cart_item"),
    type: item.type,
    refId: item.id,
    name: item.name,
    price: item.price || 0,
  });
  renderCart();
}

function renderCart() {
  const cartEmpty = document.getElementById("cart-empty");
  const cartContainer = document.getElementById("cart-items");

  if (!cart.length) {
    cartEmpty.classList.remove("hidden");
    cartContainer.innerHTML = "";
  } else {
    cartEmpty.classList.add("hidden");
    cartContainer.innerHTML = "";
    cart.forEach((line) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div class="cart-item-left">
          <span class="cart-item-name">${line.name}</span>
          <span class="cart-item-meta">${formatCurrency(
            line.price
          )}</span>
        </div>
        <div class="cart-item-right">
          <span>${formatCurrency(line.price)}</span>
          <button class="cart-item-remove">Remove</button>
        </div>
      `;
      row
        .querySelector(".cart-item-remove")
        .addEventListener("click", () => {
          cart = cart.filter((c) => c.id !== line.id);
          renderCart();
        });
      cartContainer.appendChild(row);
    });
  }

  updateCartTotals();
}

function updateCartTotals() {
  const discountType = document.getElementById("discountType").value;
  const discountValue = parseFloat(
    document.getElementById("discountValue").value || "0"
  );
  const { settings } = getState();
  const taxRate = settings.taxRate || 0;

  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  let discountAmount = 0;
  if (discountType === "percent") {
    discountAmount = (subtotal * discountValue) / 100;
  } else if (discountType === "amount") {
    discountAmount = discountValue;
  }
  if (discountAmount > subtotal) discountAmount = subtotal;

  const taxable = Math.max(subtotal - discountAmount, 0);
  const tax = (taxable * taxRate) / 100;
  const total = taxable + tax;

  document.getElementById("cart-subtotal").textContent =
    formatCurrency(subtotal);
  document.getElementById("cart-tax").textContent = formatCurrency(tax);
  document.getElementById("cart-total").textContent = formatCurrency(total);
}

function handleCheckout() {
  if (!cart.length) {
    alert("Cart is empty.");
    return;
  }

  const { barbers } = getState();
  const customerName =
    document.getElementById("posCustomerName").value || "Walk-in";
  const barberId = document.getElementById("posBarberSelect").value;
  const barber = barbers.find((b) => b.id === barberId) || barbers[0];
  const paymentType = document.getElementById("paymentTypeSelect").value;
  const discountType = document.getElementById("discountType").value;
  const discountValue = parseFloat(
    document.getElementById("discountValue").value || "0"
  );

  const { settings } = getState();
  const taxRate = settings.taxRate || 0;
  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  let discountAmount = 0;
  if (discountType === "percent") {
    discountAmount = (subtotal * discountValue) / 100;
  } else if (discountType === "amount") {
    discountAmount = discountValue;
  }
  if (discountAmount > subtotal) discountAmount = subtotal;

  const taxable = Math.max(subtotal - discountAmount, 0);
  const tax = (taxable * taxRate) / 100;
  const total = taxable + tax;

  const sale = {
    id: generateId("sale"),
    ticketNumber: "T" + Math.floor(Math.random() * 99999).toString(),
    dateTime: new Date().toISOString(),
    dateIso: getTodayIso(),
    customerName,
    barberId: barber?.id || null,
    barberName: barber?.name || "Unassigned",
    paymentType,
    items: cart.map((c) => ({
      type: c.type,
      refId: c.refId,
      name: c.name,
      price: c.price,
    })),
    subtotal,
    discountType,
    discountValue,
    discountAmount,
    taxable,
    tax,
    total,
  };

  updateState((prev) => {
    const next = { ...prev };
    next.sales = [...prev.sales, sale];

    // Decrease product stock
    sale.items
      .filter((i) => i.type === "product")
      .forEach((itm) => {
        const product = next.products.find((p) => p.id === itm.refId);
        if (product) {
          product.stock = Math.max(0, (product.stock || 0) - 1);
        }
      });

    return next;
  });

  // Dispatch events so dashboard/inventory can update
  window.dispatchEvent(new Event("salesUpdated"));
  window.dispatchEvent(new Event("inventoryUpdated"));

  // Show receipt
  showReceiptModal(sale);

  // Reset cart
  cart = [];
  document.getElementById("posCustomerName").value = "";
  document.getElementById("discountType").value = "none";
  document.getElementById("discountValue").value = "";
  renderCart();
}

function showReceiptModal(sale) {
  const { settings } = getState();
  const modal = document.getElementById("receiptModal");
  const content = document.getElementById("receiptContent");
  const closeBtn = document.getElementById("receiptClose");
  const printBtn = document.getElementById("printReceiptButton");

  content.innerHTML = buildReceiptHTML(sale, settings);

  modal.classList.remove("hidden");

  closeBtn.onclick = () => {
    modal.classList.add("hidden");
  };

  printBtn.onclick = () => {
    window.print();
  };
}

function buildReceiptHTML(sale, settings) {
  const lines = [];

  const header = settings.receiptHeader || settings.shopName;
  const footer = settings.receiptFooter || "";

  lines.push(centerText(header.toUpperCase()));
  if (settings.shopAddress) lines.push(centerText(settings.shopAddress));
  if (settings.shopPhone) lines.push(centerText(settings.shopPhone));
  lines.push(repeat("-", 32));
  lines.push(`Ticket: ${sale.ticketNumber}`);
  lines.push(`Date: ${new Date(sale.dateTime).toLocaleString()}`);
  lines.push(`Customer: ${sale.customerName}`);
  lines.push(`Barber: ${sale.barberName}`);
  lines.push(repeat("-", 32));
  lines.push("ITEM                 AMT");

  sale.items.forEach((item) => {
    const name = item.name.substring(0, 16);
    const amt = formatCurrency(item.price).padStart(10, " ");
    lines.push(name.padEnd(20, " ") + amt);
  });

  lines.push(repeat("-", 32));
  lines.push(
    `Subtotal:         ${formatCurrency(sale.subtotal).padStart(10, " ")}`
  );
  if (sale.discountAmount) {
    lines.push(
      `Discount:        -${formatCurrency(sale.discountAmount).padStart(
        9,
        " "
      )}`
    );
  }
  lines.push(
    `Tax:              ${formatCurrency(sale.tax).padStart(10, " ")}`
  );
  lines.push(
    `Total:            ${formatCurrency(sale.total).padStart(10, " ")}`
  );
  lines.push(repeat("-", 32));
  if (footer) lines.push(centerText(footer));

  return `<pre>${lines.join("\n")}</pre>`;
}

function centerText(str) {
  const width = 32;
  const pad = Math.max(0, Math.floor((width - str.length) / 2));
  return " ".repeat(pad) + str;
}

function repeat(ch, n) {
  return new Array(n + 1).join(ch);
}
