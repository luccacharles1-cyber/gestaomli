import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStore, ROLE_LABEL } from "@/lib/store-context";
import { BUCKET, signedUrls } from "@/lib/storage";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/app/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — MLI Gestão" }, { name: "description", content: "Dados da loja, equipe e permissões." }, { property: "og:title", content: "Configurações — MLI Gestão" }, { property: "og:description", content: "Dados da loja, equipe e permissões." }] }),
  component: Settings,
});

const PERMS = [
  ["can_view_costs", "Ver custos e margens"],
  ["can_view_finance", "Ver financeiro"],
  ["can_give_discounts", "Conceder descontos"],
  ["can_approve_evaluations", "Aprovar avaliações acima do limite"],
  ["can_manage_inventory", "Cadastrar e editar estoque"],
  ["can_manage_team", "Gerenciar equipe"],
] as const;
type PermKey = (typeof PERMS)[number][0];

function Settings() {
  const { member } = useStore();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Configurações" />
      <Tabs defaultValue="loja">
        <TabsList><TabsTrigger value="loja">Loja</TabsTrigger><TabsTrigger value="equipe">Equipe</TabsTrigger></TabsList>
        <TabsContent value="loja" className="mt-4">{member.role === "owner" ? <StoreForm /> : <p className="text-sm text-muted-foreground">Somente o proprietário altera os dados da loja.</p>}</TabsContent>
        <TabsContent value="equipe" className="mt-4"><Team /></TabsContent>
      </Tabs>
    </div>
  );
}

function StoreForm() {
  const { store } = useStore();
  const qc = useQueryClient();
  const [f, setF] = useState({
    name: store.name, legal_name: store.legal_name ?? "", document: store.document ?? "", phone: store.phone ?? "",
    email: store.email ?? "", address: store.address ?? "", warranty_text: store.warranty_text ?? "",
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (store.logo_path) signedUrls([store.logo_path]).then((u) => setLogoUrl(u[store.logo_path!] ?? null));
  }, [store.logo_path]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("stores").update({ ...f, name: f.name.trim() }).eq("id", store.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Dados da loja salvos.");
    qc.invalidateQueries({ queryKey: ["session-bootstrap"] });
  }

  async function uploadLogo(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Envie uma imagem.");
    const path = `${store.id}/logo/${crypto.randomUUID()}.${file.name.split(".").pop() || "png"}`;
    const up = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
    if (up.error) return toast.error(up.error.message);
    const { error } = await supabase.from("stores").update({ logo_path: path }).eq("id", store.id);
    if (error) return toast.error(error.message);
    if (store.logo_path) await supabase.storage.from(BUCKET).remove([store.logo_path]);
    toast.success("Logo atualizada.");
    qc.invalidateQueries({ queryKey: ["session-bootstrap"] });
  }

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  return (
    <form onSubmit={save} className="space-y-4 rounded-xl border bg-card p-5">
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-lg border bg-muted text-xs text-muted-foreground">
          {logoUrl ? <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" /> : "Logo"}
        </div>
        <Label className="cursor-pointer text-sm underline">Enviar logo<input type="file" accept="image/*" className="hidden" onChange={(e) => uploadLogo(e.target.files?.[0])} /></Label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Fld label="Nome da loja"><Input required value={f.name} onChange={set("name")} /></Fld>
        <Fld label="Razão social"><Input value={f.legal_name} onChange={set("legal_name")} /></Fld>
        <Fld label="CNPJ ou CPF"><Input value={f.document} onChange={set("document")} /></Fld>
        <Fld label="Telefone / WhatsApp"><Input value={f.phone} onChange={set("phone")} /></Fld>
        <Fld label="E-mail"><Input type="email" value={f.email} onChange={set("email")} /></Fld>
        <Fld label="Endereço"><Input value={f.address} onChange={set("address")} /></Fld>
      </div>
      <Fld label="Condições de garantia (aparecerão nos recibos)"><Textarea rows={4} value={f.warranty_text} onChange={set("warranty_text")} /></Fld>
      <div className="flex justify-end"><Button disabled={busy}>{busy ? "Salvando…" : "Salvar"}</Button></div>
    </form>
  );
}

function Team() {
  const { store, perms, userId } = useStore();
  const qc = useQueryClient();
  const key = ["team", store.id];
  const { data } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const [m, i] = await Promise.all([
        supabase.from("store_members").select("*").eq("store_id", store.id).order("created_at"),
        perms.manageTeam ? supabase.from("store_invites").select("*").eq("store_id", store.id).is("accepted_at", null) : Promise.resolve({ data: [] }),
      ]);
      return { members: m.data ?? [], invites: i.data ?? [] };
    },
  });

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"manager" | "seller">("seller");
  const [newPerms, setNewPerms] = useState<Record<PermKey, boolean>>({
    can_view_costs: false, can_view_finance: false, can_give_discounts: false, can_approve_evaluations: false, can_manage_inventory: false, can_manage_team: false,
  });

  async function invite(e: FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("store_invites").insert({ store_id: store.id, email: email.trim().toLowerCase(), role, ...newPerms });
    if (error) return toast.error(error.code === "23505" ? "Já existe convite para este e-mail." : error.message);
    toast.success("Convite registrado. A pessoa deve criar conta com este e-mail.");
    setEmail("");
    qc.invalidateQueries({ queryKey: key });
  }

  async function togglePerm(memberId: string, k: PermKey, v: boolean) {
    const { error } = await supabase.from("store_members").update({ [k]: v }).eq("id", memberId);
    if (error) return toast.error("Sem permissão para alterar.");
    qc.invalidateQueries({ queryKey: key });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {data?.members.map((m) => {
          const editable = perms.manageTeam && m.role !== "owner" && m.user_id !== userId;
          return (
            <div key={m.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{m.email ?? "Usuário"}{m.user_id === userId && " (você)"}</p>
                  <Badge variant="secondary">{ROLE_LABEL[m.role]}</Badge>
                </div>
                {editable && (
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => {
                    const { error } = await supabase.from("store_members").delete().eq("id", m.id);
                    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: key });
                  }}><Trash2 className="mr-1 h-4 w-4" />Remover</Button>
                )}
              </div>
              {m.role !== "owner" && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {PERMS.map(([k, l]) => (
                    <label key={k} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={m[k]} disabled={!editable} onCheckedChange={(v) => togglePerm(m.id, k, v === true)} />{l}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {perms.manageTeam && (
        <form onSubmit={invite} className="space-y-3 rounded-xl border bg-card p-5">
          <h3 className="font-semibold">Convidar membro</h3>
          <div className="flex flex-wrap gap-2">
            <Input required type="email" placeholder="E-mail" className="flex-1" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Select value={role} onValueChange={(v) => setRole(v as "manager" | "seller")}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="manager">Gerente</SelectItem><SelectItem value="seller">Vendedor</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {PERMS.map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 text-sm"><Checkbox checked={newPerms[k]} onCheckedChange={(v) => setNewPerms({ ...newPerms, [k]: v === true })} />{l}</label>
            ))}
          </div>
          <Button>Registrar convite</Button>
          <p className="text-xs text-muted-foreground">A pessoa entra na loja automaticamente ao criar conta e confirmar este e-mail.</p>
          {!!data?.invites.length && (
            <ul className="divide-y border-t pt-2 text-sm">
              {data.invites.map((i) => (
                <li key={i.id} className="flex items-center justify-between py-2">
                  <span>{i.email} · {ROLE_LABEL[i.role]} · pendente</span>
                  <Button type="button" size="sm" variant="ghost" onClick={async () => { await supabase.from("store_invites").delete().eq("id", i.id); qc.invalidateQueries({ queryKey: key }); }}>Cancelar</Button>
                </li>
              ))}
            </ul>
          )}
        </form>
      )}
    </div>
  );
}

function Fld({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
