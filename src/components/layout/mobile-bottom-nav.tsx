"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "@/config/navigation";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "md:hidden",
        "fixed bottom-0 left-0 right-0 z-50",
        "flex items-stretch justify-around",
        "h-16 border-t bg-background",
        "pb-[env(safe-area-inset-bottom)]",
      )}
    >
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5",
              "text-[11px] transition-colors",
              isActive ? "text-primary font-semibold" : "text-muted-foreground",
            )}
          >
            <Icon className="size-6" strokeWidth={isActive ? 2.5 : 2} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
