// app/login/page.tsx
import LoginForm from "@/components/auth/LoginForm"; // Убедитесь, что путь к вашему компоненту LoginForm правильный
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-4">
        <LoginForm />
        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
