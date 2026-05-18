import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

/**
 * PUT /store/school/students/:id
 * Update student info
 */
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  return res.status(501).json({
    message: "Student APIs are disabled in staging",
  });
}

/**
 * DELETE /store/school/students/:id
 * Delete student binding
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  return res.status(501).json({
    message: "Student APIs are disabled in staging",
  });
}
