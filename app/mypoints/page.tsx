import MainLayout from "@/components/layout/MainLayout";
import MyPointsView from "@/components/mypoints/MyPointsView";

export const metadata = {
  title: "My Points | Maritime Dashboard",
  description: "Manage your custom map markers and favorite locations.",
};

export default function MyPointsPage() {
  return (
    <MainLayout>
      <div className="relative min-h-screen w-full overflow-hidden bg-gray-50 dark:bg-[#0A0A0A]">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-200/40 dark:bg-blue-900/20 blur-[120px] mix-blend-multiply dark:mix-blend-soft-light animate-blob" />

          <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-200/40 dark:bg-indigo-900/20 blur-[120px] mix-blend-multiply dark:mix-blend-soft-light animate-blob animation-delay-2000" />

          <div className="absolute top-[30%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-sky-100/50 dark:bg-sky-800/10 blur-[100px] mix-blend-normal opacity-70 dark:opacity-50 animate-blob animation-delay-4000" />
        </div>

        <div className="relative z-10 pb-20">
          <MyPointsView />
        </div>
      </div>
    </MainLayout>
  );
}
