export type ApiError = { code: string; message: string; details?: unknown };

export type ApiSuccess<T> = {
  data: T;
  meta: Record<string, unknown>;
  errors: [];
};

export type ApiFailure = {
  data: null;
  meta: null;
  errors: ApiError[];
};

export function success<T>(data: T, meta: Record<string, unknown> = {}) {
  const body: ApiSuccess<T> = { data, meta, errors: [] };
  return Response.json(body);
}

export function failure(error: ApiError, status: number) {
  const body: ApiFailure = { data: null, meta: null, errors: [error] };
  return Response.json(body, { status });
}
