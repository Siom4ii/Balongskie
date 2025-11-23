import { getState, updateState } from "./storage.js";
import { generateId } from "./utils.js";
import { openModal } from "./modal.js";

export function initBarbers() {
  renderBarbers();
  document
    .getElementById("addBarberBtn")
    .addEventListener("click", () => openBarberForm());
}

/* ---------------------------------------------------------
   RENDER BARBERS TABLE
--------------------------------------------------------- */
function renderBarbers() {
  const tbody = document.getElementById("barbers-table-body");
  const { barbers } = getState();
  tbody.innerHTML = "";

  if (!barbers.length) {
    const tr = document.createElement("tr");
    tr.className = "empty-row";
    tr.innerHTML = '<td colspan="6">No barbers added</td>';
    tbody.appendChild(tr);
    return;
  }

  barbers.forEach((b) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${b.name}</td>
      <td>${b.username}</td>
      <td>${b.contact || ""}</td>
      <td>${b.commissionRate || 0}%</td>
      <td>
        <span class="badge-status badge-status-active">${b.status}</span>
      </td>
      <td>
        <button class="icon-btn" data-action="edit">✎</button>
        <button class="icon-btn" data-action="delete">🗑</button>
      </td>
    `;

    tr.querySelector('[data-action="edit"]').addEventListener("click", () =>
      openBarberForm(b.id)
    );
    tr.querySelector('[data-action="delete"]').addEventListener("click", () =>
      openDeleteBarberConfirm(b.id)
    );

    tbody.appendChild(tr);
  });
}

/* ---------------------------------------------------------
   POPUP: ADD / EDIT BARBER
--------------------------------------------------------- */
function openBarberForm(id = null) {
  const { barbers } = getState();
  const existing = id ? barbers.find((b) => b.id === id) : null;
  const isEdit = !!existing;

  const formId = "barberForm";

  openModal({
    title: isEdit ? "Edit Barber" : "Add Barber",
    size: "md",
    submitLabel: isEdit ? "Save Changes" : "Add Barber",
    content: `
      <form id="${formId}" class="modal-form-grid">
        <div class="full">
          <label>Full Name</label>
          <input name="name" type="text" value="${existing?.name || ""}" />
        </div>

        <div>
          <label>Username</label>
          <input name="username" type="text" value="${
            existing?.username || ""
          }" />
        </div>

        <div>
          <label>Contact</label>
          <input name="contact" type="text" value="${
            existing?.contact || ""
          }" />
        </div>

        <div>
          <label>Commission Rate (%)</label>
          <input name="commissionRate" type="number" step="0.1" value="${
            existing?.commissionRate ?? 40
          }" />
        </div>

        <div>
          <label>Status</label>
          <select name="status">
            <option value="Active" ${
              !existing || existing.status === "Active" ? "selected" : ""
            }>Active</option>
            <option value="Inactive" ${
              existing && existing.status === "Inactive" ? "selected" : ""
            }>Inactive</option>
          </select>
        </div>
      </form>
    `,
    onSubmit: () => {
      const form = document.getElementById(formId);
      const fd = new FormData(form);

      const name = fd.get("name").trim();
      if (!name) {
        alert("Barber name is required.");
        return false; // keep modal open
      }

      let username = fd.get("username").trim();
      if (!username) {
        // auto-generate username if blank
        username = name.toLowerCase().split(" ")[0];
      }

      const commissionRate = parseFloat(fd.get("commissionRate"));
      const newBarber = {
        id: isEdit ? existing.id : generateId("brb"),
        name,
        username,
        contact: fd.get("contact").trim(),
        commissionRate: isNaN(commissionRate)
          ? existing?.commissionRate || 0
          : commissionRate,
        status: fd.get("status") || "Active",
      };

      updateState((prev) => ({
        ...prev,
        barbers: isEdit
          ? prev.barbers.map((b) =>
              b.id === existing.id ? newBarber : b
            )
          : [...prev.barbers, newBarber],
      }));

      renderBarbers();
    },
  });
}

/* ---------------------------------------------------------
   POPUP: DELETE CONFIRMATION
--------------------------------------------------------- */
function openDeleteBarberConfirm(id) {
  openModal({
    title: "Delete Barber?",
    size: "sm",
    submitLabel: "Delete",
    content: `
      <p style="font-size:14px; margin-bottom:10px;">
        Are you sure you want to delete this barber?
      </p>
    `,
    onSubmit: () => {
      updateState((prev) => ({
        ...prev,
        barbers: prev.barbers.filter((b) => b.id !== id),
      }));
      renderBarbers();
    },
  });
}
