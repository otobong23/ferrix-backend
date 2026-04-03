declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string; // env variables are always strings
    MONGO_DB: string;

    JWT_SECRET: string;
    JWT_RESET_SECRET: string;

    EMAIL_HOST?: string;
    EMAIL_PORT?: string;
    EMAIL_USER: string;
    EMAIL_PASS: string;

    GOOGLE_Client_ID: string;
    GOOGLE_Client_Secret: string;
    
    USDT_PAYMENT_GATEWAY_SECRET: string;

    NOWPAYMENTS_API_KEY: string;
    NOWPAYMENTS_IPN_SECRET_KEY: string;
    BACKEND_URL: string;

    NODE_ENV: "development" | "production" | "test";
  }
}
