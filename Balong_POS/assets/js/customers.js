import { getState, updateState } from "./storage.js";
import { generateId } from "./utils.js";
import { openModal } from "./modal.js";

export function initCustomers() {
  renderCustomers();
  document
    .getElementById("addCustomerBtn")
    .addEventListener("click", () => openCustomerForm());
}

function renderCustomers() {
  const tbody = document.getElementById("customers-table-body");
  const { customers } = getState();
  tbody.innerHTML = "";

  if (!customers.length) {
    const tr = document.createElement("tr");
    tr.className = "empty-row";
    tr.innerHTML = '<td colspan="5">No customers yet</td>';
    tbody.appendChild(tr);
    return;
  }

  customers.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.name}</td>
      <td>${c.phone || ""}</td>
      <td>${c.email || ""}</td>
      <td>${c.notes || ""}</td>
      <td>
        <button class="icon-btn" data-action="edit">✎</button>
        <button class="icon-btn" data-action="delete">🗑</button>
      </td>
    `;

    tr.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () =>
        handleCustomerAction(btn.dataset.action, c.id)
      );
    });

    tbody.appendChild(tr);
  });
}

function handleCustomerAction(action, id) {
  if (action === "edit") return openCustomerForm(id);
  if (action === "delete") return openDeleteCustomerConfirm(id);
}

/* ---------------------------------------------------------
   POPUP: Add / Edit Customer
--------------------------------------------------------- */
function openCustomerForm(id = null) {
  const { customers } = getState();
  const existing = id ? customers.find((c) => c.id === id) : null;
  const isEdit = !!existing;
  const formId = "customerForm";

  openModal({
    title: isEdit ? "Edit Customer" : "Add Customer",
    submitLabel: isEdit ? "Save Changes" : "Add Customer",
    size: "md",
    content: `
      <form id="${formId}" class="modal-form-grid">
        <div class="full">
          <label>Customer Name</label>
          <input name="name" type="text" value="${existing?.name || ""}" />
        </div>

        <div>
          <label>Phone</label>
          <input name="phone" type="text" value="${existing?.phone || ""}" />
        </div>

        <div>
          <label>Email</label>
          <input name="email" type="email" value="${existing?.email || ""}" />
        </div>

        <div class="full">
          <label>Notes</label>
          <input name="notes" type="text" value="${existing?.notes || ""}" />
        </div>
      </form>
    `,
    onSubmit: () => {
      const form = document.getElementById(formId);
      const formData = new FormData(form);

      const name = formData.get("name").trim();
      if (!name) {
        alert("Customer name is required.");
        return false; // keep modal open
      }

      const newCustomer = {
        id: isEdit ? existing.id : generateId("cus"),
        name,
        phone: formData.get("phone").trim(),
        email: formData.get("email").trim(),
        notes: formData.get("notes").trim(),
      };

      updateState((prev) => ({
        ...prev,
        customers: isEdit
          ? prev.customers.map((c) =>
              c.id === existing.id ? newCustomer : c
            )
          : [...prev.customers, newCustomer],
      }));

      renderCustomers();
    },
  });
}

/* ---------------------------------------------------------
   POPUP: Delete Customer Confirm
--------------------------------------------------------- */
function openDeleteCustomerConfirm(id) {
  openModal({
    title: "Delete Customer?",
    size: "sm",
    submitLabel: "Delete",
    content: `
      <p style="font-size:14px; margin-bottom:10px;">
        Are you sure you want to delete this customer?
      </p>
    `,
    onSubmit: () => {
      updateState((prev) => ({
        ...prev,
        customers: prev.customers.filter((c) => c.id !== id),
      }));
      renderCustomers();
    },
  });
}
