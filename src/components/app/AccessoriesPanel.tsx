import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store-context";
import { centsToDecimal, formatBRL, parseBRLToCents } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AccessoriesPanel() {
  const { store, perms } = useStore();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["accessories", store.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("accessories").select("*").eq("store_id", store.id).order("name");
      if (error) throw error;
      return data;
    },
  });

  async function add(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const q = Number(qty);
    if (!Number.isInteger(q) || q < 0) { toast.error("Quantidade inválida."); return; }
    const p = price ? parseBRLToCents(price) : null;
    if (price && p == null) { toast.error("Preço inválido."); return; }
    setBusy(true);
    const { data: acc, error } = await supabase
      .from("accessories")
      .insert({ store_id: store.id, name: name.trim(), quantity: q, sale_price: p != null ? p / 100 : null })
      .select("id").single();
    if (!error && perms.viewCosts && cost) {
      const c = parseBRLToCents(cost);
      if (c != null) await supabase.from("accessory_costs").insert({ accessory_id: acc.id, store_id: store.id, unit_cost: c / 100 });
    }
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setName(""); setQty("1"); setPrice(""); setCost("");
    qc.invalidateQueries({ queryKey: ["accessories", store.id] });
  }

  async function adjust(id: string, quantity: number) {
    if (quantity < 0) return;
    const { error } = await supabase.from("accessories").update({ quantity }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["accessories", store.id] });
  }

  return (
    <div className="space-y-4">
      {perms.manageInventory && (
        <form onSubmit={add} className="grid gap-2 rounded-xl border bg-card p-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <Input required placeholder="Nome (ex.: Capa MagSafe 13)" value={name} onChange={(e) => setName(e.target.value)} />
          <Input inputMode="numeric" placeholder="Qtd." value={qty} onChange={(e) => setQty(e.target.value)} />
          <Input inputMode="decimal" placeholder="Preço R$" value={price} onChange={(e) => setPrice(e.target.value)} />
          {perms.viewCosts ? <Input inputMode="decimal" placeholder="Custo unit. R$" value={cost} onChange={(e) => setCost(e.target.value)} /> : <div />}
          <Button disabled={busy}>Adicionar</Button>
        </form>
      )}
      {isLoading ? <p className="text-sm text-muted-foreground">Carregando…</p> : !data?.length ? (
        <p className="rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">Nenhum acessório cadastrado.</p>
      ) : (
        <div className="divide-y rounded-xl border bg-card">
          {data.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.sale_price != null ? formatBRL(a.sale_price) : "Sem preço"}</p>
              </div>
              <div className="flex items-center gap-2">
                {perms.manageInventory && <Button size="icon" variant="outline" onClick={() => adjust(a.id, a.quantity - 1)} aria-label="Diminuir"><Minus className="h-4 w-4" /></Button>}
                <span className="w-10 text-center font-semibold">{a.quantity}</span>
                {perms.manageInventory && <Button size="icon" variant="outline" onClick={() => adjust(a.id, a.quantity + 1)} aria-label="Aumentar"><Plus className="h-4 w-4" /></Button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
