import { handleApiError } from "@/lib/api/errors";
import { success } from "@/lib/api/response";
import { catalogService } from "@/lib/services/catalog";
import { uuidSchema } from "@/lib/validation";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    return success(await catalogService.getLab(uuidSchema.parse(id)), { relationLimits: { models: 100 } });
  } catch (error) {
    return handleApiError(error);
  }
}
