export interface WechatPayOptions {
  appId: string;
  mchId: string;
  apiV3Key: string;
  privateKey: string;
  notifyUrl: string;
}

export interface WechatPaySign {
  appId: string;
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: string;
  paySign: string;
}
