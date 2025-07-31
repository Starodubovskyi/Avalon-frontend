import Image from "next/image";
import Link from "next/link";
import logo from "@/img/logo-1.png";
import clsx from "clsx";

interface LogoSideBarProps {
  isSidebarExpanded: boolean;
}

const LogoSideBar = ({ isSidebarExpanded }: LogoSideBarProps) => {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <Image
        src={logo}
        alt="Logo"
        width={32}
        height={32}
        className="shrink-0"
      />
      <span
        className={clsx(
          "text-lg font-bold text-primary whitespace-nowrap transition-opacity duration-300",
          isSidebarExpanded
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100"
        )}
      >
        Avalon Shipping SRL
      </span>
    </Link>
  );
};

export default LogoSideBar;
