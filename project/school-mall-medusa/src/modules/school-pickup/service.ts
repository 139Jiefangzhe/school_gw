import { MedusaService } from "@medusajs/framework/utils";
import { PickupPoint } from "./models/pickup-point";

/**
 * SchoolPickupModuleService
 * Provides CRUD operations for pickup point management
 */
class SchoolPickupModuleService extends MedusaService({
  PickupPoint,
}) {}

export default SchoolPickupModuleService;
