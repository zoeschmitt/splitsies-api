import { CompleteRequest } from "../../_shared/utils/requests.ts";
import { withErrorHandling } from "../../_shared/utils/errors.ts";
import { validate } from "../../_shared/utils/validate.ts";
import { ObjectSchema, object, string } from "yup";
import { CORSResponse } from "../../_shared/utils/cors.ts";
import { SupabaseClient } from "@supabase/supabase-js";

interface Req {
  params: {
    expenseId: string;
  };
}

const schema: ObjectSchema<Req> = object({
  params: object({
    expenseId: string().uuid().required(),
  }).required(),
});

const handler = async (
  req: CompleteRequest,
  sbClient: SupabaseClient
): Promise<Response> => {
  const { expenseId } = req.params;

  // Get the current user from auth
  const {
    data: { user },
    error: userError,
  } = await sbClient.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const userId = user.id;

  // First, verify the expense exists and the user has permission to delete it
  // Only allow the person who created/paid for the expense to delete it
  const { data: existingExpense, error: fetchError } = await sbClient
    .from("expenses")
    .select(`
      *,
      expense_members(user_id)
    `)
    .eq("id", expenseId)
    .eq("payer_id", userId) // Only payer can delete
    .single();

  if (fetchError || !existingExpense) {
    throw new Error("Expense not found or you don't have permission to delete it");
  }

  // Get the expense details for the response before deletion
  const expenseToDelete = {
    id: existingExpense.id,
    title: existingExpense.title,
    total: existingExpense.total,
    payer_id: existingExpense.payer_id,
    group_id: existingExpense.group_id,
    member_count: existingExpense.expense_members.length,
  };

  // Delete the expense (this will cascade delete expense_members due to foreign key constraints)
  const { error: deleteError } = await sbClient
    .from("expenses")
    .delete()
    .eq("id", expenseId);

  if (deleteError) throw deleteError;

  return new CORSResponse({
    message: "Expense deleted successfully",
    deleted_expense: expenseToDelete,
  }, {
    status: 200,
  });
};

export const deleteExpenses = validate(withErrorHandling(handler), schema);
