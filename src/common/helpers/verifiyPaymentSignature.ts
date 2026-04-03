import * as crypto from "crypto";
import { config } from "dotenv";
config()

export function verifyPaymentsSignature(rawBody: string, signature: string) {

   const secret = process.env.USDT_PAYMENT_GATEWAY_SECRET!;

   const hmac = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

   return hmac === signature;
}