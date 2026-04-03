interface NowPaymentsWebhookPayload {
  payment_id: number;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  actually_paid: number;
  actually_paid_at_fiat: number;
  outcome_amount: number;
  outcome_currency: string;
  order_id: string;
  order_description: string;
  purchase_id: string;
  invoice_id: string | null;
  parent_payment_id: number | null;
  fee: {
    currency: string;
    depositFee: number;
    serviceFee: number;
    withdrawalFee: number;
  };
}

interface USDT_PaymentPayload {
  event: string;
  data: {
    txHash: string;
    from: string;
    to: string;
    amount: string;
    blockNumber: number;
  };
}