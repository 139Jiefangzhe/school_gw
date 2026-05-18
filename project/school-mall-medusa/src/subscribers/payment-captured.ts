import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";

/**
 * Subscriber: payment.captured event
 * Triggered when payment is successfully captured
 * Actions: Prepare fulfillment, send payment confirmation
 */
export default async function paymentCapturedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string; amount: number }>) {
  const logger = container.resolve("logger");
  const paymentId = event.data.id;

  logger.info(`[Subscriber] Payment captured: ${paymentId}`);

  try {
    // Fetch payment details
    const paymentModuleService = container.resolve(Modules.PAYMENT);
    const payment = await paymentModuleService.retrievePaymentCollection(
      paymentId
    );

    logger.info(
      `Payment ${paymentId} captured, preparing fulfillment pipeline`
    );

    // TODO: Trigger fulfillment preparation
    // - Check inventory availability
    // - Assign to nearest warehouse/pickup point
    // - Notify warehouse staff

    // TODO: Send payment success notification to student via WeChat

    logger.info(`[Subscriber] Payment ${paymentId} fulfillment prepared`);
  } catch (error) {
    logger.error(
      `[Subscriber] Error processing payment ${paymentId}: ${(error as Error).message}`
    );
  }
}

export const config: SubscriberConfig = {
  event: "payment.captured",
};
