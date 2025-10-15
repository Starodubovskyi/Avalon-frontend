import PortsDetailClient from "./PortsDetailClient";
import { PORTS } from "@/components/lineup/ports/mockPorts";
import type { Metadata } from "next";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const port = PORTS.find((p) => p.id === params.id);
  const title = `${port?.name ?? "Port"} — Avalol Ship`;
  return { title };
}

export default function Page({ params }: Props) {
  return <PortsDetailClient id={params.id} />;
}
