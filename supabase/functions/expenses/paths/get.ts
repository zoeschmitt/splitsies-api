import { CompleteRequest } from "../../_shared/utils/requests.ts";
import { withErrorHandling } from "../../_shared/utils/errors.ts";
import { validate } from "../../_shared/utils/validate.ts";
import { ObjectSchema, object, string } from "yup";
import { CORSResponse } from "../../_shared/utils/cors.ts";
import { SupabaseClient } from "@supabase/supabase-js";

interface Req {
  params: {
    groupId?: string;
  };
}

const schema: ObjectSchema<Req> = object({
  params: object({
    groupId: string().uuid().optional(),
  }),
});

const handler = async (
  req: CompleteRequest,
  sbClient: SupabaseClient
): Promise<Response> => {
  const { groupId } = req.params;

  const {
    data: { user },
    error: userError,
  } = await sbClient.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const userId = user.id;

  let query = sbClient
    .from("expenses")
    .select(
      `
        *,
        expense_members!inner(user_id),
        groups(name)
      `
    )
    .eq("expense_members.user_id", userId);

  if (groupId) {
    query = sbClient
      .from("expenses")
      .select(
        `
        *,
        expense_members(user_id),
        groups(name)
      `
      )
      .eq("group_id", groupId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return new CORSResponse(data, {
    status: 200,
  });
};

export const getExpenses = validate(withErrorHandling(handler), schema);
