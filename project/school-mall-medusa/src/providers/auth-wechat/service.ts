import { AbstractAuthModuleProvider } from "@medusajs/framework/utils";
import type {
  AuthenticationInput,
  AuthenticationResponse,
  AuthIdentityProviderService,
} from "@medusajs/framework/types";
import axios from "axios";

export interface WechatAuthProviderOptions {
  appId: string;
  appSecret: string;
}

/**
 * WeChat MiniProgram Auth Provider for Medusa v2
 */
class WechatAuthProviderService extends AbstractAuthModuleProvider {
  static identifier = "wechat";
  static DISPLAY_NAME = "WeChat MiniProgram";

  protected options_: WechatAuthProviderOptions;

  constructor(container: Record<string, unknown>, options: WechatAuthProviderOptions) {
    super(...arguments);
    this.options_ = options;
  }

  async authenticate(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    const code = data.body?.code;

    if (!code) {
      return {
        success: false,
        error: "Missing WeChat login code",
      };
    }

    const sessionRes = await axios.get(
      "https://api.weixin.qq.com/sns/jscode2session",
      {
        params: {
          appid: this.options_.appId,
          secret: this.options_.appSecret,
          js_code: code,
          grant_type: "authorization_code",
        },
      }
    );

    if (sessionRes.data.errcode) {
      throw new Error(`WeChat auth failed: ${sessionRes.data.errmsg}`);
    }

    const { openid, session_key, unionid } = sessionRes.data;
    const authIdentityService = authIdentityProviderService as any;
    let authIdentity;

    try {
      authIdentity = await authIdentityService.retrieve({
        entity_id: openid,
      });
    } catch {
      authIdentity = await authIdentityService.create({
        entity_id: openid,
        provider_metadata: { session_key, unionid },
      });
    }

    return {
      success: true,
      authIdentity,
    };
  }

  async register(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    return this.authenticate(data, authIdentityProviderService);
  }
}

export default WechatAuthProviderService;
