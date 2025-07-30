import Image from "next/image";
import logo from "@/img/3.webp";
import styles from "./AuthLayout.module.css";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  isLoginPage: boolean;
  showSignInButton?: boolean;
  onClose?: () => void;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  isLoginPage,
  showSignInButton = false,
}) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.container}>
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
        <div className={styles.formSection}>
          {showSignInButton && !isLoginPage && (
            <div className={styles.signInButtonWrapper}>
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:underline font-semibold"
              >
                Sign In
              </Link>
            </div>
          )}
          <div className={styles.contentWrapper}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
