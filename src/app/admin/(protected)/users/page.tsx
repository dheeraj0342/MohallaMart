"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  User,
  UserCheck,
  UserX,
  ShieldCheck,
  Store,
  Mail,
  Calendar,
  Clock,
  Loader2,
  Filter,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import UserRoleChangeDialog from "./_components/UserRoleChangeDialog";

export type UserRole = "customer" | "shop_owner" | "admin";

export default function AdminUsersPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const users = useQuery(
    api.users.getAllUsers,
    selectedRole === "all" ? {} : { role: selectedRole }
  ) as Array<{
    _id: string;
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    role: UserRole;
    is_active: boolean;
    created_at: number;
    updated_at: number;
  }> | undefined;

  // Filter users based on status and search query
  const filteredUsers = users
    ? users.filter((user) => {
        // Filter by status
        if (selectedStatus === "active" && !user.is_active) return false;
        if (selectedStatus === "inactive" && user.is_active) return false;

        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            (user.phone && user.phone.toLowerCase().includes(query))
          );
        }

        return true;
      })
    : [];


  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="success" className="gap-1.5">
        <UserCheck className="h-3 w-3" />
        Active
      </Badge>
    ) : (
      <Badge variant="destructive" className="gap-1.5">
        <UserX className="h-3 w-3" />
        Inactive
      </Badge>
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return "Today";
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const roleFilters: Array<{ value: UserRole | "all"; label: string }> = [
    { value: "all", label: "All Roles" },
    { value: "customer", label: "Customers" },
    { value: "shop_owner", label: "Shop Owners" },
    { value: "admin", label: "Admins" },
  ];

  const statusFilters: Array<{ value: "all" | "active" | "inactive"; label: string }> = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  // Calculate statistics
  const stats = users
    ? {
        total: users.length,
        customers: users.filter((u) => u.role === "customer").length,
        shopOwners: users.filter((u) => u.role === "shop_owner").length,
        admins: users.filter((u) => u.role === "admin").length,
        active: users.filter((u) => u.is_active).length,
        inactive: users.filter((u) => !u.is_active).length,
      }
    : {
        total: 0,
        customers: 0,
        shopOwners: 0,
        admins: 0,
        active: 0,
        inactive: 0,
      };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">Users Management</CardTitle>
              <CardDescription className="mt-2 text-base">
                View and manage all users in the system, including customers, shop owners, and admins.
              </CardDescription>
            </div>
            <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-xl bg-primary-brand/10 dark:bg-primary-brand/20 text-primary-brand">
              <Users className="h-8 w-8" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <User className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers}</div>
            <p className="text-xs text-muted-foreground mt-1">Regular customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shop Owners</CardTitle>
            <Store className="h-4 w-4 text-primary-brand" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shopOwners}</div>
            <p className="text-xs text-muted-foreground mt-1">Active shopkeepers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <ShieldCheck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
            <p className="text-xs text-muted-foreground mt-1">Administrators</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground mt-1">Disabled accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary-brand" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
          <CardDescription>Filter users by role, status, or search by name/email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role Filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <div className="flex flex-wrap gap-2">
                {roleFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    type="button"
                    onClick={() => setSelectedRole(filter.value)}
                    variant={selectedRole === filter.value ? "default" : "outline"}
                    size="sm"
                    className={
                      selectedRole === filter.value
                        ? "bg-primary-brand hover:bg-primary-brand/90 text-white"
                        : ""
                    }
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Status Filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    type="button"
                    onClick={() => setSelectedStatus(filter.value)}
                    variant={selectedStatus === filter.value ? "default" : "outline"}
                    size="sm"
                    className={
                      selectedStatus === filter.value
                        ? "bg-primary-brand hover:bg-primary-brand/90 text-white"
                        : ""
                    }
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Users List</CardTitle>
          <CardDescription>
            Showing {filteredUsers.length} of {stats.total} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!users && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Loading users...</p>
            </div>
          )}

          {users && filteredUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-foreground">No users found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "No users match the selected filters"}
              </p>
            </div>
          )}

          {users && filteredUsers.length > 0 && (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                        User
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                        From
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Last Activity
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-brand/10 dark:bg-primary-brand/20 text-sm font-semibold text-primary-brand">
                              {user.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">{user.name}</p>
                              {user.phone && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {user.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <UserRoleChangeDialog
                            userId={user.id}
                            currentRole={user.role}
                            userName={user.name}
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-foreground truncate max-w-[200px]">
                              {user.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">{getStatusBadge(user.is_active)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {formatDate(user.created_at)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {formatDateTime(user.updated_at)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredUsers.map((user) => (
                  <Card key={user._id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-brand/10 dark:bg-primary-brand/20 text-sm font-semibold text-primary-brand">
                          {user.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground truncate">{user.name}</p>
                              {user.phone && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {user.phone}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                              <UserRoleChangeDialog
                                userId={user.id}
                                currentRole={user.role}
                                userName={user.name}
                              />
                              {getStatusBadge(user.is_active)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground truncate">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(user.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              <span>{formatDateTime(user.updated_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

