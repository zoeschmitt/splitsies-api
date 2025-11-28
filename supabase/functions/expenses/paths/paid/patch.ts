import { CompleteRequest } from "../../../_shared/utils/requests.ts";
import { withErrorHandling } from "../../../_shared/utils/errors.ts";
import { validate } from "../../../_shared/utils/validate.ts";
import { ObjectSchema, object, string, boolean } from "yup";
import { CORSResponse } from "../../../_shared/utils/cors.ts";
import { SupabaseClient } from "@supabase/supabase-js";

interface ExpenseMemberUser {
  user_id: string;
}

interface Req {
  params: {
    expenseId: string;
    userId: string;
  };
  body: {
    paid: boolean;
  };
}

const schema: ObjectSchema<Req> = object({
  params: object({
    expenseId: string().uuid().required(),
    userId: string().uuid().required(),
  }).required(),
  body: object({
    paid: boolean().required(),
  }).required(),
});

const handler = async (
  req: CompleteRequest,
  sbClient: SupabaseClient
): Promise<Response> => {
  const { expenseId, userId } = req.params;
  const { paid } = req.body;

  // Get the current user from auth
  const {
    data: { user },
    error: userError,
  } = await sbClient.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const currentUserId = user.id;

  // Verify the current user has permission to update this expense member
  // They must be either:
  // 1. The user whose paid status is being updated, OR
  // 2. A member of the same expense
  const { data: expenseMember, error: memberError } = await sbClient
    .from("expense_members")
    .select(`
      *,
      expenses!inner(
        id,
        expense_members!inner(user_id)
      )
    `)
    .eq("expense_id", expenseId)
    .eq("user_id", userId)
    .single();

  if (memberError || !expenseMember) {
    throw new Error("Expense member not found");
  }

  // Check if current user is part of this expense
  const isCurrentUserInExpense = expenseMember.expenses.expense_members.some(
    (member: ExpenseMemberUser) => member.user_id === currentUserId
  );

  if (!isCurrentUserInExpense && currentUserId !== userId) {
    throw new Error("You don't have permission to update this expense member");
  }

  // Update the paid status
  const { error: updateError } = await sbClient
    .from("expense_members")
    .update({ paid })
    .eq("expense_id", expenseId)
    .eq("user_id", userId);

  if (updateError) throw updateError;

  // Return the updated expense member with expense details
  const { data: updatedMember, error: fetchError } = await sbClient
    .from("expense_members")
    .select(`
      *,
      expenses(
        id,
        title,
        total,
        payer_id,
        groups(name)
      )
    `)
    .eq("expense_id", expenseId)
    .eq("user_id", userId)
    .single();

  if (fetchError) throw fetchError;

  return new CORSResponse(updatedMember, {
    status: 200,
  });
};

export const patchExpenseMemberPaid = validate(withErrorHandling(handler), schema);
