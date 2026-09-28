export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly requestId?: string;

  constructor(message: string, options: { code: string; status: number; requestId?: string }) {
    super(message);
    this.name = "ApiError";
    this.code = options.code;
    this.status = options.status;
    this.requestId = options.requestId;
  }
}

export function isSessionEndCode(code: string): boolean {
  return code === "SESSION_REVOKED" || code === "SESSION_EXPIRED";
}
