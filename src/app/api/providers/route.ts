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
    rejectRepeatedOrUnsupported(params, [
      "q",
      "status",
      "page",
      "pageSize",
      "sort",
      "direction",
    ]);
    const input = Object.fromEntries(params);
    const query = paginationSchema({
      q: z.string().trim().min(1).max(200).optional(),
      status: lifecycleStatusSchema.optional(),
      ...sortSchema(["name", "createdAt", "updatedAt"]).shape,
    }).parse(input);
    const result = await catalogService.listProviders(query);
    return success(result.data, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}
