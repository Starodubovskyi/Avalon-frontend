// components/BackButton.tsx
import Link from "next/link";
import { ChevronLeft } from "lucide-react"; // Assuming you are using lucide-react for icons
import { cn } from "@/lib/utils"; // Assuming you have a utility for combining class names, like `clsx` or `tailwind-merge` with `cn`

interface BackButtonProps {
  text: string;
  link: string;
  className?: string; // Add className to the props interface
}

const BackButton: React.FC<BackButtonProps> = ({ text, link, className }) => {
  return (
    <Link href={link} passHref legacyBehavior>
      <a
        className={cn(
          // Use cn (or your equivalent) to merge classes
          "inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          "hover:bg-accent hover:text-accent-foreground", // Default hover styles
          className // Apply the passed className
        )}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        {text}
      </a>
    </Link>
  );
};

export default BackButton;
