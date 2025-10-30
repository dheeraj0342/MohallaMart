import ShopkeeperGuard from "../_components/ShopkeeperGuard";
export const dynamic = 'force-dynamic';

export default function ShopkeeperProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ShopkeeperGuard>{children}</ShopkeeperGuard>;
}
