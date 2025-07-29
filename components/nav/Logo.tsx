import Link from "next/link";
import Image from "next/image";
import logo from "@/img/logo-1.png";

const Logo = () => (
  <Link href="/" className="flex items-center gap-3">
    <Image src={logo} alt="Logo" width={50} height={50} />
    <span className="text-lg font-semibold text-black dark:text-white">
      Avalon Shipping SRL
    </span>
  </Link>
);

export default Logo;
