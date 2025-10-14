import { SupabaseClient } from "@supabase/supabase-js";

export type SBClient = SupabaseClient<any, "public", "public", any, any>;
