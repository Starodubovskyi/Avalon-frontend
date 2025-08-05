"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

const SocialAuthButtons = () => {
  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
  };

  const buttonClass =
    "w-full py-3 px-5 font-semibold rounded-full bg-white text-gray-900 border border-gray-300 shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-600 flex items-center justify-center gap-2 transition-transform duration-200 transform hover:scale-[1.02]";

  return (
    <div className="flex flex-col gap-3 pt-4 overflow-hidden">
      <Button
        variant="outline"
        onClick={() => handleSocialLogin("Google")}
        className={buttonClass + " hover:bg-gray-100 dark:hover:bg-gray-700"}
      >
        <Image
          src="/icons/google-icon.png"
          alt="Google"
          width={18}
          height={18}
        />
        Continue with Google
      </Button>

      <Button
        variant="outline"
        onClick={() => handleSocialLogin("Facebook")}
        className={buttonClass + " hover:bg-gray-100 dark:hover:bg-gray-700"}
      >
        <Image
          src="/icons/facebook-icon.png"
          alt="Facebook"
          width={18}
          height={18}
        />
        Continue with Facebook
      </Button>

      <Button
        variant="outline"
        onClick={() => handleSocialLogin("Apple")}
        className={buttonClass + " hover:bg-gray-100 dark:hover:bg-gray-700"}
      >
        <Image
          src="/icons/apple-icon.png"
          alt="Apple"
          width={18}
          height={18}
        />
        Continue with Apple
      </Button>
    </div>
  );
};

export default SocialAuthButtons;
