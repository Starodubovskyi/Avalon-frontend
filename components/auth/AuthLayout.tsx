import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import logo from "@/img/3.webp";
import styles from "./AuthLayout.module.css";

interface AuthLayoutProps {
  children: React.ReactNode;
  showSignInButton?: boolean;
  isLoginPage: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  showSignInButton = true,
  isLoginPage,
}) => {
  return (
    <div className={styles.container}>
      {/* Left part — with image */}
      <div className={styles.imageSection}>
        <Image
          src={logo}
          alt="Ship"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="z-0"
        />
      </div>

      {/* Right part — form */}
      <div className={styles.formSection}>
        {/* Sign In/Sign Up toggle button */}
        {showSignInButton && (
          <div className={styles.toggleButton}>
            <Button variant="outline" className={styles.navButton} asChild>
              <Link href={isLoginPage ? "/register" : "/login"}>
                {isLoginPage ? "Sign Up" : "Sign In"}
              </Link>
            </Button>
          </div>
        )}

        <div className={styles.contentWrapper}>{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
