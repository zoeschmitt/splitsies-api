import { CORSResponse } from "./cors.ts";
import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { CompleteRequest } from "./requests.ts";

export const enum ErrorCodes {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  NOT_ACCEPTABLE = 406,
  SERVER_ERROR = 500,
}

export const ERRORS_MAPPING = {
  [ErrorCodes.BAD_REQUEST]: "Bad Request.",
  [ErrorCodes.UNAUTHORIZED]: "Unauthorized.",
  [ErrorCodes.NOT_FOUND]: "Not Found.",
  [ErrorCodes.SERVER_ERROR]: "Internal Server Error.",
  [ErrorCodes.FORBIDDEN]: "Forbidden.",
  [ErrorCodes.NOT_ACCEPTABLE]: "Not Acceptable.",
};

type ApiError = Record<string, unknown> | unknown;

type HandlerFn<T = any> = (req: CompleteRequest, sbClient: SupabaseClient) => Promise<T>;

export const withErrorHandling = (fn: HandlerFn) => {
  return async (req: CompleteRequest, sbClient: SupabaseClient) => {
    try {
      return await fn(req, sbClient);
    } catch (error: unknown) {
      console.error("error:", error);

      if (error && typeof error === "object" && "code" in error) {
        const code = (error as any).code;
        if (code === "42501") {
          return apiError(ErrorCodes.UNAUTHORIZED, { error: "Insufficient permissions." });
        }
        return apiError(ErrorCodes.SERVER_ERROR, { error });
      }

      return apiError(ErrorCodes.SERVER_ERROR, { error });
    }
  };
}

export const apiError = (code: ErrorCodes, err?: ApiError) => {
  let error: ApiError;
  if (err instanceof Error) {
    error = {
      message: err.message,
      name: err.name,
    };
  } else {
    error = err || { error: ERRORS_MAPPING[code] };
  }
  console.error(error);
  const response = new CORSResponse(JSON.stringify(error), {
    status: code,
  });
  return response;
};
export const enum ErrorTypes {
  INAPPROPRIATE_CONTENT = "INAPPROPRIATE_CONTENT",
  NO_RESPONSE_POPULATED = "NO_RESPONSE_POPULATED",
}

export const wiseError = ({
  error,
  message,
  additionalData,
}: {
  message: string;
  error?: PostgrestError;
  additionalData?: Record<string, unknown>;
}) => {
  console.error({
    message,
    error,
    additionalData,
  });
  throw Error(
    `${{
      message,
      error,
      additionalData,
    }}`
  );
};
