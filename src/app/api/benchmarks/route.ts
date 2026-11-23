import { z } from "zod";
import { ApiException, handleApiError } from "@/lib/api/errors";
import { success } from "@/lib/api/response";
import { rejectRepeatedOrUnsupported } from "@/lib/api/safeParams";
import { catalogService } from "@/lib/services/catalog";
import {
  evidenceStatusSchema,
  paginationSchema,
  sortSchema,
} from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    rejectRepeatedOrUnsupported(params, [
      "q",
      "benchmark",
      "methodology",
      "model",
      "date",
      "status",
      "page",
      "pageSize",
      "sort",
      "direction",
    ]);
    if (params.has("methodology") || params.has("date")) {
      throw new ApiException(
        "UNSUPPORTED_FILTER",
        "Benchmark methodology and date filters are not supported in Phase 2",
        400,
      );
    }
    const input = Object.fromEntries(params);
    const query = paginationSchema({
      q: z.string().trim().min(1).max(200).optional(),
      benchmark: z.string().trim().min(1).max(200).optional(),
      model: z.string().uuid().optional(),
      status: evidenceStatusSchema.optional(),
      ...sortSchema(["name", "publishedAt"]).shape,
    }).parse(input);
    const result = await catalogService.listBenchmarks(query);
    return success(result.data, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}
