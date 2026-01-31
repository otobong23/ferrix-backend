declare namespace NodeJS {
  interface ProcessEnv {
    MONGO_DB: string;
    JWT_SECRET: string;
    PORT: number;
    EMAIL_HOST: string;
    EMAIL_PORT: number;
    EMAIL_USER: string;
    EMAIL_PASS: string;
    FLUTTERWAVE_PUBLIC_KEY: string;
    FLUTTERWAVE_SECRET_KEY: string;
    FLUTTERWAVE_ENCRYPTION_KEY: string;
  }
}
