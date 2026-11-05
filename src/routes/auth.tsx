import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import "@lovable.dev/cloud-auth-js/styles.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const r = search.redirect;
    return { redirect: typeof r === "string" && r.startsWith("/") && !r.startsWith("//") ? r : undefined };
  },
  head: () => ({
    meta: [
      { title: "Entrar — MLI Gestão" },
      { name: "description", content: "Acesse ou crie a conta da sua loja no MLI Gestão." },
      { property: "og:title", content: "Entrar — MLI Gestão" },
      { property: "og:description", content: "Acesse ou crie a conta da sua loja no MLI Gestão." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/app", replace: true });
    });
  }, [navigate]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { toast.error(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message); return; }
    navigate({ to: "/app" });
  }

  async function onSignup(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("A senha deve ter pelo menos 8 caracteres."); return; }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/app` },
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    if (data.session) navigate({ to: "/app" });
    else setNotice("Enviamos um link de confirmação para o seu e-mail. Confirme para entrar.");
  }

  async function onForgot(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setNotice("Se houver uma conta com este e-mail, você receberá um link para criar nova senha.");
  }

  async function oauth(provider: "google" | "lovable") {
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/auth" });
    if (result.error) { toast.error("Não foi possível entrar. Tente novamente."); return; }
    if (result.redirected) return;
    navigate({ to: "/app" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-sidebar-accent font-display text-sm font-bold text-gold">M</span>
          <span className="font-display text-lg font-semibold">MLI Gestão</span>
        </div>
        <div>
          <h2 className="text-3xl font-semibold leading-snug text-sidebar-accent-foreground">
            Cada aparelho rastreado.
            <br />
            Cada número no lugar.
          </h2>
          <p className="mt-4 max-w-sm text-sidebar-foreground/70">Estoque por IMEI, fotos reais e equipe com permissões, num só lugar.</p>
        </div>
        <p className="text-xs text-sidebar-foreground/50">© MLI Gestão</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold">Bem-vindo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Entre ou crie a conta da sua loja.</p>
          {notice && <div className="mt-6 rounded-lg border border-gold/40 bg-gold-soft p-4 text-sm">{notice}</div>}
          <Tabs value={tab} onValueChange={(v) => { setTab(v); setNotice(null); }} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={onLogin} className="mt-4 space-y-4">
                <Field label="E-mail" id="email"><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
                <Field label="Senha" id="password"><Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
                <Button className="w-full" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</Button>
                <button type="button" className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline" onClick={() => setTab("forgot")}>
                  Esqueci minha senha
                </button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={onSignup} className="mt-4 space-y-4">
                <Field label="E-mail" id="semail"><Input id="semail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
                <Field label="Senha (mín. 8 caracteres)" id="spassword"><Input id="spassword" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
                <Button className="w-full" disabled={busy}>{busy ? "Criando…" : "Criar conta"}</Button>
              </form>
            </TabsContent>
            <TabsContent value="forgot">
              <form onSubmit={onForgot} className="mt-4 space-y-4">
                <Field label="E-mail da conta" id="femail"><Input id="femail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
                <Button className="w-full" disabled={busy}>Enviar link</Button>
                <button type="button" className="w-full text-center text-sm text-muted-foreground hover:underline" onClick={() => setTab("login")}>Voltar</button>
              </form>
            </TabsContent>
          </Tabs>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />ou<div className="h-px flex-1 bg-border" /></div>
          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={() => oauth("google")}>Continuar com Google</Button>
            <button type="button" className="lovable-auth-button w-full" onClick={() => oauth("lovable")}>Continue with Lovable</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
