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
    // Этот div внутри DialogContent будет занимать всю его ширину и высоту.
    // DialogContent контролирует общую max-width на разных брейкпоинтах.
    <div className="flex h-full w-full">
      {/* Левая часть с изображением */}
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

      {/* Правая часть с формами (адаптивная колонка) */}
      {/* p-6 sm:p-8 lg:p-10: адаптивные отступы внутри */}
      <div className="flex flex-1 flex-col items-center justify-start p-6 sm:p-8 lg:p-10">
        <AuthTabs onCloseModal={onCloseModal} />
      </div>
    </div>
  );
};

export default AuthModalContent;
