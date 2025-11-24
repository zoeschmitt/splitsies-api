import { CompleteRequest } from "../../_shared/utils/requests.ts";
import { withErrorHandling } from "../../_shared/utils/errors.ts";
import { validate } from "../../_shared/utils/validate.ts";
import { ObjectSchema, object, string, number, array, boolean } from "yup";
import { CORSResponse } from "../../_shared/utils/cors.ts";
import { SupabaseClient } from "@supabase/supabase-js";

interface Req {
  params: {
    expenseId: string;
  };
  body: {
    title?: string;
    total?: number;
    memberIds?: string[];
    paid?: boolean;
  };
}

const schema: ObjectSchema<Req> = object({
  params: object({
    expenseId: string().uuid().required(),
  }).required(),
  body: object({
    title: string().optional(),
    total: number().positive().optional(),
    memberIds: array().of(string().uuid().required()).optional(),
    paid: boolean().optional(),
  }).required(),
});

const handler = async (
  req: CompleteRequest,
  sbClient: SupabaseClient
): Promise<Response> => {
  const { expenseId } = req.params;
  const { title, total, memberIds, paid } = req.body;

  const {
    data: { user },
    error: userError,
  } = await sbClient.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const userId = user.id;

  // First, verify the expense exists and the user has permission to edit it
  const { data: existingExpense, error: fetchError } = await sbClient
    .from("expenses")
    .select(`
      *,
      expense_members!inner(user_id)
    `)
    .eq("id", expenseId)
    .eq("expense_members.user_id", userId)
    .single();

  if (fetchError || !existingExpense) {
    throw new Error("Expense not found or you don't have permission to edit it");
  }

  // Build update object for expense table
  const expenseUpdates: Partial<{
    title: string;
    total: number;
    paid: boolean;
  }> = {};
  if (title !== undefined) expenseUpdates.title = title;
  if (total !== undefined) expenseUpdates.total = total;
  if (paid !== undefined) expenseUpdates.paid = paid;

  // Update expense if there are changes
  if (Object.keys(expenseUpdates).length > 0) {
    const { error: updateError } = await sbClient
      .from("expenses")
      .update(expenseUpdates)
      .eq("id", expenseId);

    if (updateError) throw updateError;
  }

  // Update expense members if provided
  if (memberIds !== undefined) {
    // Delete existing members
    const { error: deleteError } = await sbClient
      .from("expense_members")
      .delete()
      .eq("expense_id", expenseId);

    if (deleteError) throw deleteError;

    // Insert new members
    if (memberIds.length > 0) {
      const newMembers = memberIds.map((userId: string) => ({
        expense_id: expenseId,
        user_id: userId,
        paid: false, // Reset paid status for all members when updating
      }));

      const { error: insertError } = await sbClient
        .from("expense_members")
        .insert(newMembers);

      if (insertError) throw insertError;
    }
  }

  // Return the updated expense with members
  const { data: updatedExpense, error: finalFetchError } = await sbClient
    .from("expenses")
    .select(`
      *,
      expense_members(user_id, paid),
      groups(name)
    `)
    .eq("id", expenseId)
    .single();

  if (finalFetchError) throw finalFetchError;

  return new CORSResponse(updatedExpense, {
    status: 200,
  });
};

export const patchExpenses = validate(withErrorHandling(handler), schema);
