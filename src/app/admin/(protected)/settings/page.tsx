"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const settings = useQuery(api.settings.getSettings);
  const saveSetting = useMutation(api.settings.saveSetting);
  const [isSaving, setIsSaving] = useState(false);

  // Local state for form inputs
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [defaultRadius, setDefaultRadius] = useState("2");
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState("199");
  const [deliveryFee, setDeliveryFee] = useState("40");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);

  // Load settings when fetched
  useEffect(() => {
    if (settings) {
      setSupportEmail((settings.support_email as string) || "");
      setSupportPhone((settings.support_phone as string) || "");
      setDefaultRadius((settings.default_radius as number)?.toString() || "2");
      setFreeDeliveryThreshold((settings.free_delivery_threshold as number)?.toString() || "199");
      setDeliveryFee((settings.delivery_fee as number)?.toString() || "40");
      setEmailNotifications((settings.email_notifications as boolean) ?? true);
      setSmsNotifications((settings.sms_notifications as boolean) ?? true);
    }
  }, [settings]);

  const handleSavePlatformSettings = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        saveSetting({ key: "support_email", value: supportEmail, description: "Support Email Address" }),
        saveSetting({ key: "support_phone", value: supportPhone, description: "Support Phone Number" }),
      ]);
      toast.success("Platform settings saved successfully");
    } catch (error) {
      toast.error("Failed to save platform settings");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDeliverySettings = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        saveSetting({ key: "default_radius", value: parseFloat(defaultRadius), description: "Default Delivery Radius (km)" }),
        saveSetting({ key: "free_delivery_threshold", value: parseFloat(freeDeliveryThreshold), description: "Free Delivery Threshold (INR)" }),
        saveSetting({ key: "delivery_fee", value: parseFloat(deliveryFee), description: "Default Delivery Fee (INR)" }),
      ]);
      toast.success("Delivery settings saved successfully");
    } catch (error) {
      toast.error("Failed to save delivery settings");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        saveSetting({ key: "email_notifications", value: emailNotifications, description: "Enable Email Notifications" }),
        saveSetting({ key: "sms_notifications", value: smsNotifications, description: "Enable SMS Notifications" }),
      ]);
      toast.success("Notification settings saved successfully");
    } catch (error) {
      toast.error("Failed to save notification settings");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (settings === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="supportPhone">Support Phone</Label>
            <Input
              id="supportPhone"
              type="tel"
              placeholder="+91 1234567890"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
            />
          </div>
          <Button onClick={handleSavePlatformSettings} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
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
              min="1"
              max="10"
              value={defaultRadius}
              onChange={(e) => setDefaultRadius(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="freeDeliveryThreshold">Free Delivery Threshold (₹)</Label>
            <Input
              id="freeDeliveryThreshold"
              type="number"
              min="0"
              value={freeDeliveryThreshold}
              onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="deliveryFee">Default Delivery Fee (₹)</Label>
            <Input
              id="deliveryFee"
              type="number"
              min="0"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveDeliverySettings} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
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
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
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
              checked={smsNotifications}
              onChange={(e) => setSmsNotifications(e.target.checked)}
              className="h-4 w-4"
            />
          </div>
          <Button onClick={handleSaveNotificationSettings} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

