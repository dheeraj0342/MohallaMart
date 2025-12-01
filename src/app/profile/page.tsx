"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  CheckCircle2,
  Copy,
  Loader2,
  Settings,
  Shield,
  ShoppingCart,
  Heart,
  Star,
  Save,
  RotateCcw,
  Lock,
  Smartphone,
  AlertTriangle,
  Edit,
  Share2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type DBUser = {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
};

export default function UserProfilePage() {
  const { user } = useAuth();
  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip",
  ) as DBUser | null | undefined;
  const updateUser = useMutation(api.users.updateUser);
  const { success, error: errorToast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (dbUser) {
      setName(dbUser.name || "");
      setPhone(dbUser.phone || "");
      setAvatar(dbUser.avatar_url || "");
    }
  }, [dbUser]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateUser({ id: user.id, name, phone, avatar_url: avatar });
      success("Profile updated successfully");
    } catch (err) {
      errorToast("Failed to update profile");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (dbUser) {
      setName(dbUser.name || "");
      setPhone(dbUser.phone || "");
      setAvatar(dbUser.avatar_url || "");
    }
  };

  const copyEmail = async () => {
    if (dbUser?.email) {
      try {
        await navigator.clipboard.writeText(dbUser.email);
        setCopied(true);
        success("Email copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        errorToast("Failed to copy email");
      }
    }
  };

  if (user === null || dbUser === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-6">🔐</div>
            <CardTitle className="text-3xl mb-3">Sign In Required</CardTitle>
            <CardDescription className="text-lg mb-8">
              Please sign in to access and manage your profile.
            </CardDescription>
            <Button asChild className="w-full">
              <Link href="/auth">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white/30 shadow-2xl">
                  {avatar ? (
                    <AvatarImage src={avatar} alt={name || "User"} />
                  ) : (
                    <AvatarFallback className="bg-white/20 text-white text-4xl">
                      <User className="h-16 w-16" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-[var(--success-bg-light)] dark:bg-[var(--success-bg-light)] border-4 border-white flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-[var(--success-fg)]" />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {name || "Your Profile"}
                </h1>
                <p className="text-white/90 text-lg mb-4">
                  Welcome back! Manage your account and preferences
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse mr-2" />
                    Active User
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <Mail className="h-3 w-3 mr-2" />
                    {dbUser?.email}
                  </Badge>
                  {phone && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      <Phone className="h-3 w-3 mr-2" />
                      {phone}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 shrink-0">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <TabsList className="flex flex-col w-full h-auto bg-transparent p-0 gap-2">
                    <TabsTrigger
                      value="profile"
                      className="w-full justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </TabsTrigger>
                    <TabsTrigger
                      value="settings"
                      className="w-full justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </TabsTrigger>
                    <TabsTrigger
                      value="security"
                      className="w-full justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Security
                    </TabsTrigger>
                  </TabsList>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              <TabsContent value="profile" className="space-y-6 mt-0">
                {/* Profile Overview */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Profile Overview</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab("settings")}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold mb-2">Full Name</Label>
                          <div className="p-4 bg-muted rounded-xl border border-border">
                            <span className="text-foreground font-medium">{name || "Not set"}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold mb-2">Phone Number</Label>
                          <div className="p-4 bg-muted rounded-xl border border-border">
                            <span className="text-foreground font-medium">{phone || "Not set"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold mb-2">Email Address</Label>
                          <div className="p-4 bg-muted rounded-xl border border-border flex items-center justify-between">
                            <span className="text-foreground font-medium">{dbUser?.email}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={copyEmail}
                              className="h-8"
                            >
                              {copied ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold mb-2">Account Status</Label>
                          <div className="p-4 bg-[var(--success-bg-light)] dark:bg-[var(--success-bg-light)] rounded-xl border border-[var(--success-fg)]/20">
                            <span className="text-[var(--success-fg)] font-medium flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-[var(--success-fg)] animate-pulse" />
                              Active & Verified
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold text-foreground mb-1">0</div>
                      <div className="text-sm text-muted-foreground">Total Orders</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Heart className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold text-foreground mb-1">0</div>
                      <div className="text-sm text-muted-foreground">Wishlist Items</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold text-foreground mb-1">—</div>
                      <div className="text-sm text-muted-foreground">Average Rating</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>
                      Update your personal information and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={onSave} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 XXXXX XXXXX"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="avatar">Avatar URL</Label>
                        <Input
                          id="avatar"
                          type="url"
                          value={avatar}
                          onChange={(e) => setAvatar(e.target.value)}
                          placeholder="https://example.com/avatar.png"
                        />
                        {avatar && (
                          <div className="mt-4 p-4 bg-muted rounded-xl flex items-center gap-4 border border-border">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={avatar} alt="Avatar Preview" />
                              <AvatarFallback>
                                <User className="h-8 w-8" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-semibold text-muted-foreground">Preview</div>
                              <div className="text-sm font-medium text-foreground truncate max-w-xs">
                                {avatar}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="flex gap-4">
                        <Button
                          type="submit"
                          disabled={saving}
                          className="flex-1"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving…
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleReset}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security and privacy settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-6 bg-[var(--info-bg-light)] dark:bg-[var(--info-bg-light)] rounded-xl border border-[var(--info-fg)]/20">
                      <div className="flex items-start gap-4">
                        <Lock className="h-6 w-6 text-[var(--info-fg)] mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-[var(--info-fg)] text-lg mb-2">
                            Password Security
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Keep your account secure with a strong password. Change it regularly for better security.
                          </p>
                          <Button variant="outline" size="sm" className="bg-[var(--info-fg)] text-white hover:bg-[var(--info-fg)]/90 border-[var(--info-fg)]">
                            Change Password
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-[var(--warning-bg-light)] dark:bg-[var(--warning-bg-light)] rounded-xl border border-[var(--warning-fg)]/20">
                      <div className="flex items-start gap-4">
                        <Smartphone className="h-6 w-6 text-[var(--warning-fg)] mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-[var(--warning-fg)] text-lg mb-2">
                            Two-Factor Authentication
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Add an extra layer of security to your account with 2FA.
                          </p>
                          <Button variant="outline" size="sm" className="bg-[var(--warning-fg)] text-white hover:bg-[var(--warning-fg)]/90 border-[var(--warning-fg)]">
                            Enable 2FA
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-[var(--error-bg-light)] dark:bg-[var(--error-bg-light)] rounded-xl border border-[var(--error-fg)]/20">
                      <div className="flex items-start gap-4">
                        <AlertTriangle className="h-6 w-6 text-[var(--error-fg)] mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-[var(--error-fg)] text-lg mb-2">
                            Danger Zone
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Permanently delete your account and all associated data.
                          </p>
                          <Button
                            variant="destructive"
                            size="sm"
                          >
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
