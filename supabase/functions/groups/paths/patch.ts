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
  body: {
    name?: string;
    badge?: string;
  };
}

const schema: ObjectSchema<Req> = object({
  params: object({
    groupId: string().uuid().required(),
  }),
  body: object({
    name: string().optional(),
    badge: string().optional(),
  }).required(),
});

const handler = async (
  req: CompleteRequest,
  sbClient: SupabaseClient
): Promise<Response> => {
  const { groupId } = req.params;
  const { name, badge } = req.body;

  const updates = {
    ...(name && { name }),
    ...(badge && { badge }),
  };

  const { data, error } = await sbClient
    .from("groups")
    .update(updates)
    .eq("id", groupId);

  if (error) throw error;

  return new CORSResponse(data, {
    status: 200,
  });
};

export const patchGroups = validate(withErrorHandling(handler), schema);
