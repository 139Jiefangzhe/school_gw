import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import axios from "axios";

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";

/**
 * POST /store/school/auth
 * 微信小程序登录桥接
 * 
 * Body: { code: string }
 * 流程：
 * 1. 小程序传入 code
 * 2. 调用 Medusa Auth API: POST /auth/customer/wechat
 * 3. 获取 JWT Token
 * 4. 调用 Medusa Customer API 获取/创建客户
 * 5. 返回 token + customer
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as Record<string, unknown>;
  const code = typeof body.code === "string" ? body.code : "";

  if (!code) {
    return res.status(400).json({
      message: "Missing WeChat login code",
    });
  }

  if (process.env.ENABLE_WECHAT_AUTH !== "true") {
    return res.status(501).json({
      message: "WeChat auth is disabled in staging",
    });
  }

  try {
    const authRes = await axios.post(
      `${MEDUSA_BACKEND_URL}/auth/customer/wechat`,
      { code },
      { headers: { "Content-Type": "application/json" } }
    );

    const { token } = authRes.data;

    const customerRes = await axios.get(
      `${MEDUSA_BACKEND_URL}/store/customers/me`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.json({
      token,
      customer: customerRes.data.customer,
    });
  } catch (error: any) {
    return res.status(401).json({
      message: "WeChat login failed",
      detail: error.response?.data?.message || error.message,
    });
  }
}
