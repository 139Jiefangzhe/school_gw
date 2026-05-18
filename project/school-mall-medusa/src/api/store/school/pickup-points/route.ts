import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

/**
 * GET /store/school/pickup-points
 * Get pickup points list
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  return res.json({ pickup_points: [] });
}
