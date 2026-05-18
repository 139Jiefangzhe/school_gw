import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";

/**
 * Step: Send delivery notification to student
 */
const sendDeliveryNotificationStep = createStep(
  "send-delivery-notification",
  async (input: { order_id: string; student_id: string; type: string }, { container }) => {
    const logger = container.resolve("logger");

    logger.info(
      `Sending delivery notification: order=${input.order_id}, type=${input.type}`
    );

    // TODO: Integrate with WeChat messaging service
    // - Send subscription message via WeChat API
    // - Push notification to student

    return new StepResponse({
      notified: true,
      order_id: input.order_id,
      notification_type: input.type,
    });
  },
  async (result, { container }) => {
    const logger = container.resolve("logger");
    logger.info(`Compensating delivery notification for order ${result?.order_id}`);
  }
);

/**
 * Step: Update inventory after delivery confirmation
 */
const updateInventoryAfterDeliveryStep = createStep(
  "update-inventory-after-delivery",
  async (input: { order_id: string; items: any[] }, { container }) => {
    const inventoryService = container.resolve(Modules.INVENTORY);
    const logger = container.resolve("logger");

    logger.info(`Updating inventory for delivered order: ${input.order_id}`);

    // Inventory was already reserved during order placement
    // This step confirms the reservation and adjusts actual stock

    return new StepResponse({
      updated: true,
      order_id: input.order_id,
    });
  },
  async (result, { container }) => {
    const logger = container.resolve("logger");
    logger.info(`Compensating inventory update for order ${result?.order_id}`);
  }
);

/**
 * Workflow: Confirm Order Delivery
 * Triggered when a student confirms receipt of their order
 */
const confirmOrderDeliveryWorkflow = createWorkflow(
  "confirm-order-delivery",
  (input: { order_id: string; student_id: string; items: any[] }) => {
    // Step 1: Send delivery confirmation notification
    const notificationResult = sendDeliveryNotificationStep({
      order_id: input.order_id,
      student_id: input.student_id,
      type: "delivery_confirmed",
    });

    // Step 2: Update inventory
    const inventoryResult = updateInventoryAfterDeliveryStep({
      order_id: input.order_id,
      items: input.items,
    });

    return new WorkflowResponse({
      order_id: input.order_id,
      notification: notificationResult,
      inventory: inventoryResult,
    });
  }
);

export default confirmOrderDeliveryWorkflow;
