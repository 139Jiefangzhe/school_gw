import { Module } from "@medusajs/framework/utils";
import SchoolStudentModuleService from "./service";
import { SchoolStudent } from "./models/school-student";

export { SchoolStudent, SchoolStudentModuleService };

export default Module("schoolStudent", {
  service: SchoolStudentModuleService,
});
