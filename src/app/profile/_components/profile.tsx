"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentUserProfile } from "@/features/profile/action";
import ProfileForm from "./profile-form";
import PasswordForm from "./password-form";
import LogoutCard from "./logout-card";
import { Loader2Icon } from "lucide-react";

export default function Profile() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: getCurrentUserProfile,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2Icon className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <ProfileForm profile={data} refetch={refetch} />
      <PasswordForm />
      <LogoutCard />{" "}
    </div>
  );
}
