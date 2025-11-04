export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-linear-to-br from-[#e8f5ee] via-[#fdf3e8] to-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12">{children}</div>
    </section>
  );
}
