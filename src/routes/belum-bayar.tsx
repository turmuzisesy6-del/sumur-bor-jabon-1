import { createFileRoute } from "@tanstack/react-router";
import { ListBayar } from "./sudah-bayar";

export const Route = createFileRoute("/belum-bayar")({
  head: () => ({ meta: [{ title: "Belum Bayar — SUMUR BOR JABON 1" }] }),
  component: () => <ListBayar status="belum" title="Belum Bayar" />,
});
