export interface CtechPayOptions {
  baseUrl?: string;
  timeout?: number;
}

export interface HostedPaymentPayload {
  amount: number;
  category_flag?: string;
  customer_reference?: string;
  customer_message?: string;
  customer_name?: string;
  customer_email?: string;
  redirectUrl?: string;
  cancelUrl?: string;
}

export interface AirtelPaymentPayload {
  amount: number;
  phone: string;
  category_flag?: string;
  customer_reference?: string;
  customer_message?: string;
}

export interface CardPaymentPagePayload {
  amount: number;
  category_flag?: string;
  merchantAttributes?: boolean;
  redirectUrl?: string;
  cancelUrl?: string;
  cancelText?: string;
  skipConfirmationPage?: boolean;
  customer_reference?: string;
  customer_message?: string;
}

export class CtechPayError extends Error {
  status: number;
  response: unknown;
}

export class CtechPay {
  constructor(token: string, options?: CtechPayOptions);
  static client(token: string, options?: CtechPayOptions): CtechPay;

  hostedPayments: {
    create(payload: HostedPaymentPayload): Promise<Record<string, unknown>>;
  };

  airtel: {
    pay(payload: AirtelPaymentPayload): Promise<Record<string, unknown>>;
    status(transactionId: string): Promise<Record<string, unknown>>;
    details(transactionId: string): Promise<Record<string, unknown>>;
    reference(airtelMoneyId: string): Promise<Record<string, unknown>>;
  };

  cards: {
    createPaymentPage(payload: CardPaymentPagePayload): Promise<Record<string, unknown>>;
    status(orderReference: string): Promise<Record<string, unknown>>;
  };

  get(path: string, query?: Record<string, unknown>): Promise<Record<string, unknown>>;
  post(path: string, payload?: Record<string, unknown>): Promise<Record<string, unknown>>;
  request(method: string, path: string, data?: Record<string, unknown>): Promise<Record<string, unknown>>;
}

export default CtechPay;
