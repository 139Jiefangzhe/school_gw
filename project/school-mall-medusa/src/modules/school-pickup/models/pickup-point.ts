import { model } from "@medusajs/framework/utils";

/**
 * PickupPoint - Self-pickup location entity
 * Defines pickup points within the school campus
 */
const PickupPoint = model.define("pickup_point", {
  id: model.id({ prefix: "pkp_pt" }).primaryKey(),
  name: model.text(),
  address: model.text(),
  description: model.text().nullable(),
  business_hours: model.text().nullable(),
  contact_phone: model.text().nullable(),
  is_enabled: model.boolean().default(true),
  sort_order: model.number().default(0),
  metadata: model.json().nullable(),
});

export { PickupPoint };
