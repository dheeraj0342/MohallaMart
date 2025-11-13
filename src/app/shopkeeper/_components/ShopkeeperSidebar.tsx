"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Store,
  LayoutDashboard,
  ClipboardList,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const NAV = [
  {
    title: "Store HQ",
    items: [
      { href: "/shopkeeper/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/shopkeeper/profile", label: "Profile", icon: Store },
    ],
  },
  {
    title: "Onboarding",
    items: [
      { href: "/shopkeeper/registration", label: "Registration", icon: ClipboardList },
    ],
  },
];

export default function ShopkeeperSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="icon">
      {/* HEADER */}
      <SidebarHeader>
        <div className="flex items-center gap-2 sm:gap-3 px-2 py-2 sm:py-3 min-w-0">
          <div className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)]">
            <Store className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="flex-1 min-w-0 leading-tight text-sm">
            <p className="font-semibold truncate text-[var(--sidebar-foreground)]">Seller Hub</p>
            <p className="text-[var(--sidebar-foreground)]/70 text-xs truncate">MohallaMart</p>
          </div>
        </div>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent>
        {NAV.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="px-2">{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href || pathname.startsWith(item.href + "/");

                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                        className="min-w-0"
                      >
                        <Link href={item.href} className="flex items-center gap-2 min-w-0">
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            {/* SESSION */}
            <SidebarMenu className="mt-2 sm:mt-4">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="min-w-0"
                >
                  <Link href="/shopkeeper/login" className="flex items-center gap-2 min-w-0">
                    <LogOut className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Manage session</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
