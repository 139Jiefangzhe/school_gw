import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";

/**
 * Subscriber: order.placed event
 * Triggered when a customer places an order
 * Actions: Send WeChat notification, update student order history
 */
export default async function orderPlacedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger");
  const orderId = event.data.id;

  logger.info(`[Subscriber] Order placed: ${orderId}`);

  try {
    // Fetch order details
    const orderModuleService = container.resolve(Modules.ORDER);
    const order = await orderModuleService.retrieveOrder(orderId, {
      relations: ["items", "shipping_address", "customer"],
    });

    logger.info(
      `Order ${orderId} details: ${order.items?.length || 0} items, total: ${order.total}`
    );

    // TODO: Send WeChat template message
    // - Fetch student's openid from school-student module
    // - Send order confirmation message via WeChat API

    // TODO: Update student order statistics
    // - Increment total order count
    // - Add to order history

    logger.info(`[Subscriber] Order ${orderId} processed successfully`);
  } catch (error) {
    logger.error(
      `[Subscriber] Error processing order ${orderId}: ${(error as Error).message}`
    );
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
