import Link from "next/link";

export default function HomeButton() {
  return (
    <Link href="/">
      <a className="text-sm font-medium hover:text-primary transition">Home</a>
    </Link>
  );
}
