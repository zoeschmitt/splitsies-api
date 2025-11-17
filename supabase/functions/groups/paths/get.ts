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

  const query = sbClient.from("groups").select("*");

  const { data, error } = await (groupId ? query.eq("id", groupId) : query);

  if (error) throw error;

  return new CORSResponse(data, {
    status: 200,
  });
};

export const getGroups = validate(withErrorHandling(handler), schema);
