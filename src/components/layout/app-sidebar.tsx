"use client";

import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import Link from "next/link";
import {
  BanknoteIcon,
  CoinsIcon,
  LayoutDashboardIcon,
  UserCogIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarUserMenu } from "./sidebar-user-menu";

const sidebarItems = [
  {
    label: "Dashboard",
    icon: <LayoutDashboardIcon />,
    href: "/dashboard",
  },
  {
    label: "Transaction",
    icon: <BanknoteIcon />,
    href: "/dashboard/transaction",
  },
  {
    label: "Profile",
    icon: <UserCogIcon />,
    href: "/profile",
  },
];

export function AppSidebar({
  user,
}: {
  user: { email: string; name?: string; avatarUrl?: string };
}) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="gap-2 flex-row items-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard">
                <CoinsIcon className="text-primary size-5!" />
                <h1 className="font-bold text-2xl text-primary">Naydira App</h1>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {sidebarItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.label}
                  className={cn(
                    "py-6 px-5 text-md",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground font-semibold hover:bg-primary hover:text-primary-foreground"
                      : "",
                  )}
                >
                  <Link href={item.href}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarUserMenu user={user} />
    </Sidebar>
  );
}
