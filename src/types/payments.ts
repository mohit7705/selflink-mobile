export interface Plan {
  id: number;
  name: string;
  price_cents: number;
  interval: string;
  features: string[];
  is_active: boolean;
}

export interface Subscription {
  id: number;
  plan: Plan;
  status: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: number;
  balance_cents: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionCheckoutResponse {
  subscription: Subscription;
  checkout_url: string;
  session_id: string;
}
