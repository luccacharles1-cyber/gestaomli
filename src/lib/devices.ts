import type { Database } from "@/integrations/supabase/types";
import { toCents } from "./money";

export type DeviceStatus = Database["public"]["Enums"]["device_status"];
export type Device = Database["public"]["Tables"]["devices"]["Row"];

export const STATUS_LABEL: Record<DeviceStatus, string> = {
  em_transito: "Em trânsito",
  em_conferencia: "Em conferência",
  disponivel: "Disponível",
  reservado: "Reservado",
  em_assistencia: "Em assistência",
  vendido: "Vendido",
  devolvido_fornecedor: "Devolvido ao fornecedor",
};

export const STATUS_ORDER: DeviceStatus[] = [
  "em_transito",
  "em_conferencia",
  "disponivel",
  "reservado",
  "em_assistencia",
  "vendido",
  "devolvido_fornecedor",
];

/** Statuses where the unit still belongs to the store's stock. */
export const IN_STOCK_STATUSES: DeviceStatus[] = [
  "em_transito",
  "em_conferencia",
  "disponivel",
  "reservado",
  "em_assistencia",
];

export const TEST_CHECKLIST = [
  "Face ID / Touch ID",
  "Tela e touch",
  "Câmeras",
  "Alto-falantes",
  "Microfone",
  "Wi-Fi e Bluetooth",
  "Chip / sinal",
  "Carregamento",
  "Botões",
  "Sensor de proximidade",
] as const;

export const STORAGE_OPTIONS = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"];

/** Capital in stock: accumulated cost of units the store still owns. */
export function stockCapitalCents(
  devices: Array<{ status: DeviceStatus; total_cost: string | number | null }>,
  accessories: Array<{ quantity: number; unit_cost: string | number | null }> = [],
): number {
  const d = devices
    .filter((x) => IN_STOCK_STATUSES.includes(x.status))
    .reduce((acc, x) => acc + toCents(x.total_cost), 0);
  const a = accessories.reduce((acc, x) => acc + toCents(x.unit_cost) * x.quantity, 0);
  return d + a;
}

export function daysInStock(acquiredAt: string | null, createdAt: string, now = new Date()): number {
  const start = new Date(acquiredAt ? `${acquiredAt}T12:00:00` : createdAt);
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000));
}

/** Public-safe description: never includes cost, supplier or internal notes. */
export function commercialDescription(
  d: Pick<Device, "model" | "storage" | "color" | "condition" | "battery_health" | "sale_price">,
  includePrice: boolean,
  formatPrice: (v: string | number | null) => string,
): string {
  const parts = [`${d.model}${d.storage ? ` ${d.storage}` : ""}${d.color ? ` ${d.color}` : ""}`];
  parts.push(d.condition === "novo" ? "Novo" : "Seminovo");
  if (d.battery_health != null) parts.push(`Bateria ${d.battery_health}%`);
  if (includePrice && d.sale_price != null) parts.push(formatPrice(d.sale_price));
  return parts.join(" • ");
}
