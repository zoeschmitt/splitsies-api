export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, PATCH, DELETE",
};

export class CORSResponse extends Response {
  constructor(body?: any, init?: ResponseInit) {
    const headers: { [key: string]: string } = {
      ...CORS_HEADERS,
      ...(init?.headers as Record<string, string>),
    };

    headers["Content-Type"] ??= "application/json";

    super(body, { ...init, headers });
  }
}
