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
    return success(
      await catalogService.getProvider(uuidSchema.parse(id)),
      { relationLimits: { offerings: 100, availabilityObservations: 20, pricing: 20 } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
