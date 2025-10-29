export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="container mx-auto px-4 py-8">{children}</section>;
}
