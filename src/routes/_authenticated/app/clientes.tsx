import { createFileRoute } from "@tanstack/react-router";
import { EmDesenvolvimento } from "@/components/app/EmDesenvolvimento";

export const Route = createFileRoute("/_authenticated/app/clientes")({
  head: () => ({ meta: [{ title: "Clientes e CRM — MLI Gestão" }, { name: "description", content: "Cadastro de contatos, funil de oportunidades, tarefas e botão para abrir o WhatsApp." }, { property: "og:title", content: "Clientes e CRM — MLI Gestão" }, { property: "og:description", content: "Cadastro de contatos, funil de oportunidades, tarefas e botão para abrir o WhatsApp." }] }),
  component: () => <EmDesenvolvimento title="Clientes e CRM" description="Cadastro de contatos, funil de oportunidades, tarefas e botão para abrir o WhatsApp." />,
});
