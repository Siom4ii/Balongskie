import { getState, updateState } from "./storage.js";
import { formatCurrency, generateId } from "./utils.js";
import { openModal } from "./modal.js";

export function initServices() {
  renderServices();
  document
    .getElementById("addServiceBtn")
    .addEventListener("click", () => openServiceForm());
}

/* ---------------------------------------------------------
   RENDER SERVICES TABLE
--------------------------------------------------------- */
function renderServices() {
  const tbody = document.getElementById("services-table-body");
  const { services } = getState();
  tbody.innerHTML = "";

  if (!services.length) {
    const tr = document.createElement("tr");
    tr.className = "empty-row";
    tr.innerHTML = '<td colspan="4">No services configured</td>';
    tbody.appendChild(tr);
    return;
  }

  services.forEach((s) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${s.name}</td>
      <td>${s.duration || 0} min</td>
      <td>${formatCurrency(s.price || 0)}</td>
      <td>
        <button class="icon-btn" data-action="edit">✎</button>
        <button class="icon-btn" data-action="delete">🗑</button>
      </td>
    `;

    tr.querySelector('[data-action="edit"]').addEventListener("click", () =>
      openServiceForm(s.id)
    );
    tr.querySelector('[data-action="delete"]').addEventListener("click", () =>
      openDeleteServiceConfirm(s.id)
    );

    tbody.appendChild(tr);
  });
}

/* ---------------------------------------------------------
   POPUP: ADD OR EDIT SERVICE
--------------------------------------------------------- */
function openServiceForm(id = null) {
  const { services } = getState();
  const existing = id ? services.find((s) => s.id === id) : null;
  const isEdit = !!existing;

  const formId = "serviceForm";

  openModal({
    title: isEdit ? "Edit Service" : "Add Service",
    size: "md",
    submitLabel: isEdit ? "Save Changes" : "Add Service",
    content: `
      <form id="${formId}" class="modal-form-grid">

        <div class="full">
          <label>Service Name</label>
          <input name="name" type="text" value="${existing?.name || ""}" />
        </div>

        <div>
          <label>Duration (min)</label>
          <input name="duration" type="number" value="${
            existing?.duration || 30
          }" />
        </div>

        <div>
          <label>Price</label>
          <input name="price" type="number" step="0.01" value="${
            existing?.price || 0
          }" />
        </div>

      </form>
    `,
    onSubmit: () => {
      const form = document.getElementById(formId);
      const fd = new FormData(form);

      const name = fd.get("name").trim();
      if (!name) {
        alert("Service name is required.");
        return false; // keep modal open
      }

      const duration = parseInt(fd.get("duration"), 10);
      const price = parseFloat(fd.get("price"));

      const newService = {
        id: isEdit ? existing.id : generateId("svc"),
        name,
        duration: isNaN(duration) ? (existing?.duration || 30) : duration,
        price: isNaN(price) ? (existing?.price || 0) : price,
      };

      updateState((prev) => ({
        ...prev,
        services: isEdit
          ? prev.services.map((s) =>
              s.id === existing.id ? newService : s
            )
          : [...prev.services, newService],
      }));

      renderServices();
    },
  });
}

/* ---------------------------------------------------------
   POPUP: DELETE CONFIRMATION
--------------------------------------------------------- */
function openDeleteServiceConfirm(id) {
  openModal({
    title: "Delete Service?",
    size: "sm",
    submitLabel: "Delete",
    content: `
      <p style="font-size:14px; margin-bottom:10px;">
        Are you sure you want to delete this service?
      </p>
    `,
    onSubmit: () => {
      updateState((prev) => ({
        ...prev,
        services: prev.services.filter((s) => s.id !== id),
      }));
      renderServices();
    },
  });
}
