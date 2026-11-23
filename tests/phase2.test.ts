import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { ApiException, handleApiError } from "../src/lib/api/errors";
import { success } from "../src/lib/api/response";
import {
  pageMeta,
  paginationSchema,
  sortSchema,
  uuidSchema,
} from "../src/lib/validation";
import { benchmarkRankPolicy, compareRankValues } from "../src/lib/ranking";
import { rejectRepeatedOrUnsupported } from "../src/lib/api/safeParams";

describe("API response envelopes", () => {
  it("returns a success envelope", async () => {
    const response = success({ id: "1" }, { pagination: { page: 1 } });
    expect(await response.json()).toEqual({
      data: { id: "1" },
      meta: { pagination: { page: 1 } },
      errors: [],
    });
  });

  it("redacts unexpected errors", async () => {
    const response = handleApiError(new Error("DATABASE_URL=secret"));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      data: null,
      meta: null,
      errors: [
        {
          code: "INTERNAL_ERROR",
          message: "The request could not be completed",
        },
      ],
    });
  });

  it("maps API exceptions to status and code", async () => {
    const response = handleApiError(
      new ApiException("NOT_FOUND", "Model not found", 404),
    );
    expect(response.status).toBe(404);
  });

  it("maps Zod errors to validation failures", async () => {
    const response = handleApiError(new ZodError([]));
    expect(response.status).toBe(400);
  });
});

describe("pagination and validation", () => {
  it("uses defaults and maximum page size", () => {
    const schema = paginationSchema({});
    expect(schema.parse({}).page).toBe(1);
    expect(schema.parse({}).pageSize).toBe(20);
    expect(() => schema.parse({ pageSize: 101 })).toThrow();
  });

  it("calculates bounded navigation metadata", () => {
    expect(pageMeta(2, 20, 41)).toEqual({
      pagination: {
        page: 2,
        pageSize: 20,
        total: 41,
        totalPages: 3,
        hasNext: true,
        hasPrevious: true,
      },
    });
  });

  it("rejects unsupported sorting fields", () => {
    const schema = sortSchema(["name", "createdAt"]);
    expect(() => schema.parse({ sort: "password" })).toThrow();
  });

  it("validates UUID values", () => {
    expect(() => uuidSchema.parse("not-a-uuid")).toThrow();
    expect(uuidSchema.parse("123e4567-e89b-12d3-a456-426614174000")).toBe(
      "123e4567-e89b-12d3-a456-426614174000",
    );
  });
});

describe("ranking direction", () => {
  const items = [{ scoreValue: "10" }, { scoreValue: "5" }];
  it("sorts lower-is-better ascending", () => {
    expect(
      [...items].sort((a, b) => compareRankValues(a, b, "LOWER_IS_BETTER")),
    ).toEqual([items[1], items[0]]);
  });
  it("sorts higher-is-better descending", () => {
    expect(
      [...items].sort((a, b) => compareRankValues(a, b, "HIGHER_IS_BETTER")),
    ).toEqual([items[0], items[1]]);
  });
});

describe("ranking compatibility and query reliability", () => {
  it("rejects repeated scalar query parameters", () => {
    const params = new URLSearchParams("q=a&q=b");
    expect(() => rejectRepeatedOrUnsupported(params, ["q"])).toThrow(ApiException);
  });

  it("allows repeated modelId comparison parameters", () => {
    const params = new URLSearchParams("modelId=a&modelId=b");
    expect(() => rejectRepeatedOrUnsupported(params, ["modelId"], [], ["modelId"])).not.toThrow();
  });

  it("rejects unsupported query parameters", () => {
    const params = new URLSearchParams("password=x");
    expect(() => rejectRepeatedOrUnsupported(params, ["q"])).toThrow(ApiException);
  });

  it("treats TARGET_RANGE benchmarks as non-orderable", () => {
    expect(benchmarkRankPolicy("TARGET_RANGE")).toEqual({
      orderable: false,
      scoreDirection: null,
      reason: "TARGET_RANGE_NOT_ORDERABLE",
    });
  });

  it("preserves structured details in API failures", async () => {
    const response = handleApiError(new ApiException("UNKNOWN_MODEL_IDS", "Unknown model", 404, { unknownModelIds: ["id"] }));
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      data: null,
      meta: null,
      errors: [{ code: "UNKNOWN_MODEL_IDS", message: "Unknown model", details: { unknownModelIds: ["id"] } }],
    });
  });
});
