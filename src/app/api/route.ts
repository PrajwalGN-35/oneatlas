import { success } from "@/lib/api/response";

export async function GET() {
  return success({
    name: "OneAtlas Catalog API",
    endpoints: [
      "/api/models",
      "/api/labs",
      "/api/providers",
      "/api/benchmarks",
      "/api/compare",
      "/api/rankings",
    ],
  });
}
