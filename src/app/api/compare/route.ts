import { z } from "zod";
import { ApiException, handleApiError } from "@/lib/api/errors";
import { success } from "@/lib/api/response";
import { catalogService } from "@/lib/services/catalog";
import { rejectRepeatedOrUnsupported } from "@/lib/api/safeParams";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    rejectRepeatedOrUnsupported(
      params,
      ["modelId", "provider"],
      [],
      ["modelId"],
    );
    const ids = params.getAll("modelId");
    const providerValues = params.getAll("provider");
    if (providerValues.length > 1)
      throw new ApiException(
        "REPEATED_QUERY_PARAMETER",
        "Query parameter 'provider' must appear only once",
        400,
      );
    const schema = z.object({
      modelId: z.array(z.string().uuid()).min(2).max(10),
      provider: z.string().uuid().optional(),
    });
    const query = schema.parse({ modelId: ids, provider: providerValues[0] });
    const result = await catalogService.compare(query.modelId, query.provider);
    return success(result.data, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}
