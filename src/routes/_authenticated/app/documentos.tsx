import { createFileRoute } from "@tanstack/react-router";
import { EmDesenvolvimento } from "@/components/app/EmDesenvolvimento";

export const Route = createFileRoute("/_authenticated/app/documentos")({
  head: () => ({ meta: [{ title: "Documentos — MLI Gestão" }, { name: "description", content: "Recibos em PDF com numeração própria da loja e histórico de revisões." }, { property: "og:title", content: "Documentos — MLI Gestão" }, { property: "og:description", content: "Recibos em PDF com numeração própria da loja e histórico de revisões." }] }),
  component: () => <EmDesenvolvimento title="Documentos" description="Recibos em PDF com numeração própria da loja e histórico de revisões." />,
});
