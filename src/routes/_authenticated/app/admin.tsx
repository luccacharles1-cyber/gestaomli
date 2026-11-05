import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store-context";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_authenticated/app/admin")({
  head: () => ({ meta: [{ title: "Administração — MLI Gestão" }, { name: "description", content: "Administração da plataforma." }, { property: "og:title", content: "Administração — MLI Gestão" }, { property: "og:description", content: "Administração da plataforma." }] }),
  component: Admin,
});

function Admin() {
  const { isPlatformAdmin } = useStore();
  if (!isPlatformAdmin) return <p className="text-muted-foreground">Acesso restrito à administração da plataforma.</p>;
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader title="Administração da plataforma" />
      <Highlights />
      <Grants />
    </div>
  );
}

function Highlights() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-highlights"], queryFn: async () => (await supabase.from("highlights").select("*").order("position")).data ?? [] });
  const [f, setF] = useState({ title: "", body: "", image_url: "", cta_label: "", cta_url: "", position: "0", sponsored: false });
  const reload = () => qc.invalidateQueries({ queryKey: ["admin-highlights"] });

  async function add(e: FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("highlights").insert({
      title: f.title, body: f.body || null, image_url: f.image_url || null, cta_label: f.cta_label || null, cta_url: f.cta_url || null,
      position: Number(f.position) || 0, sponsored: f.sponsored, active: false,
    });
    if (error) return toast.error(error.message);
    setF({ title: "", body: "", image_url: "", cta_label: "", cta_url: "", position: "0", sponsored: false });
    reload();
  }

  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="mb-4 font-semibold">Destaques</h2>
      <form onSubmit={add} className="grid gap-2 md:grid-cols-2">
        <Input required placeholder="Título" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <Input placeholder="Texto curto" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
        <Input placeholder="URL da imagem (https://…)" value={f.image_url} onChange={(e) => setF({ ...f, image_url: e.target.value })} />
        <Input placeholder="Ordem" inputMode="numeric" value={f.position} onChange={(e) => setF({ ...f, position: e.target.value })} />
        <Input placeholder="Texto do botão" value={f.cta_label} onChange={(e) => setF({ ...f, cta_label: e.target.value })} />
        <Input placeholder="Link do botão (https://…)" value={f.cta_url} onChange={(e) => setF({ ...f, cta_url: e.target.value })} />
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={f.sponsored} onCheckedChange={(v) => setF({ ...f, sponsored: v === true })} />Patrocinado</label>
        <Button>Adicionar (inativo)</Button>
      </form>
      <ul className="mt-4 divide-y">
        {data?.map((h) => (
          <li key={h.id} className="flex items-center justify-between gap-2 py-2 text-sm">
            <span>{h.position}. {h.title}{h.sponsored ? " · Patrocinado" : ""}</span>
            <div className="flex items-center gap-2">
              <Switch checked={h.active} onCheckedChange={async (v) => { await supabase.from("highlights").update({ active: v }).eq("id", h.id); reload(); }} />
              <Button size="icon" variant="ghost" onClick={async () => { await supabase.from("highlights").delete().eq("id", h.id); reload(); }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Grants() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-grants"], queryFn: async () => (await supabase.from("product_grants").select("*").order("created_at", { ascending: false })).data ?? [] });
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  async function add(e: FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("product_grants").insert({ email: email.trim().toLowerCase(), product: "fornecedores", note: note || null });
    if (error) return toast.error(error.code === "23505" ? "Este e-mail já tem acesso." : error.message);
    setEmail(""); setNote("");
    qc.invalidateQueries({ queryKey: ["admin-grants"] });
  }

  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="mb-1 font-semibold">Acesso a Fornecedores</h2>
      <p className="mb-4 text-xs text-muted-foreground">Conceda somente após validar a compra. O e-mail identifica a conta, mas não comprova a compra.</p>
      <form onSubmit={add} className="flex flex-wrap gap-2">
        <Input required type="email" placeholder="E-mail do comprador" className="flex-1" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Comprovante / observação" className="flex-1" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button>Conceder</Button>
      </form>
      <ul className="mt-4 divide-y">
        {data?.map((g) => (
          <li key={g.id} className="flex items-center justify-between py-2 text-sm">
            <span>{g.email}{g.note ? ` — ${g.note}` : ""}</span>
            <Button size="sm" variant="ghost" onClick={async () => { await supabase.from("product_grants").delete().eq("id", g.id); qc.invalidateQueries({ queryKey: ["admin-grants"] }); }}>Revogar</Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
