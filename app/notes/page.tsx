'use client';
import MainLayout from "@/components/layout/MainLayout";
import Calendar from "./Calendar";

export default function NotesPage() {
  return (
    <MainLayout>
      <div className="w-full h-full flex items-center justify-center">
        <Calendar />
      </div>
    </MainLayout>
  );
}
