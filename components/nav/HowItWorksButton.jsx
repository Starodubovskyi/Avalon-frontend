// HowItWorksButton.jsx
import Link from "next/link";

export default function HowItWorksButton() {
  return (
    <Link href="/how-it-works">
      <a className="text-sm font-medium hover:text-primary transition">
        How It Works
      </a>
    </Link>
  );
}
