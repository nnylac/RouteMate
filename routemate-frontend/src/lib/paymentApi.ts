import { apiRequest } from '@/lib/api';

export interface PaymentIntentResponse {
  paymentIntentId: string;
  clientSecret: string | null;
  status: string;
  amount: number;
  currency: string;
}

export interface PaymentConfirmationResponse {
  paymentIntentId: string;
  status: string;
}

export function createPaymentIntent(payload: {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}) {
  return apiRequest<PaymentIntentResponse>('/payment/intent', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function confirmPaymentIntent(payload: {
  paymentIntentId: string;
  paymentMethod?: string;
}) {
  return apiRequest<PaymentConfirmationResponse>('/payment/confirm', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
