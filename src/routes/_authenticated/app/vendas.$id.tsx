import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Ban, Loader2, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store-context";
import { PAYMENT_LABEL, SALE_STATUS_LABEL } from "@/lib/sales";
import { formatBRL } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/app/vendas/$id")({
  head: () => ({ meta: [{ title: "Venda — MLI Gestão" }, { name: "description", content: "Detalhes da venda e recibo." }, { property: "og:title", content: "Venda — MLI Gestão" }, { property: "og:description", content: "Detalhes da venda e recibo." }] }),
  component: VendaPage,
});

type Snapshot = {
  store?: { name?: string; legal_name?: string; document?: string; phone?: string; email?: string; address?: string; warranty_text?: string };
  client?: { name?: string; document?: string; whatsapp?: string; email?: string; address?: string } | null;
  items?: Array<{ model: string; storage?: string; color?: string; imei1?: string; imei2?: string; serial_number?: string; condition?: string; price: string }>;
  trade_in?: { model: string; storage?: string; color?: string; imei1?: string; imei2?: string; condition?: string; agreed_value: string } | null;
  payments?: Array<{ method: keyof typeof PAYMENT_LABEL; amount: string; installments?: number | null }>;
};

function VendaPage() {
  const { id } = Route.useParams();
  const { store, perms } = useStore();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const key = ["sale", id];
  const { data, isLoading, error } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const [s, items, pays, trade, events] = await Promise.all([
        supabase.from("sales").select("*, clients(name, document, whatsapp)").eq("id", id).eq("store_id", store.id).maybeSingle(),
        supabase.from("sale_items").select("*, devices(model, storage, color, imei1, imei2, condition)").eq("sale_id", id),
        supabase.from("sale_payments").select("*").eq("sale_id", id).order("created_at"),
        supabase.from("sale_trade_ins").select("*, devices(model, storage, imei1, imei2, condition, status)").eq("sale_id", id),
        supabase.from("sale_events").select("*").eq("sale_id", id).order("created_at"),
      ]);
      if (s.error) throw s.error;
      return { sale: s.data, items: items.data ?? [], payments: pays.data ?? [], tradeIns: trade.data ?? [], events: events.data ?? [] };
    },
  });

  async function cancelSale() {
    if (busy) return;
    setBusy(true);
    const { error } = await supabase.rpc("cancel_sale", { _sale_id: id, _reason: reason });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Venda cancelada. Os aparelhos voltaram ao estoque e o usado foi marcado como devolvido ao cliente.");
    setCancelOpen(false);
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: ["sales"] });
    qc.invalidateQueries({ queryKey: ["devices"] });
  }

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (error) return <p className="text-destructive">Erro ao carregar a venda.</p>;
  if (!data?.sale) return <p>Venda não encontrada. <Link to="/app/vendas" className="underline">Voltar às vendas</Link></p>;

  const s = data.sale;
  const snap = (s.receipt_snapshot ?? {}) as Snapshot;
  const balance = Number(s.balance);

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/app/vendas" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground print:hidden"><ArrowLeft className="mr-1 h-4 w-4" />Vendas</Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">Venda · Recibo nº {s.receipt_number}</h1>
          <p className="text-sm text-muted-foreground">{formatDateTime(s.created_at)} · {s.clients?.name ?? "Cliente não identificado"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className={s.status === "cancelada" ? "bg-destructive/10 text-destructive" : "bg-success/15 text-success"}>{SALE_STATUS_LABEL[s.status]}</Badge>
          <Button variant="outline" onClick={() => window.print()}><Printer className="mr-1 h-4 w-4" />Imprimir recibo</Button>
          {s.status === "concluida" && perms.cancelSales && (
            <Button variant="destructive" onClick={() => setCancelOpen(true)}><Ban className="mr-1 h-4 w-4" />Cancelar venda</Button>
          )}
        </div>
      </div>

      {s.status === "cancelada" && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm print:hidden">
          <p className="font-semibold text-destructive">Venda cancelada em {formatDateTime(s.cancelled_at)}</p>
          {s.cancel_reason && <p className="mt-1 text-muted-foreground">Motivo: {s.cancel_reason}</p>}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 print:hidden">
        <section className="rounded-xl border bg-card p-4 text-sm">
          <p className="mb-2 font-semibold">Aparelhos vendidos</p>
          <ul className="space-y-2">
            {data.items.map((i) => (
              <li key={i.id} className="flex items-start justify-between gap-2">
                <span>
                  <Link to="/app/estoque/$id" params={{ id: i.device_id }} className="font-medium underline-offset-2 hover:underline">{i.devices?.model} {i.devices?.storage}</Link>
                  <span className="block text-xs text-muted-foreground">{[i.devices?.color, i.devices?.imei1 ? `IMEI ${i.devices.imei1}` : null].filter(Boolean).join(" · ")}</span>
                </span>
                <span>{formatBRL(i.price)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1 border-t pt-2">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatBRL(s.items_total)}</span></div>
            {Number(s.discount) > 0 && <div className="flex justify-between"><span>Desconto</span><span>-{formatBRL(s.discount)}</span></div>}
            <div className="flex justify-between font-semibold"><span>Total</span><span>{formatBRL(s.total)}</span></div>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-4 text-sm">
          <p className="mb-2 font-semibold">Recebimentos</p>
          {data.payments.length === 0 ? <p className="text-muted-foreground">Nenhum recebimento registrado.</p> : (
            <ul className="space-y-1">
              {data.payments.map((p) => (
                <li key={p.id} className="flex justify-between">
                  <span>{PAYMENT_LABEL[p.method]}{p.installments ? ` · ${p.installments}x` : ""}</span>
                  <span>{formatBRL(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 space-y-1 border-t pt-2">
            {Number(s.trade_in_value) > 0 && <div className="flex justify-between"><span>Usado na troca</span><span>{formatBRL(s.trade_in_value)}</span></div>}
            <div className="flex justify-between"><span>Recebido</span><span>{formatBRL(s.amount_received)}</span></div>
            <div className="flex justify-between font-semibold"><span>Saldo pendente</span><span className={balance > 0 ? "text-warning-foreground" : ""}>{formatBRL(s.balance)}</span></div>
          </div>
        </section>

        {data.tradeIns.length > 0 && (
          <section className="rounded-xl border bg-card p-4 text-sm">
            <p className="mb-2 font-semibold">Usado recebido na troca</p>
            <ul className="space-y-1">
              {data.tradeIns.map((t) => (
                <li key={t.id} className="flex items-start justify-between gap-2">
                  <span>
                    <Link to="/app/estoque/$id" params={{ id: t.device_id }} className="font-medium underline-offset-2 hover:underline">{t.devices?.model} {t.devices?.storage}</Link>
                    <span className="block text-xs text-muted-foreground">{[t.devices?.imei1 ? `IMEI ${t.devices.imei1}` : null, t.devices?.status === "em_conferencia" ? "Em conferência" : null].filter(Boolean).join(" · ")}</span>
                  </span>
                  <span>{formatBRL(t.agreed_value)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-xl border bg-card p-4 text-sm">
          <p className="mb-2 font-semibold">Histórico</p>
          <ul className="space-y-1">
            {data.events.map((e) => (
              <li key={e.id} className="flex justify-between gap-2">
                <span>{e.event === "concluida" ? "Venda concluída" : e.event === "cancelada" ? "Venda cancelada" : e.event}</span>
                <span className="text-muted-foreground">{formatDateTime(e.created_at)}</span>
              </li>
            ))}
          </ul>
          {s.notes && <p className="mt-3 border-t pt-2 text-muted-foreground">Obs.: {s.notes}</p>}
        </section>
      </div>

      {/* Recibo imprimível — gerado do snapshot salvo na conclusão, imutável */}
      <div id="recibo" className="mt-6 rounded-xl border bg-card p-8 text-sm print:mt-0 print:border-0 print:p-0">
        <div className="flex items-start justify-between gap-4 border-b pb-4">
          <div>
            <p className="text-lg font-bold">{snap.store?.name ?? store.name}</p>
            {snap.store?.legal_name && <p>{snap.store.legal_name}</p>}
            {snap.store?.document && <p>CNPJ/CPF: {snap.store.document}</p>}
            {snap.store?.address && <p>{snap.store.address}</p>}
            {snap.store?.phone && <p>{snap.store.phone}{snap.store?.email ? ` · ${snap.store.email}` : ""}</p>}
          </div>
          <div className="text-right">
            <p className="font-bold">RECIBO DE VENDA</p>
            <p>Nº {String(s.receipt_number ?? 0).padStart(6, "0")}</p>
            <p>{formatDate(s.created_at)}</p>
            {s.status === "cancelada" && <p className="font-bold text-destructive">CANCELADO</p>}
          </div>
        </div>

        {snap.client && (
          <div className="border-b py-3">
            <p className="font-semibold">Cliente</p>
            <p>{snap.client.name}{snap.client.document ? ` · CPF/CNPJ: ${snap.client.document}` : ""}</p>
            {snap.client.whatsapp && <p>{snap.client.whatsapp}{snap.client.email ? ` · ${snap.client.email}` : ""}</p>}
            {snap.client.address && <p>{snap.client.address}</p>}
          </div>
        )}

        <div className="border-b py-3">
          <p className="mb-1 font-semibold">Produtos</p>
          <table className="w-full">
            <tbody>
              {(snap.items ?? []).map((i, idx) => (
                <tr key={idx} className="align-top">
                  <td className="py-1 pr-2">
                    {i.model} {i.storage} {i.color} {i.condition === "novo" ? "(Novo)" : "(Seminovo)"}
                    {(i.imei1 || i.imei2 || i.serial_number) && (
                      <span className="block text-xs">
                        {[i.imei1 ? `IMEI 1: ${i.imei1}` : null, i.imei2 ? `IMEI 2: ${i.imei2}` : null, i.serial_number ? `Série: ${i.serial_number}` : null].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </td>
                  <td className="py-1 text-right">{formatBRL(i.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {snap.trade_in && (
          <div className="border-b py-3">
            <p className="font-semibold">Aparelho recebido na troca</p>
            <p>
              {snap.trade_in.model} {snap.trade_in.storage} {snap.trade_in.color} — valor acordado {formatBRL(snap.trade_in.agreed_value)}
              {(snap.trade_in.imei1 || snap.trade_in.imei2) && (
                <span className="block text-xs">{[snap.trade_in.imei1 ? `IMEI 1: ${snap.trade_in.imei1}` : null, snap.trade_in.imei2 ? `IMEI 2: ${snap.trade_in.imei2}` : null].filter(Boolean).join(" · ")}</span>
              )}
            </p>
          </div>
        )}

        <div className="space-y-1 border-b py-3">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatBRL(s.items_total)}</span></div>
          {Number(s.discount) > 0 && <div className="flex justify-between"><span>Desconto</span><span>-{formatBRL(s.discount)}</span></div>}
          <div className="flex justify-between font-bold"><span>Total da venda</span><span>{formatBRL(s.total)}</span></div>
          {(snap.payments ?? []).map((p, idx) => (
            <div key={idx} className="flex justify-between"><span>Recebido · {PAYMENT_LABEL[p.method]}{p.installments ? ` ${p.installments}x` : ""}</span><span>{formatBRL(p.amount)}</span></div>
          ))}
          {snap.trade_in && <div className="flex justify-between"><span>Usado na troca</span><span>{formatBRL(snap.trade_in.agreed_value)}</span></div>}
          {balance > 0 ? (
            <div className="flex justify-between font-bold"><span>Saldo pendente</span><span>{formatBRL(s.balance)}</span></div>
          ) : (
            <p className="pt-1">Quitado na data deste recibo.</p>
          )}
        </div>

        {snap.store?.warranty_text && (
          <div className="border-b py-3">
            <p className="font-semibold">Condições de garantia</p>
            <p className="whitespace-pre-wrap">{snap.store.warranty_text}</p>
          </div>
        )}

        <p className="pt-3 text-xs">Este recibo não é nota fiscal. Documento gerado em {formatDateTime(s.created_at)}.</p>
        <div className="mt-10 grid grid-cols-2 gap-8">
          <p className="border-t pt-1 text-center text-xs">Assinatura da loja</p>
          <p className="border-t pt-1 text-center text-xs">Assinatura do cliente</p>
        </div>
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancelar venda nº {s.receipt_number}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Os aparelhos voltam ao estoque como disponíveis e o usado da troca é marcado como devolvido ao cliente.
            A venda e o recibo originais são preservados no histórico.
          </p>
          <Textarea rows={3} placeholder="Motivo do cancelamento" value={reason} onChange={(e) => setReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Voltar</Button>
            <Button variant="destructive" disabled={busy || !reason.trim()} onClick={cancelSale}>
              {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}Confirmar cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
