import MainLayout from "@/components/layout/MainLayout";

export default function PortsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <div className="flex min-h-screen bg-gray-100 dark:bg-black">
        <main
          className="
            flex-1 
            overflow-auto
            bg-white 
            border border-gray-200 
            shadow 
            dark:bg-white/5 
            dark:border-white/10 
            dark:shadow-white/10
          "
        >
          {children}
        </main>
      </div>
    </MainLayout>
  );
}
