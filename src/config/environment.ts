export const ENVIRONMENT = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasekEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  googleGenAIKey: process.env.GOOGLE_GEN_AI_API_KEY,
  siteUrl: (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/$/, ""),
};
