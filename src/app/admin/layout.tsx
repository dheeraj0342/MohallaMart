import AdminSidebar from "./_components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-linear-to-br from-[#e8f5ee] via-[#fdf3e8] to-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
        <div className="flex flex-col gap-6 lg:flex-row">
          <AdminSidebar />
          <main className="flex-1 rounded-3xl border border-[#e5efe8] bg-white/95 p-6 sm:p-8 shadow-2xl shadow-primary-brand/10 backdrop-blur-sm">
            {children}
          </main>
        </div>
      </div>
    </section>
  );
}
