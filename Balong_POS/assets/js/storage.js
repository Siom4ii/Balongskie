const STORAGE_KEY = "balong_pos_state_v2";

let state = null;

const defaultState = {
  services: [
    { id: "svc1", name: "Classic Haircut", price: 8, duration: 30 },
    { id: "svc2", name: "Premium Haircut", price: 12, duration: 45 },
    { id: "svc3", name: "Kids Cut", price: 6, duration: 25 },
    { id: "svc4", name: "Beard Trim", price: 5, duration: 20 },
  ],
  products: [
    {
      id: "prd1",
      name: "Matte Pomade",
      sku: "STY-001",
      category: "Styling",
      price: 10,
      stock: 10,
      supplier: "Groom Co.",
    },
    {
      id: "prd2",
      name: "Beard Oil",
      sku: "BRD-001",
      category: "Beard Care",
      price: 12,
      stock: 6,
      supplier: "Groom Co.",
    },
    {
      id: "prd3",
      name: "Shampoo",
      sku: "HAIR-001",
      category: "Hair Care",
      price: 9,
      stock: 8,
      supplier: "HairLabs",
    },
  ],
  barbers: [
    {
      id: "brb1",
      name: "Juan Dela Cruz",
      username: "juan",
      contact: "0917 000 0001",
      commissionRate: 40,
      status: "Active",
    },
    {
      id: "brb2",
      name: "Mark Santos",
      username: "mark",
      contact: "0917 000 0002",
      commissionRate: 35,
      status: "Active",
    },
  ],
  customers: [],
  appointments: [],
  sales: [],
  settings: {
    shopName: "BALONG Barbershop",
    shopAddress: "123 Main St, City",
    shopPhone: "+63 900 000 0000",
    taxRate: 12,
    darkMode: false,
    receiptHeader: "BALONG BARBERSHOP",
    receiptFooter: "Thank you for visiting BALONG!",
  },
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state = raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState };
  } catch (e) {
    console.error("Failed to load state, using defaults", e);
    state = { ...defaultState };
  }
}

export function getState() {
  return state;
}

export function setState(next) {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save state", e);
  }
}

export function updateState(updater) {
  const next = typeof updater === "function" ? updater(state) : updater;
  setState(next);
}
