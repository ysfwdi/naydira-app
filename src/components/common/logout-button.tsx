"use client";

import { logout } from "@/app/(auth)/action";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOutIcon } from "lucide-react";
import { VariantProps } from "class-variance-authority";
import { toast } from "sonner";
import { useState } from "react";

interface LogoutButtonProps {
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
}

export function LogoutButton({
  className,
  variant = "destructive",
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Berhasil logout. Sampai jumpa lagi!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal logout, coba lagi.",
      );
      setIsLoggingOut(false);
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={cn(className)}
    >
      <LogOutIcon />
      {isLoggingOut ? "Logging out..." : "Logout"}
    </Button>
  );
}
