import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Admin Settings
          </CardTitle>
          <CardDescription>
            Manage platform-wide settings and configurations
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Platform Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
          <CardDescription>
            Configure general platform settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="platformName">Platform Name</Label>
            <Input
              id="platformName"
              defaultValue="MohallaMart"
              disabled
            />
            <p className="text-sm text-muted-foreground mt-1">
              Platform name cannot be changed
            </p>
          </div>
          <div>
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              id="supportEmail"
              type="email"
              placeholder="support@mohallamart.com"
            />
          </div>
          <div>
            <Label htmlFor="supportPhone">Support Phone</Label>
            <Input
              id="supportPhone"
              type="tel"
              placeholder="+91 1234567890"
            />
          </div>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Delivery Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Settings</CardTitle>
          <CardDescription>
            Configure default delivery parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="defaultRadius">Default Delivery Radius (km)</Label>
            <Input
              id="defaultRadius"
              type="number"
              defaultValue="2"
              min="1"
              max="10"
            />
          </div>
          <div>
            <Label htmlFor="freeDeliveryThreshold">Free Delivery Threshold (₹)</Label>
            <Input
              id="freeDeliveryThreshold"
              type="number"
              defaultValue="199"
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="deliveryFee">Default Delivery Fee (₹)</Label>
            <Input
              id="deliveryFee"
              type="number"
              defaultValue="40"
              min="0"
            />
          </div>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Configure notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send email notifications for important events
              </p>
            </div>
            <input
              id="emailNotifications"
              type="checkbox"
              defaultChecked
              className="h-4 w-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="smsNotifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send SMS notifications for order updates
              </p>
            </div>
            <input
              id="smsNotifications"
              type="checkbox"
              defaultChecked
              className="h-4 w-4"
            />
          </div>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

