import { api } from "@/../convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bike, MapPin, CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminRidersPage() {
  // Get all riders
  const riders = await fetchQuery(api.riders.getAllRiders, {}).catch(() => []) as Array<{
    _id: string;
    rider_id: string; // This is a Convex ID reference to users table
    current_location: { lat: number; lon: number };
    is_online: boolean;
    is_busy: boolean;
    assigned_order_id?: string;
    updated_at: number;
    created_at: number;
  }>;

  // Get user details for each rider
  // Note: rider_id is a Convex ID reference to users table
  // We need to get the user by their Supabase ID, not Convex ID
  // For now, we'll show rider info without user details (can be enhanced later)
  const ridersWithUsers = riders.map((rider) => ({
    ...rider,
    user: null as { name?: string; email?: string; phone?: string } | null,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Riders Management</CardTitle>
          <CardDescription>
            View and manage all delivery riders
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Riders</CardTitle>
            <Bike className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riders.filter((r) => r.is_online).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riders.filter((r) => r.is_online && !r.is_busy).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Busy</CardTitle>
            <XCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riders.filter((r) => r.is_busy).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Riders List */}
      <Card>
        <CardHeader>
          <CardTitle>All Riders</CardTitle>
        </CardHeader>
        <CardContent>
          {ridersWithUsers.length === 0 ? (
            <div className="text-center py-12">
              <Bike className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No riders registered yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ridersWithUsers.map((rider) => (
                <div
                  key={rider._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">
                        {rider.user?.name || `Rider ${rider._id.slice(-8)}`}
                      </h3>
                      <Badge variant={rider.is_online ? "default" : "secondary"}>
                        {rider.is_online ? "Online" : "Offline"}
                      </Badge>
                      {rider.is_busy && (
                        <Badge variant="outline">Busy</Badge>
                      )}
                    </div>
                    {rider.user?.email && (
                      <p className="text-sm text-muted-foreground">{rider.user.email}</p>
                    )}
                    {rider.user?.phone && (
                      <p className="text-sm text-muted-foreground">{rider.user.phone}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {rider.current_location.lat.toFixed(4)}, {rider.current_location.lon.toFixed(4)}
                      </p>
                    </div>
                    {rider.assigned_order_id && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Order: {rider.assigned_order_id.slice(-8)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Updated: {new Date(rider.updated_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

