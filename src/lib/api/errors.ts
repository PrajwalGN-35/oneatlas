import { ZodError } from "zod";
import { failure } from "./response";

export class ApiException extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export function notFound(resource = "Resource") {
  return new ApiException("NOT_FOUND", `${resource} not found`, 404);
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiException) {
    return failure(
      {
        code: error.code,
        message: error.message,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
      error.status,
    );
  }

  if (error instanceof ZodError) {
    return failure(
      { code: "VALIDATION_ERROR", message: "Invalid query parameters" },
      400,
    );
  }

  return failure(
    { code: "INTERNAL_ERROR", message: "The request could not be completed" },
    500,
  );
}

export function normalizePrismaError(error: unknown) {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String((error as { code: unknown }).code);
    if (code.startsWith("P20") || code === "P1001" || code === "P1002") {
      return new ApiException(
        "DATABASE_UNAVAILABLE",
        "The catalog is temporarily unavailable",
        503,
      );
    }
  }
  return error;
}
