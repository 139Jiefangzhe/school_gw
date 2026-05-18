import { model } from "@medusajs/framework/utils";

/**
 * SchoolStudent - Student entity for school mall
 * Stores student information linked to WeChat users
 */
const SchoolStudent = model.define("school_student", {
  id: model.id({ prefix: "sch_stu" }).primaryKey(),
  openid: model.text().nullable(),
  unionid: model.text().nullable(),
  real_name: model.text(),
  student_id: model.text().unique(),
  phone: model.text().nullable(),
  email: model.text().nullable(),
  school_name: model.text().nullable(),
  department: model.text().nullable(),
  grade: model.text().nullable(),
  dormitory_address: model.text().nullable(),
  is_verified: model.boolean().default(false),
  status: model.enum(["active", "inactive", "suspended"]).default("active"),
  metadata: model.json().nullable(),
});

export { SchoolStudent };
