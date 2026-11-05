import { createFileRoute } from "@tanstack/react-router";
import { EmDesenvolvimento } from "@/components/app/EmDesenvolvimento";

export const Route = createFileRoute("/_authenticated/app/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — MLI Gestão" }, { name: "description", content: "Relatórios de vendas, margens, giro de estoque e desempenho da equipe." }, { property: "og:title", content: "Relatórios — MLI Gestão" }, { property: "og:description", content: "Relatórios de vendas, margens, giro de estoque e desempenho da equipe." }] }),
  component: () => <EmDesenvolvimento title="Relatórios" description="Relatórios de vendas, margens, giro de estoque e desempenho da equipe." />,
});
