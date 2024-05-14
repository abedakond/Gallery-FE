import dotenv from 'dotenv';
dotenv.config();
import { SupabaseClient, createClient } from "@supabase/supabase-js";

const globalSupabaseClient = global as unknown as { client: SupabaseClient };

export const getSupabaseClient = () => {
  if (globalSupabaseClient.client) {
    return globalSupabaseClient.client;
  }

  const PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const PROJECT_API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  const supabase = createClient(PROJECT_URL, PROJECT_API_KEY);

  globalSupabaseClient.client = supabase;

  console.info("NEW SUPABASE CLIENT CREATED");

  return globalSupabaseClient.client;
};