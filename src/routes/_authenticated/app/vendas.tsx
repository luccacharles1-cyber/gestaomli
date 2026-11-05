import { createFileRoute } from "@tanstack/react-router";
import { EmDesenvolvimento } from "@/components/app/EmDesenvolvimento";

export const Route = createFileRoute("/_authenticated/app/vendas")({
  head: () => ({ meta: [{ title: "Vendas — MLI Gestão" }, { name: "description", content: "Fluxo de venda com cliente, aparelho, usado na troca, pagamentos combinados e recibo." }, { property: "og:title", content: "Vendas — MLI Gestão" }, { property: "og:description", content: "Fluxo de venda com cliente, aparelho, usado na troca, pagamentos combinados e recibo." }] }),
  component: () => <EmDesenvolvimento title="Vendas" description="Fluxo de venda com cliente, aparelho, usado na troca, pagamentos combinados e recibo." />,
});
