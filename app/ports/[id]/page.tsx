import { redirect } from "next/navigation";

/** Port details live in the edit dialog of the directory; old deep links land there */
export default function PortDetailPage() {
  redirect("/ports");
}
