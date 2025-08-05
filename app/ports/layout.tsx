import MainLayout from "@/components/layout/MainLayout";

export default function PortsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
    <div className="flex">
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
    </MainLayout>
  );
}
