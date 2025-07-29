// app/login/page.tsx
import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout"; // Импортируем AuthLayout

export default function LoginPage() {
  return (
    <AuthLayout showSignInButton={true} isLoginPage={true}>
      <LoginForm />
      <p className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm"></p>
    </AuthLayout>
  );
}
