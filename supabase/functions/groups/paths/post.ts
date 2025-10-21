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
  const { error } = await sbClient.from("groups").insert([{ name, badge }]);

  if (error) throw error;

  // TODO: Return list of possible ppl to add to group.

  return new CORSResponse(null, {
    status: 200,
  });
};

export const postGroups = validate(withErrorHandling(handler), schema);
