import { AbstractFulfillmentProvider } from "@medusajs/framework/utils";

/**
 * School Fulfillment Provider - 3 delivery types:
 * 1. logistics    - Express delivery
 * 2. selfpickup   - School pickup with code
 * 3. homedelivery - Door-to-door delivery
 */
class SchoolFulfillmentProviderService extends AbstractFulfillmentProvider {
  static identifier = "school";

  async getFulfillmentOptions() {
    return [
      { id: "logistics", name: "物流配送", description: "快递发货，3-5个工作日送达", price: 0 },
      { id: "selfpickup", name: "到校自提", description: "凭取货码至学校门卫处领取", price: 0 },
      { id: "homedelivery", name: "送货上门", description: "工作人员直接送至教室或宿舍", price: 2.00 },
    ];
  }

  async validateOption(option: any) {
    return ["logistics", "selfpickup", "homedelivery"].includes(option.id);
  }

  async canCalculate(data: any) { return true; }

  async calculatePrice(option: any, data: any, cart: any) {
    return { amount: option.id === "homedelivery" ? 2.00 : 0, currency: "CNY" };
  }

  async createFulfillment(data: any, items: any, order: any, fulfillment: any) {
    const type = data?.type || "logistics";
    const metadata: any = { type, timeline: [{ status: 0, desc: "订单已提交", time: new Date().toISOString() }] };

    if (type === "selfpickup") {
      metadata.pickup_code = Math.random().toString().slice(2, 8);
      metadata.pickup_point_id = data?.pickup_point_id;
      metadata.pickup_point_name = data?.pickup_point_name;
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 3);
      deadline.setHours(18, 0, 0, 0);
      metadata.deadline = deadline.toISOString();
    } else if (type === "homedelivery") {
      metadata.time_slot = data?.time_slot;
      metadata.delivery_date = data?.delivery_date;
      metadata.address = data?.address;
    } else {
      metadata.address = data?.address;
    }

    return { metadata };
  }

  async cancelFulfillment(fulfillment: any) {
    return { metadata: { ...fulfillment.metadata, cancelled: true } };
  }
}

export default SchoolFulfillmentProviderService;
