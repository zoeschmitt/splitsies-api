import { CompleteRequest } from "../../_shared/utils/requests.ts";
import { ErrorCodes, apiError } from "../../_shared/utils/errors.ts";
import { validate } from "../../_shared/utils/validate.ts";
import { ObjectSchema, object } from "yup";
import { CORSResponse } from "../../_shared/utils/cors.ts";

type Req = Record<string | number | symbol, unknown>;
const schema: ObjectSchema<Req> = object();

const handler = async (req: CompleteRequest): Promise<Response> => {
  try {
    const { pathname } = new URL(req.url);

    // if (!copilotId) {
    //   throw new Error("Invalid copilotId");
    // }

    // if (copilot.userId && user?.id !== copilot.userId) {
    //   return apiError(ErrorCodes.FORBIDDEN, {
    //     error: "A different user owns this copilot.",
    //   });
    // }

    return new CORSResponse();
  } catch (error) {
    console.error("error:", error);
    return apiError(ErrorCodes.SERVER_ERROR, error);
  }
};

export const getGroups = validate(handler, schema);
