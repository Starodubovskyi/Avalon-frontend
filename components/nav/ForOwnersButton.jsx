// ForOwnersButton.jsx
import Link from "next/link";

export default function ForOwnersButton() {
  return (
    <Link href="/for-owners">
      <a className="text-sm font-medium hover:text-primary transition">
        For Owners
      </a>
    </Link>
  );
}
