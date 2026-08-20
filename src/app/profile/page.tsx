import { Metadata } from "next";
import Profile from "./_components/profile";

export const metadata: Metadata = {
  title: "Naydira - Profile",
  description: "Manage your account profile",
};

export default function ProfilePage() {
  return (
    <div className="p-2 space-y-4">
      <section id="header">
        <h1 className="text-4xl font-bold text-primary">Profile</h1>
        <p>Manage your account information and security.</p>
      </section>
      <section id="content">
        <Profile />
      </section>
    </div>
  );
}
