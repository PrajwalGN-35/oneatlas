import { z } from "zod";
import { ApiException, handleApiError } from "@/lib/api/errors";
import { success } from "@/lib/api/response";
import { objectFromSingleValueParams } from "@/lib/api/query";
import { rejectRepeatedOrUnsupported } from "@/lib/api/safeParams";
import { catalogService } from "@/lib/services/catalog";
import {
  lifecycleStatusSchema,
  paginationSchema,
  sortSchema,
} from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const input = objectFromSingleValueParams(params, [
      "q",
      "labId",
      "providerId",
      "capability",
      "modality",
      "workload",
      "status",
      "page",
      "pageSize",
      "sort",
      "direction",
    ]);
    if (params.has("workload")) {
      throw new ApiException(
        "UNSUPPORTED_FILTER",
        "The workload filter is not supported by the current catalog domain model",
        400,
      );
    }
    rejectRepeatedOrUnsupported(params, [
      "q",
      "labId",
      "providerId",
      "capability",
      "modality",
      "workload",
      "status",
      "page",
      "pageSize",
      "sort",
      "direction",
    ]);
    const schema = paginationSchema({
      q: z.string().trim().min(1).max(200).optional(),
      labId: z.string().uuid().optional(),
      providerId: z.string().uuid().optional(),
      capability: z.string().trim().min(1).max(100).optional(),
      modality: z.string().trim().min(1).max(100).optional(),
      status: lifecycleStatusSchema.optional(),
      ...sortSchema(["name", "createdAt", "updatedAt"]).shape,
    });
    const query = schema.parse(input);
    const result = await catalogService.listModels(query);
    return success(result.data, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}
