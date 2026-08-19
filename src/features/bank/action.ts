"use server";

import { createClient } from "@/lib/supabase/server";

export async function getBanks() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bank")
    .select("bank_id, name_bank, created_at")
    .order("name_bank");

  if (error) throw new Error(error.message);
  return data;
}

export async function getBankSaldo(bankId: string, periode: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_or_create_saldo", {
    p_bank_id: bankId,
    p_periode: periode,
  });

  if (error) throw new Error(error.message);
  return data as number;
}
