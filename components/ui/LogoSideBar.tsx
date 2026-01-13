import Image from "next/image";
import Link from "next/link";
import logo from "@/img/logo-1.png";
import clsx from "clsx";

interface LogoSideBarProps {
  isSidebarExpanded: boolean;
}

const LogoSideBar = ({ isSidebarExpanded }: LogoSideBarProps) => {
  return (
    <Link href="/" className="flex items-center h-8 shrink-0 overflow-hidden">
      <Image
        src={logo}
        alt="Logo"
        width={32}
        height={32}
        className="shrink-0"
      />
      <span
        className={clsx(
          "text-lg font-bold text-primary whitespace-nowrap transition-all duration-300 ease-in-out",
          isSidebarExpanded
            ? "w-auto opacity-100 ml-2 translate-x-0"
            : "w-0 opacity-0 ml-0 -translate-x-4 overflow-hidden"
        )}
      >
        Avalon
      </span>
    </Link>
  );
};

export default LogoSideBar;
