import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Home, Store } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 item-center">
      <Card className="w-full max-w-lg border-border bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Page Not Found</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">The page you are looking for doesn&apos;t exist or may have been moved.</p>
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="outline">404</Badge>
            <span className="text-xs text-muted-foreground">Requested resource was not found</span>
          </div>
          <Separator className="mb-6" />
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/shops">
                <Store className="h-4 w-4" />
                Browse Shops
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
