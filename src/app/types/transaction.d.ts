export type Transaction = {
  id: string;
  date: string | Date;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  user_id: string | null;
  bank_id?: string;
  embedding: number[] | null;
};

export type Bank = {
  bank_id: string;
  name_bank: string;
  created_at: string;
};
