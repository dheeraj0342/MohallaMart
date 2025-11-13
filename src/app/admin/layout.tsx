import AdminLayoutShell from "./_components/AdminLayoutShell";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-linear-to-b from-[#f9fafb] via-white to-[#ffffff] dark:from-[#0d1117] dark:via-[#13181c] dark:to-[#181c1f]">
      <AdminLayoutShell>{children}</AdminLayoutShell>
      <Toaster />
    </section>
  );
}
