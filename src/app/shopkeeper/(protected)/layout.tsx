import ShopkeeperGuard from "../_components/ShopkeeperGuard";

export default function ShopkeeperProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ShopkeeperGuard>{children}</ShopkeeperGuard>;
}
