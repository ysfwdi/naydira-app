import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ENVIRONMENT } from "@/config/environment";
import { generateEmbedding } from "@/features/ai/embedding";
import { transactionSchema } from "@/constants/transaction-constant";

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    throw new Error("Unauthorized: token tidak ditemukan");
  }

  const supabase = createClient(
    ENVIRONMENT.supabaseUrl!,
    ENVIRONMENT.supabasekEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error("Unauthorized: token tidak valid");
  }

  return { supabase, user };
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await authenticateRequest(request);
    const body = await request.json();

    const validated = transactionSchema.safeParse(body);
    if (!validated.success) {
      const message = Object.values(
        validated.error.flatten().fieldErrors,
      ).flat()[0];
      return NextResponse.json(
        { error: message || "Input tidak valid" },
        { status: 400 },
      );
    }

    let embedding: number[] | undefined;
    try {
      embedding = await generateEmbedding(JSON.stringify(validated.data));
    } catch (embeddingError) {
      console.error("Gagal generate embedding:", embeddingError);
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        ...validated.data,
        user_id: user.id,
        ...(embedding && { embedding }),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
