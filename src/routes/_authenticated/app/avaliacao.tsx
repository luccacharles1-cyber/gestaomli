import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store-context";
import { ADJ_KINDS, ADJ_LABEL, EVAL_STATUS_LABEL, needsApproval, suggestedCents, type AdjKind } from "@/lib/crm";
import { centsToDecimal, formatBRL, formatCents, parseBRLToCents } from "@/lib/money";
import { TradeSimulation } from "@/components/app/TradeSimulation";
import { STORAGE_OPTIONS } from "@/lib/devices";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/app/avaliacao")({
  head: () => ({ meta: [{ title: "Avaliação de usados — MLI Gestão" }, { name: "description", content: "Tabela própria de avaliação com ajustes por bateria, conservação, peças e defeitos e limites de aprovação." }, { property: "og:title", content: "Avaliação de usados — MLI Gestão" }, { property: "og:description", content: "Tabela própria de avaliação com ajustes e aprovação." },{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}] }),
  component: Avaliacao,
});

function Avaliacao() {
  const { store, member, perms } = useStore();
  const isOwner = member.role === "owner";
  const qc = useQueryClient();
  const key = ["evaluations", store.id];
  const { data } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const [p, a, e, c] = await Promise.all([
        supabase.from("evaluation_prices").select("*").eq("store_id", store.id).order("model"),
        supabase.from("evaluation_adjustments").select("*").eq("store_id", store.id).order("kind"),
        supabase.from("evaluations").select("*").eq("store_id", store.id).order("created_at", { ascending: false }).limit(100),
        supabase.from("clients").select("id, name").eq("store_id", store.id).order("name"),
      ]);
      for (const r of [p, a, e, c]) if (r.error) throw r.error;
      return { prices: p.data ?? [], adjs: a.data ?? [], evals: e.data ?? [], clients: c.data ?? [] };
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: key });

  const [form, setForm] = useState({ model: "", storage: "", client_id: "", offered: "", notes: "" });
  const [mode,setMode]=useState("evaluate");
  const [picked, setPicked] = useState<string[]>([]);
  const [price, setPrice] = useState({ model: "", storage: "", value: "" });
  const [adj, setAdj] = useState({ kind: "bateria" as AdjKind, label: "", amount: "" });

  const activeAdjs = (data?.adjs ?? []).filter((a) => a.active);
  const ref = (data?.prices ?? []).find((p) => p.model.toLowerCase() === form.model.trim().toLowerCase() && p.storage === form.storage);
  const sug = useMemo(() => suggestedCents(ref?.reference_value ?? null, activeAdjs.filter((a) => picked.includes(a.id)).map((a) => a.amount)), [ref, activeAdjs, picked]);
  const offered = parseBRLToCents(form.offered);
  const models = Array.from(new Set((data?.prices ?? []).map((p) => p.model)));

  async function evaluate() {
    if (!offered) { toast.error("Informe o valor oferecido."); return; }
    const { error } = await supabase.rpc("create_evaluation", {
      _store_id: store.id, _client_id: (form.client_id || null) as string, _opportunity_id: null as unknown as string,
      _model: form.model, _storage: form.storage, _adjustment_ids: picked, _offered: Number(centsToDecimal(offered)), _notes: (form.notes || null) as string,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Avaliação registrada."); setForm({ model: "", storage: "", client_id: "", offered: "", notes: "" }); setPicked([]); refresh();
  }

  async function savePrice() {
    const v = parseBRLToCents(price.value);
    if (!price.model.trim() || v == null) { toast.error("Informe modelo e valor de referência."); return; }
    const existing = (data?.prices ?? []).find((p) => p.model.toLowerCase() === price.model.trim().toLowerCase() && p.storage === price.storage);
    const { error } = existing
      ? await supabase.from("evaluation_prices").update({ reference_value: v / 100, updated_at: new Date().toISOString() }).eq("id", existing.id)
      : await supabase.from("evaluation_prices").insert({ store_id: store.id, model: price.model.trim(), storage: price.storage, reference_value: v / 100 });
    if (error) { toast.error(error.message); return; }
    toast.success("Preço salvo."); setPrice({ model: "", storage: "", value: "" }); refresh();
  }

  async function saveAdj() {
    const neg = adj.amount.trim().startsWith("-");
    const v = parseBRLToCents(adj.amount.replace("-", ""));
    if (!adj.label.trim() || v == null) { toast.error("Informe descrição e valor do ajuste."); return; }
    const { error } = await supabase.from("evaluation_adjustments").insert({ store_id: store.id, kind: adj.kind, label: adj.label.trim(), amount: (neg ? -v : v) / 100 });
    if (error) { toast.error(error.message); return; }
    toast.success("Ajuste salvo."); setAdj({ ...adj, label: "", amount: "" }); refresh();
  }

  async function decide(id: string, approve: boolean) {
    const { error } = await supabase.rpc("decide_evaluation", { _id: id, _approve: approve });
    if (error) toast.error(error.message); else { toast.success(approve ? "Aprovada." : "Recusada."); refresh(); }
  }

  return (
    <div>
      <PageHeader title="Avaliação de usados" subtitle="Valores definidos pela própria loja. Acima do sugerido ou sem referência exige aprovação." />
      <Tabs defaultValue="avaliar">
        <TabsList><TabsTrigger value="avaliar">Avaliar</TabsTrigger><TabsTrigger value="historico">Avaliações</TabsTrigger><TabsTrigger value="tabela">Tabela da loja</TabsTrigger></TabsList>

        <TabsContent value="avaliar" className="mt-4">
          <Tabs value={mode} onValueChange={setMode} className="mb-4"><TabsList><TabsTrigger value="evaluate">Avaliar usado</TabsTrigger><TabsTrigger value="simulate">Simular troca</TabsTrigger></TabsList></Tabs>
          <section className="grid max-w-3xl gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Modelo *</Label><Input list="eval-models" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /><datalist id="eval-models">{models.map((m) => <option key={m} value={m} />)}</datalist></div>
            <div className="space-y-1.5"><Label>Armazenamento</Label>
              <Select value={form.storage} onValueChange={(v) => setForm({ ...form, storage: v })}><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>{STORAGE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Cliente</Label>
              <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}><SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent>{(data?.clients ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="sm:col-span-2 space-y-2">
              <Label>Ajustes</Label>
              {activeAdjs.length === 0 && <p className="text-sm text-muted-foreground">O proprietário ainda não cadastrou ajustes.</p>}
              {ADJ_KINDS.map((k) => activeAdjs.filter((a) => a.kind === k).map((a) => (
                <label key={a.id} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={picked.includes(a.id)} onCheckedChange={(v) => setPicked(v === true ? [...picked, a.id] : picked.filter((x) => x !== a.id))} />
                  {ADJ_LABEL[k]}: {a.label} ({formatBRL(a.amount)})
                </label>
              )))}
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm sm:col-span-2">
              <p>Referência: {ref ? formatBRL(ref.reference_value) : "sem referência na tabela"}</p>
              <p className="font-semibold">Sugerido: {sug == null ? "—" : formatCents(sug)}</p>
            </div>
            <div className="space-y-1.5"><Label>Valor oferecido (R$) *</Label><Input inputMode="decimal" value={form.offered} onChange={(e) => setForm({ ...form, offered: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Observações</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            {mode==="evaluate" && offered != null && needsApproval(sug, offered) && <p className="text-sm text-warning-foreground sm:col-span-2">{perms.approveEvaluations ? "Fora do sugerido: será aprovada por você." : "Fora do sugerido: ficará aguardando aprovação."}</p>}
            {mode==="evaluate"?<Button className="sm:col-span-2" onClick={evaluate} disabled={!perms.registerSales}>Registrar avaliação</Button>:<div className="sm:col-span-2"><TradeSimulation used={[form.model,form.storage].filter(Boolean).join(" ")} offered={offered} clientId={form.client_id}/></div>}
          </section>
        </TabsContent>

        <TabsContent value="historico" className="mt-4">
          <ul className="divide-y rounded-xl border bg-card">
            {(data?.evals ?? []).length === 0 && <li className="p-4 text-sm text-muted-foreground">Nenhuma avaliação.</li>}
            {(data?.evals ?? []).map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
                <div className="flex-1">
                  <p className="font-medium">{e.model} {e.storage} — {formatBRL(e.offered_value)}</p>
                  <p className="text-xs text-muted-foreground">Ref. {e.reference_value == null ? "—" : formatBRL(e.reference_value)} • Sugerido {e.suggested_value == null ? "—" : formatBRL(e.suggested_value)} • {(e.adjustments as Array<{ label: string; amount: number }>).map((a) => `${a.label} ${formatBRL(a.amount)}`).join(", ") || "sem ajustes"} • {formatDateTime(e.created_at)}</p>
                </div>
                <Badge variant="outline">{EVAL_STATUS_LABEL[e.status]}</Badge>
                {e.status === "pendente" && perms.approveEvaluations && (<>
                  <Button size="sm" onClick={() => decide(e.id, true)}>Aprovar</Button>
                  <Button size="sm" variant="outline" onClick={() => decide(e.id, false)}>Recusar</Button>
                </>)}
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="tabela" className="mt-4 space-y-6">
          {isOwner && (
            <div className="grid gap-4 md:grid-cols-2">
              <section className="space-y-2 rounded-xl border bg-card p-4">
                <h3 className="font-semibold">Valor de referência</h3>
                <Input placeholder="Modelo (ex.: iPhone 13)" value={price.model} onChange={(e) => setPrice({ ...price, model: e.target.value })} />
                <Select value={price.storage} onValueChange={(v) => setPrice({ ...price, storage: v })}><SelectTrigger><SelectValue placeholder="Armazenamento" /></SelectTrigger>
                  <SelectContent>{STORAGE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                <Input inputMode="decimal" placeholder="Valor (R$)" value={price.value} onChange={(e) => setPrice({ ...price, value: e.target.value })} />
                <Button onClick={savePrice}>Salvar preço</Button>
              </section>
              <section className="space-y-2 rounded-xl border bg-card p-4">
                <h3 className="font-semibold">Ajuste fixo</h3>
                <Select value={adj.kind} onValueChange={(v) => setAdj({ ...adj, kind: v as AdjKind })}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ADJ_KINDS.map((k) => <SelectItem key={k} value={k}>{ADJ_LABEL[k]}</SelectItem>)}</SelectContent></Select>
                <Input placeholder="Descrição (ex.: bateria abaixo de 80%)" value={adj.label} onChange={(e) => setAdj({ ...adj, label: e.target.value })} />
                <Input placeholder="Valor (use - para desconto, ex.: -150,00)" value={adj.amount} onChange={(e) => setAdj({ ...adj, amount: e.target.value })} />
                <Button onClick={saveAdj}>Salvar ajuste</Button>
              </section>
            </div>
          )}
          {!isOwner && <p className="text-sm text-muted-foreground">Somente o proprietário altera a tabela.</p>}
          <ul className="divide-y rounded-xl border bg-card text-sm">
            {(data?.prices ?? []).length === 0 && <li className="p-3 text-muted-foreground">Nenhum preço cadastrado.</li>}
            {(data?.prices ?? []).map((p) => <li key={p.id} className="flex justify-between p-3"><span>{p.model} {p.storage}</span><span>{formatBRL(p.reference_value)}</span></li>)}
          </ul>
          <ul className="divide-y rounded-xl border bg-card text-sm">
            {(data?.adjs ?? []).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 p-3">
                <span className={a.active ? "" : "text-muted-foreground line-through"}>{ADJ_LABEL[a.kind as AdjKind]}: {a.label}</span>
                <span className="flex items-center gap-2">{formatBRL(a.amount)}
                  {isOwner && <Button size="sm" variant="ghost" onClick={async () => { const { error } = await supabase.from("evaluation_adjustments").update({ active: !a.active }).eq("id", a.id); if (error) toast.error(error.message); else refresh(); }}>{a.active ? "Desativar" : "Ativar"}</Button>}
                </span>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
