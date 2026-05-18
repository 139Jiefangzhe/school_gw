import { AbstractPaymentProvider } from "@medusajs/framework/utils";
import axios from "axios";

export interface WechatPayOptions {
  appId: string;
  mchId: string;
  apiV3Key: string;
  privateKey: string;
  notifyUrl: string;
}

class WechatPayProviderService extends AbstractPaymentProvider {
  static identifier = "wechatpay";
  protected options_: WechatPayOptions;

  constructor(container, options: WechatPayOptions) {
    super(arguments);
    this.options_ = options;
  }

  async initiatePayment(input: any) {
    const { amount, context } = input;
    const { openid } = context?.customer || {};
    const orderNo = input.data?.order_no || `WX${Date.now()}`;
    const totalAmount = Math.round(amount * 100);

    const prepayId = await this.unifiedOrder({
      description: `学校商城订单 ${orderNo}`,
      outTradeNo: orderNo,
      notifyUrl: this.options_.notifyUrl,
      amount: totalAmount,
      openid,
    });

    const timeStamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = Math.random().toString(36).substring(2, 15);
    const packageStr = `prepay_id=${prepayId}`;

    return {
      id: orderNo,
      data: {
        appId: this.options_.appId,
        timeStamp,
        nonceStr,
        package: packageStr,
        signType: "RSA",
        paySign: this.generatePaySign({ appId: this.options_.appId, timeStamp, nonceStr, package: packageStr }),
      },
      status: "pending",
    };
  }

  async unifiedOrder(params: { description: string; outTradeNo: string; notifyUrl: string; amount: number; openid: string }): Promise<string> {
    const url = "https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi";
    const body = {
      appid: this.options_.appId,
      mchid: this.options_.mchId,
      description: params.description,
      out_trade_no: params.outTradeNo,
      notify_url: params.notifyUrl,
      amount: { total: params.amount, currency: "CNY" },
      payer: { openid: params.openid },
    };

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = Math.random().toString(36).substring(2, 15);
    const bodyStr = JSON.stringify(body);

    const response = await axios.post(url, body, {
      headers: {
        Authorization: `WECHATPAY2-SHA256-RSA2048 mchid="${this.options_.mchId}",nonce_str="${nonceStr}",signature="${this.sign(timestamp, nonceStr, bodyStr)}",timestamp="${timestamp}",serial_no="${this.options_.mchId}"`,
        "Content-Type": "application/json",
      },
    });
    return response.data.prepay_id;
  }

  async authorizePayment(paymentSessionData: any, context: any) {
    return { status: "authorized", data: paymentSessionData };
  }

  async capturePayment(paymentData: any) {
    return { status: "captured", data: paymentData };
  }

  async refundPayment(paymentData: any, refundAmount: number) {
    return { status: "refunded", data: { ...paymentData, refund_amount: refundAmount } };
  }

  async cancelPayment(paymentData: any) {
    return { status: "canceled", data: paymentData };
  }

  async deletePayment(paymentSessionData: any) {
    return paymentSessionData;
  }

  private sign(timestamp: string, nonceStr: string, body: string): string {
    return `${timestamp}_${nonceStr}`;  // Simplified for demo
  }

  private generatePaySign(params: { appId: string; timeStamp: string; nonceStr: string; package: string }): string {
    return `${params.appId}_${params.timeStamp}`;  // Simplified for demo
  }
}

export default WechatPayProviderService;
