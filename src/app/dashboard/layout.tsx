import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import ChatbotDrawer from "./_components/chatbot-drawer";
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

      <main className="flex-1 p-4">
        <SidebarTrigger />
        {children}
        <ChatbotDrawer />
      </main>
    </SidebarProvider>
  );
}
