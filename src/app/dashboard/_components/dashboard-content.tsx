"use client";

import { useQuery } from "@tanstack/react-query";
import { BalanceCards } from "./balance-cards";
import { getBalanceSummary } from "@/features/transaction/action";
import GenerativeContent from "./generative-content";
import { format } from "date-fns";
import { useState } from "react";
import { DateRange } from "react-day-picker";

export default function DashboardContent() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data, error, refetch } = useQuery({
    queryKey: ["balance", dateRange],
    queryFn: () =>
      getBalanceSummary({
        from: dateRange?.from
          ? format(dateRange.from, "yyyy-MM-dd")
          : undefined,
        to: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
      }),
  });

  return (
    <section id="content" className="space-y-4">
      {/* <WizardInput refetch={refetch} /> */}
      <BalanceCards data={data} error={error} />
      <GenerativeContent />
    </section>
  );
}
