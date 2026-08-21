import { Metadata } from "next";
import Transaction from "./_components/transaction";

export const metadata: Metadata = {
  title: "Naydira - Transaction",
  description: "View and mange your finacial transaction",
  icons: {
    icon: "/naydira-app.ico",
  },
};

export default function TransactionPage() {
  return (
    <div className="flex flex-col min-h-[calc(100dvh-9rem)] md:min-h-[calc(100dvh-4rem)] p-2 gap-4">
      <section id="header">
        <h1 className="text-4xl font-bold text-primary">Transaction</h1>
        <p>View and manage your finacial transaction</p>
      </section>
      <section id="content" className="flex-1 flex flex-col">
        <Transaction />
      </section>
    </div>
  );
}
