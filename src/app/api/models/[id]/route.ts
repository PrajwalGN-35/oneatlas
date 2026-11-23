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
    const validId = uuidSchema.parse(id);
    const model = await catalogService.getModel(validId);
    return success(model, {
      relationLimits: {
        versions: 100,
        offerings: 100,
        pricing: 100,
        availabilityObservations: 100,
        capabilities: 100,
        modalities: 100,
        benchmarkResults: 100,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
