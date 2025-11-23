import { getState, updateState } from "./storage.js";
import { generateId, getTodayIso } from "./utils.js";
import { openModal } from "./modal.js";

export function initAppointments() {
  renderAppointments();
  renderCalendar();

  document
    .getElementById("addAppointmentBtn")
    .addEventListener("click", () => openAppointmentForm());
}

/* ---------------------------------------------------------
    TABLE RENDERING
--------------------------------------------------------- */
function renderAppointments() {
  const tbody = document.getElementById("appointments-table-body");
  const { appointments, barbers, services } = getState();
  tbody.innerHTML = "";

  if (!appointments.length) {
    const tr = document.createElement("tr");
    tr.className = "empty-row";
    tr.innerHTML = '<td colspan="6">No appointments yet</td>';
    tbody.appendChild(tr);
    return;
  }

  appointments.forEach((a) => {
    const barber = barbers.find((b) => b.id === a.barberId);
    const service = services.find((s) => s.id === a.serviceId);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${a.date}</td>
      <td>${a.time}</td>
      <td>${a.customerName}</td>
      <td>${barber ? barber.name : "-"}</td>
      <td>${service ? service.name : "-"}</td>
      <td>${a.status}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* ---------------------------------------------------------
    7-DAY MINI CALENDAR
--------------------------------------------------------- */
function renderCalendar() {
  const container = document.getElementById("appointments-calendar-grid");
  const { appointments } = getState();
  container.innerHTML = "";

  const today = new Date(getTodayIso());
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  days.forEach((d) => {
    const iso = d.toISOString().slice(0, 10);
    const dayAppointments = appointments.filter((a) => a.date === iso);

    const dayEl = document.createElement("div");
    dayEl.className = "calendar-day";
    dayEl.innerHTML = `
      <div class="calendar-day-header">
        ${d.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}
      </div>
    `;

    if (!dayAppointments.length) {
      const slot = document.createElement("div");
      slot.className = "calendar-slot";
      slot.textContent = "No appts";
      dayEl.appendChild(slot);
    } else {
      dayAppointments.forEach((a) => {
        const slot = document.createElement("div");
        slot.className = "calendar-slot";
        slot.textContent = `${a.time} – ${a.customerName}`;
        dayEl.appendChild(slot);
      });
    }

    container.appendChild(dayEl);
  });
}

/* ---------------------------------------------------------
   POPUP: Add Appointment
--------------------------------------------------------- */
function openAppointmentForm() {
  const { barbers, services } = getState();
  const formId = "appointmentForm";

  let barberOptions = barbers
    .map((b) => `<option value="${b.id}">${b.name}</option>`)
    .join("");

  let serviceOptions = services
    .map((s) => `<option value="${s.id}">${s.name}</option>`)
    .join("");

  openModal({
    title: "Add Appointment",
    size: "md",
    submitLabel: "Book Appointment",
    content: `
      <form id="${formId}" class="modal-form-grid">

        <div>
          <label>Date</label>
          <input name="date" type="date" value="${getTodayIso()}" />
        </div>

        <div>
          <label>Time</label>
          <input name="time" type="time" value="10:00" />
        </div>

        <div class="full">
          <label>Customer Name</label>
          <input name="customerName" type="text" value="Walk-in" />
        </div>

        <div>
          <label>Barber</label>
          <select name="barberId">${barberOptions}</select>
        </div>

        <div>
          <label>Service</label>
          <select name="serviceId">${serviceOptions}</select>
        </div>

        <div class="full">
          <label>Status</label>
          <select name="status">
            <option value="Booked">Booked</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </form>
    `,
    onSubmit: () => {
      const form = document.getElementById(formId);
      const formData = new FormData(form);

      const newAppt = {
        id: generateId("appt"),
        date: formData.get("date"),
        time: formData.get("time"),
        customerName: formData.get("customerName") || "Walk-in",
        barberId: formData.get("barberId"),
        serviceId: formData.get("serviceId"),
        status: formData.get("status"),
      };

      updateState((prev) => ({
        ...prev,
        appointments: [...prev.appointments, newAppt],
      }));

      renderAppointments();
      renderCalendar();
    },
  });
}
