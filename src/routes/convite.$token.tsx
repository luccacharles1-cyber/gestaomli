import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_LABEL } from "@/lib/store-context";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/convite/$token")({
  head: () => ({
    meta: [
      { title: "Convite — MLI Gestão" },
      { name: "description", content: "Aceite o convite para entrar na loja." },
      { property: "og:title", content: "Convite — MLI Gestão" },
      { property: "og:description", content: "Aceite o convite para entrar na loja." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InvitePage,
});

type InviteInfo = {
  status: "valid" | "used" | "revoked" | "expired" | "other_email" | "not_found";
  store_name?: string;
  role?: "owner" | "manager" | "seller";
  email?: string | null;
};

const STATUS_TEXT: Record<Exclude<InviteInfo["status"], "valid" | "other_email">, string> = {
  not_found: "Este link de convite é inválido.",
  used: "Este convite já foi utilizado.",
  revoked: "Este convite foi revogado pelo responsável da loja.",
  expired: "Este convite venceu. Peça um novo ao responsável da loja.",
};

function InvitePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const { data: session, isLoading: loadingSession } = useQuery({
    queryKey: ["invite-session"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });

  const { data: invite, isLoading: loadingInvite } = useQuery({
    queryKey: ["invite", token],
    enabled: !!session,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_invite_by_token", { _token: token });
      if (error) throw error;
      return data as unknown as InviteInfo;
    },
  });

  async function accept() {
    if (busy) return;
    setBusy(true);
    const { error } = await supabase.rpc("accept_invite", { _token: token });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Convite aceito. Bem-vindo à loja!");
    await qc.invalidateQueries({ queryKey: ["session-bootstrap"] });
    navigate({ to: "/app" });
  }

  async function switchAccount() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { redirect: `/convite/${token}` }, replace: true });
  }

  let body: React.ReactNode;
  if (loadingSession) {
    body = <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
  } else if (!session) {
    body = (
      <>
        <h1 className="text-xl font-semibold">Você recebeu um convite</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Entre ou crie sua conta com o e-mail que recebeu o convite para continuar.
        </p>
        <Button className="mt-6 w-full" onClick={() => navigate({ to: "/auth", search: { redirect: `/convite/${token}` } })}>
          Entrar ou criar conta
        </Button>
      </>
    );
  } else if (loadingInvite || !invite) {
    body = <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
  } else if (invite.status === "valid") {
    body = (
      <>
        <h1 className="text-xl font-semibold">Convite para {invite.store_name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Você foi convidado como <strong>{invite.role ? ROLE_LABEL[invite.role] : ""}</strong> com o e-mail <strong>{invite.email}</strong>.
        </p>
        <Button className="mt-6 w-full" disabled={busy} onClick={accept}>{busy ? "Aceitando…" : "Aceitar convite"}</Button>
        <button type="button" className="mt-3 w-full text-sm text-muted-foreground hover:underline" onClick={switchAccount}>
          Não é você? Entrar com outra conta
        </button>
      </>
    );
  } else if (invite.status === "other_email") {
    body = (
      <>
        <h1 className="text-xl font-semibold">Convite para outro e-mail</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Este convite foi criado para outro endereço de e-mail. Saia e entre com a conta que recebeu o convite.
        </p>
        <Button className="mt-6 w-full" variant="outline" onClick={switchAccount}>Sair e trocar de conta</Button>
      </>
    );
  } else {
    body = (
      <>
        <h1 className="text-xl font-semibold">Convite indisponível</h1>
        <p className="mt-2 text-sm text-muted-foreground">{STATUS_TEXT[invite.status]}</p>
        <Link to="/app" className="mt-6 inline-block text-sm underline">Ir para o início</Link>
      </>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center">{body}</div>
    </div>
  );
}
