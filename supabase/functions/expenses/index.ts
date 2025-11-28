import { ErrorCodes, apiError } from "../_shared/utils/errors.ts";
import { RequestMethod } from "../_shared/utils/requests.ts";
import { CORSResponse } from "../_shared/utils/cors.ts";
import { getExpenses } from "./paths/get.ts";
import { postExpenses } from "./paths/post.ts";
import { patchExpenses } from "./paths/patch.ts";
import { deleteExpenses } from "./paths/delete.ts";
import { createClient } from "@supabase/supabase-js";
import { getTotalExpenses } from "./paths/total/get.ts";
import { patchExpenseMemberPaid } from "./paths/paid/patch.ts";

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

  const url = new URL(req.url);
  const pathname = url.pathname;
  const pathParts = pathname.split("/").filter((part) => part !== "");
  const isTotalRequest = pathParts.includes("total");
  const isPaidRequest = pathParts.includes("paid");

  if (isTotalRequest) {
    switch (method) {
      case RequestMethod.GET:
        return await getTotalExpenses(req, sbClient);
      case RequestMethod.OPTIONS:
        return new CORSResponse("ok");
      default:
        return apiError(ErrorCodes.NOT_FOUND, { error: "No request found." });
    }
  }

  if (isPaidRequest) {
    switch (method) {
      case RequestMethod.PATCH:
        return await patchExpenseMemberPaid(req, sbClient);
      case RequestMethod.OPTIONS:
        return new CORSResponse("ok");
      default:
        return apiError(ErrorCodes.NOT_FOUND, { error: "No request found." });
    }
  }

  switch (method) {
    case RequestMethod.GET:
      return await getExpenses(req, sbClient);
    case RequestMethod.POST:
      return await postExpenses(req, sbClient);
    case RequestMethod.PATCH:
      return await patchExpenses(req, sbClient);
    case RequestMethod.DELETE:
      return await deleteExpenses(req, sbClient);
    case RequestMethod.OPTIONS:
      return new CORSResponse("ok");
    default:
      return apiError(ErrorCodes.NOT_FOUND, { error: "No request found." });
  }
});
