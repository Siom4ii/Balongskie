import { getState, updateState } from "./storage.js";
import { formatCurrency, generateId } from "./utils.js";
import { openModal, closeModal } from "./modal.js";

export function initInventory() {
  renderInventory();

  document
    .getElementById("addProductBtn")
    .addEventListener("click", () => openProductForm());

  window.addEventListener("inventoryUpdated", renderInventory);
}

function renderInventory() {
  const tbody = document.getElementById("inventory-table-body");
  const { products } = getState();
  tbody.innerHTML = "";

  if (!products.length) {
    const tr = document.createElement("tr");
    tr.className = "empty-row";
    tr.innerHTML = '<td colspan="7">No products yet</td>';
    tbody.appendChild(tr);
    return;
  }

  products.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>${p.sku || ""}</td>
      <td>${p.category || ""}</td>
      <td>${formatCurrency(p.price || 0)}</td>
      <td>
        ${
          (p.stock || 0) <= 5
            ? `<span class="badge badge-low">${p.stock || 0} - Low</span>`
            : p.stock || 0
        }
      </td>
      <td>${p.supplier || ""}</td>
      <td>
        <button class="icon-btn" data-action="edit">✎</button>
        <button class="icon-btn" data-action="delete">🗑</button>
      </td>
    `;

    tr.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () =>
        handleProductAction(btn.dataset.action, p.id)
      );
    });

    tbody.appendChild(tr);
  });

  window.dispatchEvent(new Event("lowStockUpdated"));
}

function handleProductAction(action, id) {
  if (action === "edit") return openProductForm(id);
  if (action === "delete") return openDeleteConfirm(id);
}

/* ---------------------------------------------------------
    POPUP: Add / Edit Product
--------------------------------------------------------- */
function openProductForm(id = null) {
  const { products } = getState();
  const product = id ? products.find((p) => p.id === id) : null;

  const isEdit = !!product;
  const formId = "productForm";

  openModal({
    title: isEdit ? "Edit Product" : "Add Product",
    submitLabel: isEdit ? "Save Changes" : "Add Product",
    size: "md",
    content: `
      <form id="${formId}" class="modal-form-grid">
        <div class="full">
          <label>Product Name</label>
          <input name="name" type="text" value="${product?.name || ""}" />
        </div>

        <div>
          <label>SKU</label>
          <input name="sku" type="text" value="${product?.sku || ""}" />
        </div>

        <div>
          <label>Category</label>
          <input name="category" type="text" value="${product?.category || ""}" />
        </div>

        <div>
          <label>Price</label>
          <input name="price" type="number" step="0.01" value="${product?.price ?? ""}" />
        </div>

        <div>
          <label>Stock</label>
          <input name="stock" type="number" value="${product?.stock ?? ""}" />
        </div>

        <div class="full">
          <label>Supplier</label>
          <input name="supplier" type="text" value="${product?.supplier || ""}" />
        </div>
      </form>
    `,
    onSubmit: () => {
      const form = document.getElementById(formId);
      const formData = new FormData(form);

      const name = formData.get("name").trim();
      if (!name) {
        alert("Product name is required.");
        return false;
      }

      const newProduct = {
        id: isEdit ? product.id : generateId("prd"),
        name,
        sku: formData.get("sku").trim(),
        category: formData.get("category").trim(),
        price: parseFloat(formData.get("price")) || 0,
        stock: parseInt(formData.get("stock"), 10) || 0,
        supplier: formData.get("supplier").trim(),
      };

      updateState((prev) => ({
        ...prev,
        products: isEdit
          ? prev.products.map((p) => (p.id === product.id ? newProduct : p))
          : [...prev.products, newProduct],
      }));

      window.dispatchEvent(new Event("inventoryUpdated"));
    },
  });
}

/* ---------------------------------------------------------
    POPUP: Delete Confirmation
--------------------------------------------------------- */
function openDeleteConfirm(id) {
  openModal({
    title: "Delete Product?",
    size: "sm",
    submitLabel: "Delete",
    content: `
      <p style="font-size:14px; margin-bottom:10px;">
        Are you sure you want to delete this product?
      </p>
    `,
    onSubmit: () => {
      updateState((prev) => ({
        ...prev,
        products: prev.products.filter((p) => p.id !== id),
      }));
      window.dispatchEvent(new Event("inventoryUpdated"));
    },
  });
}
