export enum RequestMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  OPTIONS = "OPTIONS",
}
export class CompleteRequest {
  params: any;
  body: any;
  headers: any;
  url: any;

  constructor(params: any = {}, body: any = {}) {
    this.params = params;
    this.body = body;
  }
}
