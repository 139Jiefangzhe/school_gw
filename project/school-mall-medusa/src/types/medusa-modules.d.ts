import "@medusajs/medusa";

declare module "@medusajs/medusa" {
  interface ModuleImplementations {
    schoolStudent: import("../modules/school-student/service").default;
    schoolPickup: import("../modules/school-pickup/service").default;
  }
}
