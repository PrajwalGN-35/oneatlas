import { ApiException } from "./errors";

export function repeatedScalarParam(
  params: URLSearchParams,
  name: string,
): string | undefined {
  const values = params.getAll(name);
  if (values.length > 1) {
    throw new ApiException(
      "REPEATED_QUERY_PARAMETER",
      `Query parameter '${name}' must appear only once`,
      400,
    );
  }
  return values[0];
}

export function objectFromSingleValueParams(
  params: URLSearchParams,
  names: readonly string[],
): Record<string, string> {
  const input: Record<string, string> = {};
  for (const name of names) {
    const value = repeatedScalarParam(params, name);
    if (value !== undefined) input[name] = value;
  }
  return input;
}
