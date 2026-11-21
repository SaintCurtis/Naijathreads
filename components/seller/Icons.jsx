// Small inline icon set for the admin (stroke icons, inherit currentColor)
const base = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const DashboardIcon = (p) => (
  <svg {...base} {...p}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
);
export const PlusIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>
);
export const ProductsIcon = (p) => (
  <svg {...base} {...p}><path d="M20.4 7.5 12 3 3.6 7.5v9L12 21l8.4-4.5z" /><path d="M3.6 7.5 12 12l8.4-4.5M12 12v9" /></svg>
);
export const InventoryIcon = (p) => (
  <svg {...base} {...p}><path d="M4 20V10l8-6 8 6v10" /><path d="M9 20v-6h6v6" /><path d="M4 20h16" /></svg>
);
export const OrdersIcon = (p) => (
  <svg {...base} {...p}><path d="M6 2h12l2 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" /><path d="M4 6h16M9 11h6M9 15h4" /></svg>
);
export const EditIcon = (p) => (
  <svg {...base} width={16} height={16} {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
);
export const TrashIcon = (p) => (
  <svg {...base} width={16} height={16} {...p}><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
);
export const EyeIcon = (p) => (
  <svg {...base} width={16} height={16} {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const SearchIcon = (p) => (
  <svg {...base} width={18} height={18} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
