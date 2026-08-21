import {
  BanknoteIcon,
  CoinsIcon,
  LayoutDashboardIcon,
  MenuIcon,
  UserCogIcon,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboardIcon,
    href: "/dashboard",
  },
  {
    label: "Transaction",
    icon: BanknoteIcon,
    href: "/dashboard/transaction",
  },
  {
    label: "Profile",
    icon: UserCogIcon,
    href: "/profile",
  },
  // {
  //   label: "Menu",
  //   icon: MenuIcon,
  //   href: "/profile",
  // },
];

export const brandIcon = CoinsIcon;
