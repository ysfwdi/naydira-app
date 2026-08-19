"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";

import TransactionTable from "./transaction-table";
import { getTransactions } from "@/features/transaction/action";
import CreateTransactionCard from "./create-transaction-card";
import WizardInput from "../../_components/wizard-input";

export default function Transaction() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const params = useMemo(
    () => ({
      page,
      limit,
      search,
      from: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
      to: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    }),
    [page, limit, search, dateRange],
  );

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["transactions", params],
    queryFn: () => getTransactions(params),
  });

  return (
    <div className="space-y-4">
      <WizardInput refetch={refetch} />
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
        <TransactionTable
          transactions={data}
          isLoading={isLoading}
          refetch={refetch}
          page={page}
          limit={limit}
          search={search}
          setPage={setPage}
          setLimit={setLimit}
          setSearch={setSearch}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        <CreateTransactionCard refetch={refetch} />
      </div>
    </div>
  );
}
