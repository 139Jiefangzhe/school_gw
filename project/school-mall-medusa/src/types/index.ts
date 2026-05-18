/**
 * School Mall - Type Definitions
 * Custom types for the school mall WeChat mini program
 */

// ─── WeChat Mini Program ───

export interface WeChatUserInfo {
  openid: string;
  unionid?: string;
  nickname?: string;
  avatarUrl?: string;
  phoneNumber?: string;
}

export interface WeChatLoginInput {
  code: string;
  userInfo?: WeChatUserInfo;
  encryptedData?: string;
  iv?: string;
}

// ─── WeChat Pay ───

export interface WeChatPayParams {
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: "RSA" | "MD5";
  paySign: string;
}

export interface WeChatPayOrderInput {
  openid: string;
  body: string;
  outTradeNo: string;
  totalFee: number; // in cents
  spbillCreateIp: string;
  notifyUrl: string;
  tradeType: "JSAPI" | "NATIVE" | "APP" | "H5";
}

export interface WeChatPayNotification {
  return_code: string;
  return_msg?: string;
  result_code: string;
  appid: string;
  mch_id: string;
  nonce_str: string;
  sign: string;
  out_trade_no: string;
  transaction_id: string;
  total_fee: number;
  time_end: string;
}

// ─── Student ───

export interface StudentInput {
  real_name: string;
  student_id: string;
  phone?: string;
  email?: string;
  school_name?: string;
  department?: string;
  grade?: string;
  dormitory_address?: string;
}

export interface StudentDTO {
  id: string;
  openid: string | null;
  unionid: string | null;
  real_name: string;
  student_id: string;
  phone: string | null;
  email: string | null;
  school_name: string | null;
  department: string | null;
  grade: string | null;
  dormitory_address: string | null;
  is_verified: boolean;
  status: "active" | "inactive" | "suspended";
  created_at: Date;
  updated_at: Date;
  metadata: Record<string, unknown> | null;
}

// ─── Pickup Point ───

export interface PickupPointInput {
  name: string;
  address: string;
  description?: string;
  business_hours?: string;
  contact_phone?: string;
  is_enabled?: boolean;
  sort_order?: number;
  metadata?: Record<string, unknown>;
}

export interface PickupPointDTO {
  id: string;
  name: string;
  address: string;
  description: string | null;
  business_hours: string | null;
  contact_phone: string | null;
  is_enabled: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
  metadata: Record<string, unknown> | null;
}

// ─── Delivery ───

export interface DeliveryOption {
  id: string;
  name: string;
  code: string;
  description: string;
  price: number;
  currency_code: string;
  estimated_days?: string;
}

export interface DeliveryTracking {
  tracking_number: string;
  carrier: string;
  status: string;
  events: DeliveryEvent[];
}

export interface DeliveryEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

// ─── Order ───

export interface SchoolOrderInput {
  student_id: string;
  items: OrderItemInput[];
  delivery_type: "express" | "pickup" | "door_delivery";
  pickup_point_id?: string;
  delivery_address?: string;
  delivery_time_slot?: string;
  remark?: string;
}

export interface OrderItemInput {
  product_id: string;
  variant_id: string;
  quantity: number;
}

// ─── API Response ───

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
