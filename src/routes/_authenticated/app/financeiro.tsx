import { createFileRoute } from "@tanstack/react-router";
import { EmDesenvolvimento } from "@/components/app/EmDesenvolvimento";

export const Route = createFileRoute("/_authenticated/app/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — MLI Gestão" }, { name: "description", content: "Contas, entradas e saídas, contas a pagar e receber, taxas, comissões e retiradas." }, { property: "og:title", content: "Financeiro — MLI Gestão" }, { property: "og:description", content: "Contas, entradas e saídas, contas a pagar e receber, taxas, comissões e retiradas." }] }),
  component: () => <EmDesenvolvimento title="Financeiro" description="Contas, entradas e saídas, contas a pagar e receber, taxas, comissões e retiradas." />,
});
