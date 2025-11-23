let escapeHandler = null;

export function openModal(options) {
  const {
    title = "",
    content = "",
    onSubmit = null,
    submitLabel = "Save",
    cancelLabel = "Cancel",
    size = "md",
  } = options || {};

  const root = document.getElementById("modalRoot");
  const container = root.querySelector(".modal-container");
  const titleEl = document.getElementById("modalTitle");
  const bodyEl = document.getElementById("modalBody");
  const footerEl = document.getElementById("modalFooter");
  const closeBtn = document.getElementById("modalCloseBtn");

  // size classes
  container.classList.remove("modal-sm", "modal-md", "modal-lg");
  container.classList.add(`modal-${size}`);

  // header
  titleEl.textContent = title;

  // body
  bodyEl.innerHTML = "";
  if (typeof content === "string") {
    bodyEl.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    bodyEl.appendChild(content);
  }

  // footer buttons
  footerEl.innerHTML = "";
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.textContent = cancelLabel;
  cancelBtn.className = "modal-btn modal-btn-secondary";
  cancelBtn.addEventListener("click", () => closeModal());

  footerEl.appendChild(cancelBtn);

  if (onSubmit) {
    const submitBtn = document.createElement("button");
    submitBtn.type = "button";
    submitBtn.textContent = submitLabel;
    submitBtn.className = "modal-btn modal-btn-primary";
    submitBtn.addEventListener("click", () => {
      const result = onSubmit();
      // if onSubmit returns false, keep modal open (for validation)
      if (result !== false) {
        closeModal();
      }
    });
    footerEl.appendChild(submitBtn);
  }

  // close behaviour
  closeBtn.onclick = () => closeModal();
  root.querySelector(".modal-backdrop").onclick = () => closeModal();

  escapeHandler = (e) => {
    if (e.key === "Escape") closeModal();
  };
  document.addEventListener("keydown", escapeHandler);

  // show
  root.classList.remove("hidden");
  requestAnimationFrame(() => {
    root.classList.add("modal-open");
  });
}

export function closeModal() {
  const root = document.getElementById("modalRoot");
  if (!root || root.classList.contains("hidden")) return;
  root.classList.remove("modal-open");
  if (escapeHandler) {
    document.removeEventListener("keydown", escapeHandler);
    escapeHandler = null;
  }
  setTimeout(() => {
    root.classList.add("hidden");
  }, 160);
}
