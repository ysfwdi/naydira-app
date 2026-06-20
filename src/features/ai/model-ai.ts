import { createClient } from "@/lib/supabase/server";

export async function getAllModelAI() {
  const supabase = await createClient();
  const query = supabase
    .from("model_ai")
    .select("id, model, description", {
      count: "exact",
    })
    .order("date");

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return {
    data,
  };
}
