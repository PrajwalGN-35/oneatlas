import { ApiException } from "./errors";

export function rejectRepeatedOrUnsupported(
  params: URLSearchParams,
  allowed: readonly string[],
  unsupported: readonly string[] = [],
  repeatAllowed: readonly string[] = [],
) {
  for (const [name] of params) {
    if (!allowed.includes(name)) {
      throw new ApiException(
        "UNSUPPORTED_PARAMETER",
        `Unsupported query parameter: ${name}`,
        400,
      );
    }
  }
  for (const name of unsupported) {
    if (params.has(name)) {
      throw new ApiException(
        "UNSUPPORTED_FILTER",
        `Unsupported filter: ${name}`,
        400,
      );
    }
  }
  for (const name of allowed) {
    if (repeatAllowed.includes(name)) continue;
    if (params.getAll(name).length > 1) {
      throw new ApiException(
        "REPEATED_QUERY_PARAMETER",
        `Query parameter '${name}' must appear only once`,
        400,
      );
    }
  }
}
