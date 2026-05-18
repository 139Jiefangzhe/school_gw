export interface WechatSessionResponse {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

export interface WechatAuthResult {
  success: boolean;
  authIdentity: {
    entity_id: string;
    provider: string;
    provider_metadata: {
      session_key: string;
      unionid?: string;
    };
  };
}
