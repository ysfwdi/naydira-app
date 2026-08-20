import { Metadata } from "next";
import DashboardContent from "./_components/dashboard-content";

export const metadata: Metadata = {
  title: "Naydira - Dashboard",
  description: "Your personal financial dashboard",
  icons: {
    icon: "/naydira-app.ico",
  },
};

export default function DashboardPage() {
  return (
    <div className="space-y-4 p-2">
      <section id="header">
        <h1 className="text-4xl font-bold text-primary">Dashboard</h1>
        <p>
          Get insights into your spending, track your expenses, and manage your
          finances.
        </p>
      </section>
      <DashboardContent />
    </div>
  );
}
