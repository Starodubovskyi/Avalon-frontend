// app/register/page.tsx
import RegisterForm from "@/components/auth/RegisterForm";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout"; // Импортируем AuthLayout

export default function RegisterPage() {
  return (
    <AuthLayout showSignInButton={true} isLoginPage={false}>
      <RegisterForm />
      <p className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm"></p>
    </AuthLayout>
  );
}
