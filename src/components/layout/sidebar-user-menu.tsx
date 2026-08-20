"use client";

import { logout } from "@/app/(auth)/action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChevronsUpDownIcon, LogOutIcon, UserRoundPenIcon } from "lucide-react";
import { Separator } from "../ui/separator";
import Link from "next/link";

export function SidebarUserMenu({
  user,
}: {
  user: { email: string; name?: string; avatarUrl?: string };
}) {
  const label = user.name || user.email;

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="h-12">
                <Avatar className="size-7 rounded-xl">
                  <AvatarImage src={user.avatarUrl} alt={label} />
                  <AvatarFallback>{label?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden text-left">
                  <span className="truncate text-sm font-medium">{label}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
                <ChevronsUpDownIcon className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-56 rounded-lg"
              align="end"
              sideOffset={4}
            >
              <DropdownMenuItem variant="default" disabled>
                <Avatar className="size-7 rounded-xl">
                  <AvatarImage src={user.avatarUrl} alt={label} />
                  <AvatarFallback>{label?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden text-left">
                  <span className="truncate text-sm font-medium">{label}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </DropdownMenuItem>
              <Separator />
              <DropdownMenuItem variant="default" asChild>
                <Link href="/profile">
                  <UserRoundPenIcon />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => logout()} variant="destructive">
                <LogOutIcon />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
