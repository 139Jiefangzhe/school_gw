import { Module } from "@medusajs/framework/utils";
import SchoolPickupModuleService from "./service";
import { PickupPoint } from "./models/pickup-point";

export { PickupPoint, SchoolPickupModuleService };

export default Module("schoolPickup", {
  service: SchoolPickupModuleService,
});
