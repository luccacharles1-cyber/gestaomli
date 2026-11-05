import { createContext, useContext } from "react";
import type { Database } from "@/integrations/supabase/types";

export type Store = Database["public"]["Tables"]["stores"]["Row"];
export type Member = Database["public"]["Tables"]["store_members"]["Row"];

export type Perms = {
  viewCosts: boolean;
  viewFinance: boolean;
  giveDiscounts: boolean;
  approveEvaluations: boolean;
  manageInventory: boolean;
  manageTeam: boolean;
  registerSales: boolean;
  cancelSales: boolean;
};

export type StoreCtx = {
  store: Store;
  member: Member;
  perms: Perms;
  stores: Array<{ store: Store; member: Member }>;
  selectStore: (id: string) => void;
  userId: string;
  email: string | null;
  isPlatformAdmin: boolean;
};

export function permsFor(m: Member): Perms {
  const o = m.role === "owner";
  return {
    viewCosts: o || m.can_view_costs,
    viewFinance: o || m.can_view_finance,
    giveDiscounts: o || m.can_give_discounts,
    approveEvaluations: o || m.can_approve_evaluations,
    manageInventory: o || m.can_manage_inventory,
    manageTeam: o || m.can_manage_team,
    registerSales: o || m.can_register_sales,
    cancelSales: o || m.can_cancel_sales,
  };
}

export const ROLE_LABEL = { owner: "Proprietário", manager: "Gerente", seller: "Vendedor" } as const;

export const StoreContext = createContext<StoreCtx | null>(null);

export function useStore(): StoreCtx {
  const v = useContext(StoreContext);
  if (!v) throw new Error("useStore fora da loja");
  return v;
}
