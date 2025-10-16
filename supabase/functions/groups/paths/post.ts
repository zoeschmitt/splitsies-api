import { CompleteRequest } from "../../_shared/utils/requests.ts";
import { ErrorCodes, apiError } from "../../_shared/utils/errors.ts";
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
  try {
    // Add group to db.
    const { name, badge } = req.body;
    const { data, error } = await sbClient
      .from("groups")
      .insert([{ name, badge }]);

    if (error) {
      if (error?.code === "42501") {
        return apiError(ErrorCodes.UNAUTHORIZED, {
          error: "Insufficient permissions.",
        });
      }
      throw error;
    }

    // Return list of possible ppl to add to group.

    return new CORSResponse({
      status: 200,
      body: { group: data?.[0] },
    });
  } catch (error) {
    console.error("error:", error);
    return apiError(ErrorCodes.SERVER_ERROR, error);
  }
};

export const postGroups = validate(handler, schema);
