import { z } from "zod";
import { ApiException, handleApiError } from "@/lib/api/errors";
import { success } from "@/lib/api/response";
import { objectFromSingleValueParams } from "@/lib/api/query";
import { catalogService } from "@/lib/services/catalog";
import { paginationSchema } from "@/lib/validation";
import { rejectRepeatedOrUnsupported } from "@/lib/api/safeParams";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const unsupported = [
      "methodology",
      "modality",
      "date",
      "status",
      "workload",
    ].filter((name) => params.getAll(name).length > 0);
    if (unsupported.length) {
      throw new ApiException(
        "UNSUPPORTED_FILTER",
        `Unsupported ranking filter(s): ${unsupported.join(", ")}`,
        400,
      );
    }
    const input = objectFromSingleValueParams(params, [
      "benchmark",
      "provider",
      "page",
      "pageSize",
      "sort",
      "direction",
    ]);
    const query = paginationSchema({
      benchmark: z.string().trim().min(1).max(200),
      provider: z.string().uuid().optional(),
      sort: z.enum(["scoreValue", "evaluatedAt"]).optional(),
      direction: z.enum(["asc", "desc"]).optional(),
    }).parse(input);
    rejectRepeatedOrUnsupported(params, [
      "benchmark",
      "provider",
      "page",
      "pageSize",
      "sort",
      "direction",
      "methodology",
      "modality",
      "date",
      "status",
      "workload",
    ]);
    const result = await catalogService.rankings(query);
    return success(result.data, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}
