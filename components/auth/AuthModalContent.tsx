"use client";

import Image from "next/image";
import AuthTabs from "./AuthTabs";
import img from "@/img/3.3.jpg";

interface AuthModalContentProps {
  onCloseModal: () => void;
}

const AuthModalContent: React.FC<AuthModalContentProps> = ({
  onCloseModal,
}) => {
  return (
    <div className="flex h-full w-full flex-col lg:flex-row">
      <div className="relative hidden lg:flex flex-[1.2] items-center justify-center overflow-hidden rounded-l-lg">
        <Image
          src={img}
          alt="Ship"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-transparent"></div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-start p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto">
        <AuthTabs onCloseModal={onCloseModal} />
      </div>
    </div>
  );
};

export default AuthModalContent;
