'use client';

import AuthModalContent from "@/components/auth/AuthModalContent";
import { useRouter } from "next/navigation"; // 1. Импортируем хук роутера

export default function AuthPage() {
  const router = useRouter(); // 2. Инициализируем роутер

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gray-900 p-4 overflow-auto">
      {/* 3. Передаем функцию закрытия (рединрект на главную) */}
      <AuthModalContent onCloseModal={() => router.push('/')} />
    </main>
  );
}