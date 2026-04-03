import * as crypto from "crypto";
import { config } from "dotenv";
config()

export function verifyPaymentsSignature(rawBody: string, signature: string) {

   const secret = process.env.USDT_PAYMENT_GATEWAY_SECRET!;
   const payload = JSON.parse(rawBody);

   const hmac = crypto
      .createHmac("sha256", secret)
      .update(payload.data.txHash)
      .digest("hex");

   return hmac === signature;
}