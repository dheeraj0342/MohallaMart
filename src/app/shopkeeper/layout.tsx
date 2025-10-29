export default function ShopkeeperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="container mx-auto py-8 px-4  ">{children}</section>
  );
}
