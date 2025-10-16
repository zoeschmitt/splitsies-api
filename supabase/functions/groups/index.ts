import { ErrorCodes, apiError } from "../_shared/utils/errors.ts";
import { RequestMethod } from "../_shared/utils/requests.ts";
import { CORSResponse } from "../_shared/utils/cors.ts";
import { getGroups } from "./paths/get.ts";
import { postGroups } from "./paths/post.ts";
import { patchGroups } from "./paths/patch.ts";
import { deleteGroups } from "./paths/delete.ts";
import { createClient } from "@supabase/supabase-js";

Deno.serve(async (req: Request) => {
  const { method } = req;

  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    throw new Error("Authorization header is required");
  }

  const sbClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    }
  );

  switch (method) {
    case RequestMethod.GET:
      return await getGroups(req, sbClient);
    case RequestMethod.POST:
      return await postGroups(req, sbClient);
    case RequestMethod.PATCH:
      return await patchGroups(req, sbClient);
    case RequestMethod.DELETE:
      return await deleteGroups(req, sbClient);
    case RequestMethod.OPTIONS:
      return new CORSResponse("ok");
    default:
      return apiError(ErrorCodes.NOT_FOUND, { error: "No request found." });
  }
});
