import { SupabaseClient } from "@supabase/supabase-js";

export type SBClient = SupabaseClient<any, "public", "public", any, any>;

export interface ExpenseMember {
  user_id: string;
}

export interface Expense {
  id: string;
  total: number;
  payer_id: string;
  expense_members: ExpenseMember[];
  group_id: string;
}

export interface UserExpenseMember {
  expenses: Expense[];
}
