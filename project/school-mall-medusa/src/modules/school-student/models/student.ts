import { model } from "@medusajs/framework/utils";

const SchoolStudent = model.define("school_student", {
  id: model.id().primaryKey(),
  customer_id: model.text().nullable(),
  student_name: model.text(),
  school_name: model.text(),
  grade: model.text(),
  class_name: model.text(),
  is_default: model.boolean().default(false),
});

export default SchoolStudent;
