import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

/**
 * GET /store/school/students
 * Get current customer student list
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  return res.status(501).json({
    message: "Student APIs are disabled in staging",
    students: [],
  });
}

/**
 * POST /store/school/students
 * Create student binding
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  return res.status(501).json({
    message: "Student APIs are disabled in staging",
  });
}
