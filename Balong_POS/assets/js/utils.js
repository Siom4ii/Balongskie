export function formatCurrency(value) {
  return `₱${Number(value).toFixed(2)}`;
}


export function formatDateTime(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString();
}

export function formatDate(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString();
}

export function getTodayIso() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function isToday(date) {
  const iso = typeof date === "string" ? date : date.toISOString().slice(0, 10);
  return iso === getTodayIso();
}

export function generateId(prefix = "id") {
  return (
    prefix +
    "_" +
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 7)
  );
}

export function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

export function sumBy(arr, fn) {
  return arr.reduce((sum, item) => sum + (fn(item) || 0), 0);
}
