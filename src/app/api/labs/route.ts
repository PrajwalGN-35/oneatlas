import { z } from "zod";
import { handleApiError } from "@/lib/api/errors";
import { success } from "@/lib/api/response";
import { catalogService } from "@/lib/services/catalog";
import {
  lifecycleStatusSchema,
  paginationSchema,
  sortSchema,
} from "@/lib/validation";
import { rejectRepeatedOrUnsupported } from "@/lib/api/safeParams";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const input = Object.fromEntries(params);
    const query = paginationSchema({
      q: z.string().trim().min(1).max(200).optional(),
      status: lifecycleStatusSchema.optional(),
      ...sortSchema(["name", "createdAt", "updatedAt"]).shape,
    }).parse(input);
    rejectRepeatedOrUnsupported(params, [
      "q",
      "status",
      "page",
      "pageSize",
      "sort",
      "direction",
    ]);
    const result = await catalogService.listLabs(query);
    return success(result.data, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}
