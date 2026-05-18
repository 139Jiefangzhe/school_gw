import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

/**
 * GET /store/school
 * Public endpoint for school-related configurations
 * Returns: pickup points, delivery options, etc.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);
  logger.info("Returning staging school configuration fallback");

  return res.json({
    pickup_points: [],
    delivery_options: [],
  });
};
