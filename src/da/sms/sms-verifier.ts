import "server-only";

export type SmsVerifier = {
  send(phoneE164: string): Promise<void>;
  check(phoneE164: string, code: string): Promise<boolean>;
};
