import { CompleteRequest } from "../../_shared/utils/requests.ts";
import { withErrorHandling } from "../../_shared/utils/errors.ts";
import { validate } from "../../_shared/utils/validate.ts";
import { ObjectSchema, object, string } from "yup";
import { CORSResponse } from "../../_shared/utils/cors.ts";
import { SupabaseClient } from "@supabase/supabase-js";

interface Req {
  params: {
    groupId: string;
  };
}

const schema: ObjectSchema<Req> = object({
  params: object({
    groupId: string().uuid().required(),
  }),
});

const handler = async (
  req: CompleteRequest,
  sbClient: SupabaseClient
): Promise<Response> => {
  const { groupId } = req.params;

  console.log("Deleting group with ID:", groupId);

  const { data, error } = await sbClient
    .from("groups")
    .delete()
    .eq("id", groupId);

  console.log("Delete group data:", data);
  console.log("Delete group error:", error);

  if (error) throw error;

  const { error: memberError } = await sbClient
    .from("group_members")
    .delete()
    .eq("group_id", groupId);

  if (memberError) throw memberError;

  return new CORSResponse({}, {
    status: 200,
  });
};

export const deleteGroups = validate(withErrorHandling(handler), schema);
