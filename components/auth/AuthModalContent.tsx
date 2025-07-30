// components/auth/AuthModalContent.tsx
"use client";

import Image from "next/image";
import AuthTabs from "./AuthTabs";
import logo from "@/img/3.1.jpg";

interface AuthModalContentProps {
  onCloseModal: () => void;
}

const AuthModalContent: React.FC<AuthModalContentProps> = ({
  onCloseModal,
}) => {
  return (
    <div className="flex h-full w-full">
      {/* Левая часть - изображение */}
      <div className="relative hidden lg:flex flex-[1.2] items-center justify-center overflow-hidden rounded-l-lg">
        <Image
          src={logo}
          alt="Ship"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-transparent"></div>
      </div>

      {/* Правая часть - формы аутентификации */}
      {/* Удаляем overflow-y-auto */}
      <div className="flex flex-1 flex-col items-center justify-start p-6 sm:p-8 lg:p-10">
        <AuthTabs onCloseModal={onCloseModal} />
      </div>
    </div>
  );
};

export default AuthModalContent;
