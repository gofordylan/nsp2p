export interface User {
  id: string;
  ns_sub: string;
  discord_username: string;
  discord_id: string | null;
  display_name: string;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  user_id: string;
  type: "buy" | "sell";
  premium_discount: number;
  min_zec: number | null;
  max_zec: number | null;
  payment_methods: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // joined from users table
  user?: User;
}

export interface ZecPrice {
  usd: number;
  eur: number;
  sgd: number;
  myr: number;
}
