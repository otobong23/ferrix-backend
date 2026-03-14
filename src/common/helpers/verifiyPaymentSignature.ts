import * as crypto from "crypto";
import { config } from "dotenv";
config()

export function verifyNowPaymentsSignature(rawBody: string, signature: string) {

   const secret = process.env.NOWPYMENT_IPN_SECRET_KEY!;

   const hmac = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

   return hmac === signature;
}