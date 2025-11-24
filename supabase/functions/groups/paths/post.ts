import { CompleteRequest } from "../../_shared/utils/requests.ts";
import { withErrorHandling } from "../../_shared/utils/errors.ts";
import { validate } from "../../_shared/utils/validate.ts";
import { ObjectSchema, object, string } from "yup";
import { CORSResponse } from "../../_shared/utils/cors.ts";
import { SupabaseClient } from "@supabase/supabase-js";

interface Req {
  body: {
    name: string;
    badge: string;
  };
}

const schema: ObjectSchema<Req> = object({
  body: object({
    name: string().required(),
    badge: string().required(),
  }).required(),
});

const handler = async (
  req: CompleteRequest,
  sbClient: SupabaseClient
): Promise<Response> => {
  const { name, badge } = req.body;

  const {
    data: { user },
    error: userError,
  } = await sbClient.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const userId = user.id;

  const { error } = await sbClient.from("groups").insert([{ name, badge }]);

  if (error) throw error;

  const { data: expenseUsers, error: expenseError } = await sbClient
    .from("expense_members")
    .select(
      `
      user_id,
      expenses!inner(
        expense_members!inner(user_id)
      )
    `
    )
    .eq("expenses.expense_members.user_id", userId)
    .neq("user_id", userId);

  if (expenseError) {
    console.error("Error fetching expense users:", expenseError);
  }

  const uniqueUserIds = [
    ...new Set(expenseUsers?.map((item) => item.user_id) || []),
  ];

  const { data: userProfiles, error: profileError } = await sbClient
    .from("profiles")
    .select("id, name")
    .in("id", uniqueUserIds);

  if (profileError) {
    console.error("Error fetching user profiles:", profileError);
  }

  const suggestedUsers =
    userProfiles?.map((profile) => ({
      user_id: profile.id,
      name: profile.name,
    })) || [];

  return new CORSResponse(suggestedUsers, {
    status: 200,
  });
};

export const postGroups = validate(withErrorHandling(handler), schema);
