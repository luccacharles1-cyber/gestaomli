import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ShoppingCart, Smartphone, UserPlus, Receipt, CheckCircle2, Circle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store-context";
import { stockCapitalCents } from "@/lib/devices";
import { formatCents } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { todayISO } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({ meta: [{ title: "Início — MLI Gestão" }, { name: "description", content: "Resumo da sua loja." }, { property: "og:title", content: "Início — MLI Gestão" }, { property: "og:description", content: "Resumo da sua loja." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { store, perms } = useStore();
  const [period, setPeriod] = useState("mes");
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(todayISO());

  const { data } = useQuery({
    queryKey: ["dashboard", store.id, perms.viewCosts],
    queryFn: async () => {
      const [devices, photos, costs, accessories, accCosts, members, highlights] = await Promise.all([
        supabase.from("devices").select("id, status").eq("store_id", store.id),
        supabase.from("device_photos").select("device_id").eq("store_id", store.id),
        perms.viewCosts ? supabase.from("device_costs").select("device_id, total_cost").eq("store_id", store.id) : Promise.resolve({ data: [] }),
        supabase.from("accessories").select("id, quantity").eq("store_id", store.id),
        perms.viewCosts ? supabase.from("accessory_costs").select("accessory_id, unit_cost").eq("store_id", store.id) : Promise.resolve({ data: [] }),
        supabase.from("store_members").select("id").eq("store_id", store.id),
        supabase.from("highlights").select("*").eq("active", true).order("position"),
      ]);
      const costMap = new Map((costs.data ?? []).map((c) => [c.device_id, c.total_cost]));
      const accMap = new Map((accCosts.data ?? []).map((c) => [c.accessory_id, c.unit_cost]));
      const devs = devices.data ?? [];
      const withPhoto = new Set((photos.data ?? []).map((p) => p.device_id));
      return {
        capital: perms.viewCosts
          ? stockCapitalCents(
              devs.map((d) => ({ status: d.status, total_cost: costMap.get(d.id) ?? null })),
              (accessories.data ?? []).map((a) => ({ quantity: a.quantity, unit_cost: accMap.get(a.id) ?? null })),
            )
          : null,
        available: devs.filter((d) => d.status === "disponivel").length,
        inReview: devs.filter((d) => d.status === "em_conferencia").length,
        noPhoto: devs.filter((d) => !["vendido", "devolvido_fornecedor"].includes(d.status) && !withPhoto.has(d.id)).length,
        noCost: perms.viewCosts ? devs.filter((d) => !costMap.has(d.id)).length : 0,
        totalDevices: devs.length,
        members: members.data?.length ?? 1,
        highlights: highlights.data ?? [],
      };
    },
  });

  const checklist = [
    { done: !!(store.document && store.phone && store.address), label: "Completar dados da loja", to: "/app/configuracoes" as const },
    { done: !!store.logo_path, label: "Enviar logo da loja", to: "/app/configuracoes" as const },
    { done: !!store.warranty_text, label: "Cadastrar condições de garantia", to: "/app/configuracoes" as const },
    { done: (data?.totalDevices ?? 0) > 0, label: "Cadastrar o primeiro aparelho", to: "/app/estoque/novo" as const },
    { done: (data?.members ?? 1) > 1, label: "Convidar a equipe", to: "/app/configuracoes" as const },
  ];
  const showChecklist = checklist.some((c) => !c.done);

  const pending = [
    data?.inReview ? { text: `${data.inReview} aparelho(s) em conferência`, to: "/app/estoque" as const } : null,
    data?.noPhoto ? { text: `${data.noPhoto} aparelho(s) em estoque sem fotos`, to: "/app/estoque" as const } : null,
    data?.noCost ? { text: `${data.noCost} aparelho(s) sem custo informado`, to: "/app/estoque" as const } : null,
  ].filter(Boolean) as Array<{ text: string; to: "/app/estoque" }>;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="text-2xl font-semibold">{store.name}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup type="single" value={period} onValueChange={(v) => v && setPeriod(v)} variant="outline" size="sm">
            <ToggleGroupItem value="hoje">Hoje</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 dias</ToggleGroupItem>
            <ToggleGroupItem value="mes">Este mês</ToggleGroupItem>
            <ToggleGroupItem value="custom">Período</ToggleGroupItem>
          </ToggleGroup>
          {period === "custom" && (
            <div className="flex gap-1">
              <Input type="date" className="h-8 w-36" value={from} onChange={(e) => setFrom(e.target.value)} />
              <Input type="date" className="h-8 w-36" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          )}
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <QuickAction icon={ShoppingCart} label="Nova venda" disabled />
        <QuickAction icon={Smartphone} label="Cadastrar aparelho" to="/app/estoque/novo" disabled={!perms.manageInventory} />
        <QuickAction icon={UserPlus} label="Novo contato" disabled />
        <QuickAction icon={Receipt} label="Lançar despesa" disabled />
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Indicadores do período</h2>
          <Badge variant="outline" className="text-xs">Módulo de vendas em desenvolvimento</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Faturamento" value={formatCents(0)} />
          {perms.viewCosts && <Kpi label="Lucro bruto das vendas" value={formatCents(0)} />}
          {perms.viewFinance && <Kpi label="Resultado líquido gerencial" value={formatCents(0)} />}
          {perms.viewCosts && <Kpi label="Margem bruta / líquida" value="— / —" />}
          <Kpi label="Quantidade de vendas" value="0" />
          <Kpi label="Ticket médio" value="—" />
        </div>
        <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />O resultado líquido depende de todos os lançamentos (taxas, comissões, despesas e tributos) estarem registrados.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Posição atual</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {perms.viewCosts && <Kpi label="Capital em estoque" value={data?.capital != null ? formatCents(data.capital) : "…"} highlight />}
          <Kpi label="Aparelhos disponíveis" value={String(data?.available ?? "…")} />
          {perms.viewFinance && <Kpi label="Saldo disponível" value={formatCents(0)} note="Financeiro em desenvolvimento" />}
          {perms.viewFinance && <Kpi label="A receber / a pagar" value={`${formatCents(0)} / ${formatCents(0)}`} note="Financeiro em desenvolvimento" />}
        </div>
      </section>

      {!!data?.highlights.length && (
        <section className="flex snap-x gap-3 overflow-x-auto pb-1">
          {data.highlights.map((h) => (
            <div key={h.id} className="flex min-w-[280px] snap-start items-center gap-3 rounded-xl border bg-card p-3">
              {h.image_url && <img src={h.image_url} alt="" className="h-14 w-14 rounded-md object-cover" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-semibold">{h.title}</p>
                  {h.sponsored && <Badge variant="outline" className="text-[10px]">Patrocinado</Badge>}
                </div>
                {h.body && <p className="line-clamp-2 text-xs text-muted-foreground">{h.body}</p>}
              </div>
              {h.cta_url && <Button asChild size="sm" variant="outline"><a href={h.cta_url} target="_blank" rel="noopener noreferrer">{h.cta_label || "Ver"}</a></Button>}
            </div>
          ))}
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-semibold">{showChecklist ? "Configure sua loja" : "Pendências"}</h2>
          {showChecklist && (
            <ul className="mb-4 space-y-2">
              {checklist.map((c) => (
                <li key={c.label}>
                  <Link to={c.to} className="flex items-center gap-2 text-sm hover:underline">
                    {c.done ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                    <span className={c.done ? "text-muted-foreground line-through" : ""}>{c.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {pending.length ? (
            <ul className="space-y-2">{pending.map((p) => <li key={p.text}><Link to={p.to} className="text-sm hover:underline">• {p.text}</Link></li>)}</ul>
          ) : !showChecklist && <p className="text-sm text-muted-foreground">Nenhuma pendência no momento.</p>}
        </section>
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-semibold">Vendas recentes e oportunidades</h2>
          <p className="text-sm text-muted-foreground">As vendas e o CRM estão em desenvolvimento. Quando forem liberados, os registros aparecem aqui.</p>
        </section>
      </div>
    </div>
  );
}

function Kpi({ label, value, note, highlight }: { label: string; value: string; note?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-gold/40 bg-gold-soft" : "bg-card"}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold">{value}</p>
      {note && <p className="mt-1 text-[11px] text-muted-foreground">{note}</p>}
    </div>
  );
}

function QuickAction({ icon: Icon, label, to, disabled }: { icon: typeof Smartphone; label: string; to?: "/app/estoque/novo"; disabled?: boolean }) {
  const inner = (
    <>
      <Icon className={`h-5 w-5 ${disabled ? "" : "text-gold"}`} />
      <span className="text-sm font-medium">{label}</span>
      {disabled && !to && <span className="text-[10px] text-muted-foreground">Em desenvolvimento</span>}
    </>
  );
  const cls = "flex flex-col items-start gap-2 rounded-xl border bg-card p-4 text-left";
  if (to && !disabled) return <Link to={to} className={`${cls} hover:shadow-md`}>{inner}</Link>;
  return <div className={`${cls} cursor-not-allowed opacity-60`} aria-disabled>{inner}</div>;
}
