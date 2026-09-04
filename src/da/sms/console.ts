import "server-only";

import type { SmsVerifier } from "@/da/contracts";
import { logger } from "@/lib/logger";

const LOCAL_CODE = "000000";

export function createConsoleSmsVerifier(): SmsVerifier {
  return {
    async send(_phoneE164) {
      logger.info("SMS driver=console; verification send skipped");
    },
    async check(_phoneE164, code) {
      return code === LOCAL_CODE;
    },
  };
}
