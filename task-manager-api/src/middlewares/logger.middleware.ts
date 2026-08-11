import { pinoHttp, type HttpLogger, type Options } from "pino-http";
import { logger } from "../config/logger.js";
import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";

const REDACTED = "[REDACTED]";

const SENSITIVE_HEADERS = new Set(
  [
    "authorization",
    "cookie",
    "set-cookie",
    "proxy-authorization",
    "x-api-key",
  ].map((h) => h.toLowerCase()),
);

function redactHeaders(
  headers: IncomingMessage["headers"],
): IncomingMessage["headers"] {
  if (!headers) return headers;
  const result: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (SENSITIVE_HEADERS.has(key.toLowerCase()) && value != null) {
      result[key] =
        typeof value === "string" ? REDACTED : value.map(() => REDACTED);
    } else {
      result[key] = value;
    }
  }
  return result as IncomingMessage["headers"];
}

type AugmentedRequest = IncomingMessage & { requestId?: string };

const pinoHttpOptions: Options<AugmentedRequest, ServerResponse> = {
  logger,
  genReqId: (req: AugmentedRequest): string => {
    if (typeof req.requestId === "string" && req.requestId.length > 0) {
      return req.requestId;
    }
    const fallback = randomUUID();
    req.requestId = fallback;
    return fallback;
  },
  customSuccessMessage() {
    return "request completed";
  },
  customErrorMessage() {
    return "request errored";
  },
  serializers: {
    req(req: { raw: IncomingMessage }) {
      return {
        id: (req.raw as AugmentedRequest).requestId,
        method: req.raw.method,
        url: req.raw.url,
        headers: redactHeaders(req.raw.headers),
        remoteAddress: req.raw.socket?.remoteAddress,
      };
    },
    res(res: { raw: ServerResponse }) {
      return {
        statusCode: res.raw.statusCode,
        headers: redactHeaders(
          (res.raw.getHeaders?.() ?? {}) as IncomingMessage["headers"],
        ),
      };
    },
    err(err: Error & { passwordHash?: unknown; password?: unknown }) {
      const scrubbed = { ...err } as Record<string, unknown>;
      delete scrubbed.passwordHash;
      delete scrubbed.password;
      return scrubbed;
    },
  },
};

export const httpLogger: HttpLogger<AugmentedRequest, ServerResponse> =
  pinoHttp(pinoHttpOptions);
