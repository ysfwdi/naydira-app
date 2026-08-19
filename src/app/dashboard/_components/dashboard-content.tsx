"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";

import { BalanceCards } from "./balance-cards";
import GenerativeContent from "./generative-content";
import { getBalanceSummary } from "@/features/transaction/action";
import { DateRangePicker } from "@/components/ui/date-range-picker";

export default function DashboardContent() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const params = useMemo(
    () => ({
      from: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
      to: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    }),
    [dateRange],
  );

  const { data, error } = useQuery({
    queryKey: ["balance", params],
    queryFn: () => getBalanceSummary(params),
  });

  return (
    <section id="content" className="space-y-4">
      <div className="flex justify-end">
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>
      <BalanceCards data={data} error={error} />
      <GenerativeContent />
    </section>
  );
}
