"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogoutButton } from "@/components/common/logout-button";

export default function LogoutCard() {
  return (
    <Card className="w-full gap-2 h-fit md:hidden">
      <CardHeader className="gap-0">
        <CardTitle>Akun</CardTitle>
        <CardDescription>
          Keluar dari akun kamu di perangkat ini.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LogoutButton className="w-full" />
      </CardContent>
    </Card>
  );
}
