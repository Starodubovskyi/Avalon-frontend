// ForInspectorsButton.jsx
import Link from "next/link";

export default function ForInspectorsButton() {
  return (
    <Link href="/for-inspectors">
      <a className="text-sm font-medium hover:text-primary transition">
        For Inspectors
      </a>
    </Link>
  );
}
