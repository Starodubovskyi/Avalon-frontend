// app/register/page.tsx
import RegisterForm from "@/components/auth/RegisterForm"; // Убедитесь, что путь к вашему компоненту RegisterForm правильный
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-4">
        <RegisterForm />
        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
