"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

const SocialAuthButtons = () => {
  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
  };

  const buttonClass =
    "w-full py-2.5 px-5 font-medium rounded-full bg-white text-gray-700 border border-gray-200 shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-700 flex items-center justify-center gap-3 transition-all duration-200 transform active:scale-[0.98]";

  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="ghost"
        onClick={() => handleSocialLogin("Google")}
        className={
          buttonClass +
          " hover:bg-gray-50 hover:border-indigo-200 dark:hover:bg-gray-700/50 dark:hover:border-indigo-500/30"
        }
      >
        <Image
          src="/icons/google-icon.png"
          alt="Google"
          width={20}
          height={20}
        />
        <span className="text-sm">Continue with Google</span>
      </Button>

      <Button
        variant="ghost"
        onClick={() => handleSocialLogin("Facebook")}
        className={
          buttonClass +
          " hover:bg-gray-50 hover:border-indigo-200 dark:hover:bg-gray-700/50 dark:hover:border-indigo-500/30"
        }
      >
        <Image
          src="/icons/facebook-icon.png"
          alt="Facebook"
          width={20}
          height={20}
        />
        <span className="text-sm">Continue with Facebook</span>
      </Button>

      <Button
        variant="ghost"
        onClick={() => handleSocialLogin("Apple")}
        className={
          buttonClass +
          " hover:bg-gray-50 hover:border-indigo-200 dark:hover:bg-gray-700/50 dark:hover:border-indigo-500/30"
        }
      >
        <Image src="/icons/apple-icon.png" alt="Apple" width={20} height={20} />
        <span className="text-sm">Continue with Apple</span>
      </Button>
    </div>
  );
};

export default SocialAuthButtons;
