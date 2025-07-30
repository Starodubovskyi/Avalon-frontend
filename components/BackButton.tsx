import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  text: string;
  link: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ text, link, className }) => {
  return (
    <Link href={link} passHref legacyBehavior>
      <a
        className={cn(
          "inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          "hover:bg-accent hover:text-accent-foreground",
          className
        )}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        {text}
      </a>
    </Link>
  );
};

export default BackButton;
