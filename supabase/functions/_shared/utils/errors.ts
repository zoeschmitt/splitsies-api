import { CORSResponse } from "./cors.ts";
import { PostgrestError } from "https://esm.sh/v135/@supabase/postgrest-js@1.8.6/dist/module/index.js";

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
