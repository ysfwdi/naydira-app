import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ENVIRONMENT } from "@/config/environment";
import { createAI } from "@/features/ai/instance";
import {
  getTransactionDeclaration,
  createTransactionDeclaration,
  deleteTransactionDeclaration,
  updateTransactionDeclaration,
} from "@/features/ai/function-transaction";
import { transactionSchema } from "@/constants/transaction-constant";
import { Content } from "@google/genai";

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) throw new Error("Unauthorized: token tidak ditemukan");

  const supabase = createClient(
    ENVIRONMENT.supabaseUrl!,
    ENVIRONMENT.supabasekEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
    },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) throw new Error("Unauthorized: token tidak valid");

  return { supabase, user };
}

async function generateEmbedding(contents: string) {
  const ai = createAI();
  const response = await ai.models.embedContent({
    model: "gemini-embedding-2",
    contents,
    config: { outputDimensionality: 768 },
  });
  if (!response.embeddings?.[0]?.values)
    throw new Error("Gagal membuat embedding");
  return response.embeddings[0].values;
}

async function findRelatedTransaction(supabase: SupabaseClient, query: string) {
  const queryEmbedding = await generateEmbedding(query);
  const { data, error } = await supabase.rpc("match_transactions", {
    query_embedding: queryEmbedding,
    match_threshold: 0.3,
    match_count: 1,
  });
  if (error) throw new Error("Gagal mencari transaksi terkait");
  return data;
}

async function createTransactionForUser(
  supabase: SupabaseClient,
  userId: string,
  data: any,
) {
  const embedding = await generateEmbedding(JSON.stringify(data)).catch(
    () => undefined,
  );
  const { error } = await supabase
    .from("transactions")
    .insert({ ...data, user_id: userId, ...(embedding && { embedding }) });
  if (error) throw new Error(error.message);
}

async function updateTransactionForUser(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  data: any,
) {
  const embedding = await generateEmbedding(JSON.stringify(data)).catch(
    () => undefined,
  );
  const { error } = await supabase
    .from("transactions")
    .update({ ...data, ...(embedding && { embedding }) })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

async function deleteTransactionForUser(
  supabase: SupabaseClient,
  userId: string,
  id: string,
) {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await authenticateRequest(request);
    const formData = await request.formData();

    const type = formData.get("type") as "audio" | "text";
    const file = formData.get("file") as File | null;
    const requestText = (formData.get("request") as string) || "";

    if (type === "audio" && !file) {
      return NextResponse.json(
        { error: "Tidak ada file audio" },
        { status: 400 },
      );
    }

    let mimeType = "";
    let base64Data = "";
    if (type === "audio" && file) {
      mimeType = file.type;
      base64Data = Buffer.from(await file.arrayBuffer()).toString("base64");
    }

    const contents: Content[] = [
      {
        role: "user",
        parts: [
          ...(type === "audio"
            ? [{ inlineData: { mimeType, data: base64Data } }]
            : []),
          {
            text: `
              <role>
                You are an AI Wizard finance assistant, who can extract transaction details from ${type}.
              </role>
              <instruction>
                - Extract the transaction details from ${type === "text" ? "the following text" : "the audio file"} in bahasa Indonesia.
                - If request is to update or delete transaction, you must call function get_transaction first to find out which transaction will be updated or deleted.
                - When update transaction, args must return from get_transaction with fully like in schema.
                - The final response if there are no more functions being called is as simple as possible.
              </instruction>
              <context>
                Current Date : ${new Date().toISOString()}
              </context>
              ${type === "text" ? `<input>Text to extract: ${requestText}</input>` : ""}
            `,
          },
        ],
      },
    ];

    const ai = createAI();
    let running = true;
    let finalText = "Berhasil diproses";

    while (running) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          tools: [
            {
              functionDeclarations: [
                getTransactionDeclaration,
                createTransactionDeclaration,
                deleteTransactionDeclaration,
                updateTransactionDeclaration,
              ],
            },
          ],
        },
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        if (response.candidates?.[0]?.content) {
          contents.push(response.candidates[0].content);
        }

        const functionResponseParts = await Promise.all(
          response.functionCalls.map(async (functionCall) => {
            const { name, args, id } = functionCall;
            if (!args)
              throw new Error("Argumen tidak ditemukan untuk aksi ini");

            let resultData: unknown = {};

            switch (name) {
              case "get_transaction": {
                const found = await findRelatedTransaction(
                  supabase,
                  JSON.stringify(args),
                );
                resultData = found?.[0] || {};
                break;
              }
              case "create_transaction": {
                const transaction = transactionSchema.parse(args);
                if (transaction.amount <= 0)
                  throw new Error("Jumlah transaksi tidak valid");
                await createTransactionForUser(supabase, user.id, transaction);
                break;
              }
              case "delete_transaction": {
                await deleteTransactionForUser(supabase, user.id, `${args.id}`);
                break;
              }
              case "update_transaction": {
                const newData = transactionSchema.parse(args);
                if (newData.amount <= 0)
                  throw new Error("Jumlah transaksi tidak valid");
                await updateTransactionForUser(
                  supabase,
                  user.id,
                  `${args.id}`,
                  newData,
                );
                break;
              }
              default:
                throw new Error("Fungsi tidak dikenali");
            }

            return {
              functionResponse: { name, response: { result: resultData }, id },
            };
          }),
        );

        contents.push({ role: "user", parts: functionResponseParts });
      } else {
        running = false;
        finalText = response.text || finalText;
      }
    }

    return NextResponse.json({ data: finalText });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
