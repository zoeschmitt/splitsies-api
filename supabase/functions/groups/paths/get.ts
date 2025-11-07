import { CompleteRequest } from "../../_shared/utils/requests.ts";
import { ErrorCodes, apiError } from "../../_shared/utils/errors.ts";
import { validate } from "../../_shared/utils/validate.ts";
import { ObjectSchema, object, string } from "yup";
import { CORSResponse } from "../../_shared/utils/cors.ts";
import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

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
  try {
    const { groupId } = req.params;
    console.log("Fetching group with ID:", groupId);
    const { data, error } = await sbClient
      .from("groups")
      .select("*")
      .eq("id", groupId);
    console.log("Fetched group data:", data);
    if (error) throw error;

    return new CORSResponse(JSON.stringify({ group: data }), {
      status: 200,
    });
  } catch (error) {
    console.error("error:", error);

    if (error instanceof PostgrestError && error?.code === "42501") {
      return apiError(ErrorCodes.UNAUTHORIZED, {
        error: "Insufficient permissions.",
      });
    }

    return apiError(ErrorCodes.SERVER_ERROR, error);
  }
};

export const getGroups = validate(handler, schema);
