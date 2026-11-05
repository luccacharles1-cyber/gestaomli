import { createFileRoute } from "@tanstack/react-router";
import { EmDesenvolvimento } from "@/components/app/EmDesenvolvimento";

export const Route = createFileRoute("/_authenticated/app/avaliacao")({
  head: () => ({ meta: [{ title: "Avaliação de usados — MLI Gestão" }, { name: "description", content: "Tabela própria de avaliação com ajustes por bateria, conservação e limites de aprovação." }, { property: "og:title", content: "Avaliação de usados — MLI Gestão" }, { property: "og:description", content: "Tabela própria de avaliação com ajustes por bateria, conservação e limites de aprovação." }] }),
  component: () => <EmDesenvolvimento title="Avaliação de usados" description="Tabela própria de avaliação com ajustes por bateria, conservação e limites de aprovação." />,
});
