// components/auth/SocialAuthButtons.tsx
"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "@/components/ui/use-toast";
// import styles from "./SocialAuthButtons.module.css"; // Удален импорт CSS

const SocialAuthButtons = () => {
  const handleSocialLogin = (provider: string) => {
    toast({
      title: `${provider} Login`,
      description: `Login with ${provider} is not implemented yet. Coming soon!`,
    });
  };

  return (
    <div className="w-full flex flex-col justify-start gap-4">
      {" "}
      {/* socialAuthContainer */}
      <Button
        variant="outline"
        className="w-full py-3.5 px-6 font-semibold rounded-full bg-white text-gray-900 border-2 border-gray-400 shadow-[4px_8px_19px_-3px_rgba(0,0,0,0.27)] transition-all duration-250 ease-in-out cursor-pointer hover:bg-gray-50 hover:scale-105" // googleButton
        onClick={() => handleSocialLogin("Google")}
      >
        <Image
          src="/images/google-icon.svg"
          alt="Google"
          width={18}
          height={18}
          className="mb-px"
        />
        Continue with Google
      </Button>
      <Button
        variant="outline"
        className="w-full py-3.5 px-6 font-semibold rounded-full bg-black text-white border-2 border-black shadow-[4px_8px_19px_-3px_rgba(0,0,0,0.27)] transition-all duration-250 ease-in-out cursor-pointer hover:bg-gray-800 hover:scale-105" // appleButton
        onClick={() => handleSocialLogin("Apple")}
      >
        <Image
          src="/images/apple-icon.svg"
          alt="Apple"
          width={18}
          height={18}
          className="mb-px"
        />
        Continue with Apple
      </Button>
    </div>
  );
};

export default SocialAuthButtons;
