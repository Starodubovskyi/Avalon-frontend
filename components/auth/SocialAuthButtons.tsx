// components/auth/SocialAuthButtons.tsx
"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "@/components/ui/use-toast";
import styles from "./SocialAuthButtons.module.css";

const SocialAuthButtons = () => {
  const handleSocialLogin = (provider: string) => {
    toast({
      title: `${provider} Login`,
      description: `Login with ${provider} is not implemented yet. Coming soon!`,
    });
  };

  return (
    <div className={styles.socialAuthContainer}>
      <Button
        variant="outline"
        className={styles.googleButton}
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
        className={styles.appleButton}
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
