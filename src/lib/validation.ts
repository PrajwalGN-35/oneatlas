import { z } from "zod";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const uuidSchema = z.string().uuid("Invalid UUID identifier");

export function paginationSchema<T extends z.ZodRawShape>(shape: T) {
  return z
    .object({
      ...shape,
      page: z.coerce.number().int().min(1).optional().default(DEFAULT_PAGE),
      pageSize: z.coerce
        .number()
        .int()
        .min(1)
        .max(MAX_PAGE_SIZE)
        .optional()
        .default(DEFAULT_PAGE_SIZE),
    })
    .strict();
}

export const lifecycleStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
]);
export const evidenceStatusSchema = z.enum([
  "UNVERIFIED",
  "VERIFIED",
  "ILLUSTRATIVE",
  "ESTIMATED",
  "UNAVAILABLE",
  "CONFLICTED",
  "SUPERSEDED",
]);
export const availabilityStatusSchema = z.enum([
  "AVAILABLE",
  "UNAVAILABLE",
  "LIMITED",
  "UNKNOWN",
]);

export function sortSchema<F extends string>(fields: readonly F[]) {
  return z
    .object({
      sort: z.enum(fields).optional(),
      direction: z.enum(["asc", "desc"]).optional().default("asc"),
    })
    .strict();
}

export function pageMeta(page: number, pageSize: number, total: number) {
  const totalPages = Math.ceil(total / pageSize);
  return {
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
  };
}
