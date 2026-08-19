"use server";

import { Transaction } from "@/app/types/transaction";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "../ai/embedding";

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) throw new Error("Unauthorized");
  return user.id;
}

export async function getBalanceSummary(params?: {
  from?: string;
  to?: string;
  bankId?: string;
}) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  let query = supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", userId);

  if (params?.from) query = query.gte("date", params.from);
  if (params?.to) query = query.lte("date", params.to);
  if (params?.bankId) query = query.eq("bank_id", params.bankId);

  const { data } = await query;

  const { totalIncome, totalExpense, savings } = (data || []).reduce(
    (acc, tx) => {
      if (tx.type === "income") acc.totalIncome += tx.amount;
      else if (tx.type === "expense") acc.totalExpense += tx.amount;
      acc.savings = acc.totalIncome - acc.totalExpense;
      return acc;
    },
    { totalIncome: 0, totalExpense: 0, savings: 0 },
  );

  return { totalIncome, totalExpense, savings };
}

export async function getTransactions(params?: {
  limit?: number;
  page?: number;
  search?: string;
  from?: string;
  to?: string;
  bankId?: string;
}) {
  const { limit = 10, page = 1, search, from, to, bankId } = params || {};
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  let query = supabase
    .from("transactions")
    .select("id, amount, type, description, date, category, bank_id", {
      count: "exact",
    })
    .eq("user_id", userId)
    .order("date")
    .order("created_at", { ascending: true });

  if (search) query = query.ilike("description", `%${search}%`);
  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);
  if (bankId) query = query.eq("bank_id", bankId);

  const fromIdx = (page - 1) * limit;
  const toIdx = fromIdx + limit - 1;

  const { data, error, count } = await query.range(fromIdx, toIdx);
  if (error) throw new Error(error.message);

  const totalData = count || 0;
  return { data, totalData, totalPages: Math.ceil(totalData / limit) };
}

async function handleEmbedding(
  transaction: Omit<Transaction, "id" | "user_id" | "embedding">,
) {
  const embeddingText = JSON.stringify(transaction);
  try {
    return await generateEmbedding(embeddingText);
  } catch {
    throw new Error("Failed to generate embedding");
  }
}

export async function createTransaction(
  transaction: Omit<Transaction, "id" | "user_id" | "embedding">,
) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  const payload: Record<string, unknown> = {
    ...transaction,
    user_id: userId,
  };
  const embeddingVector = await handleEmbedding(transaction);
  if (embeddingVector) payload.embedding = embeddingVector;

  const { data, error } = await supabase.from("transactions").insert(payload);
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  const { error, success } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return success;
}

export async function updateTransaction(
  id: string,
  transaction: Omit<Transaction, "id" | "user_id" | "embedding">,
) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  const payload: Record<string, unknown> = { ...transaction };
  const embeddingVector = await handleEmbedding(transaction);
  if (embeddingVector) payload.embedding = embeddingVector;

  const { data, error } = await supabase
    .from("transactions")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return data;
}
