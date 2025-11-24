import { CompleteRequest } from "../../_shared/utils/requests.ts";
import { withErrorHandling } from "../../_shared/utils/errors.ts";
import { validate } from "../../_shared/utils/validate.ts";
import { ObjectSchema, object, string, number, array } from "yup";
import { CORSResponse } from "../../_shared/utils/cors.ts";
import { SupabaseClient } from "@supabase/supabase-js";

interface Req {
  params: {
    groupId?: string;
  };
  body: {
    title: string;
    total: number;
    payerId: string;
    memberIds: string[];
  };
}

const schema: ObjectSchema<Req> = object({
  params: object({
    groupId: string().uuid().optional(),
  }),
  body: object({
    title: string().required(),
    total: number().positive().required(),
    payerId: string().uuid().required(),
    memberIds: array().of(string().uuid().required()).min(1).required(),
  }).required(),
});

const handler = async (
  req: CompleteRequest,
  sbClient: SupabaseClient
): Promise<Response> => {
  const { groupId, title, total, payerId, memberIds } = req.body;

  const { data: expenseData, error: expenseError } = await sbClient
    .from("expenses")
    .insert([
      {
        groupId,
        title,
        total,
        payerId,
      },
    ])
    .select()
    .single();

  if (expenseError) throw expenseError;

  const expenseMembers = memberIds.map((userId: string) => ({
    expense_id: expenseData.id,
    user_id: userId,
  }));

  const { error: membersError } = await sbClient
    .from("expense_members")
    .insert(expenseMembers);

  if (membersError) throw membersError;

  const { data: completeExpense, error: fetchError } = await sbClient
    .from("expenses")
    .select(
      `
      *,
      expense_members(user_id),
      groups(name)
    `
    )
    .eq("id", expenseData.id)
    .single();

  if (fetchError) throw fetchError;

  return new CORSResponse(completeExpense, {
    status: 200,
  });
};

export const postExpenses = validate(withErrorHandling(handler), schema);
