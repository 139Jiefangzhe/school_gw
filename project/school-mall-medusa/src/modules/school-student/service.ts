import { MedusaService } from "@medusajs/framework/utils";
import { SchoolStudent } from "./models/school-student";

/**
 * SchoolStudentModuleService
 * Provides CRUD operations for student entities
 */
class SchoolStudentModuleService extends MedusaService({
  SchoolStudent,
}) {}

export default SchoolStudentModuleService;
