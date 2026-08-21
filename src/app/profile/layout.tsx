import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import { getCurrentUser } from "../(auth)/action";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />

      <main className="flex-1 p-4 pb-20 md:pb-4">
        <SidebarTrigger className="hidden md:inline-flex" />
        {children}
      </main>

      <MobileBottomNav />
    </SidebarProvider>
  );
}
