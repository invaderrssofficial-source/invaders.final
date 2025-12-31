export type OrderItem = {
  productName: string;
  productImage: string;
  price: string;
  size: string;
  sizeCategory: "adult" | "kids";
  sleeveType: "short" | "long";
  jerseyName: string;
  quantity: number;
};

export type OrderRow = {
  id: string;
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
  total_price: string;
  transfer_slip_uri: string | null;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  created_at: string;
};

export type OrderInsert = {
  id?: string;
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
  total_price: string;
  transfer_slip_uri?: string | null;
  status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  created_at?: string;
};

export type MerchItemRow = {
  id: string;
  name: string;
  price: string;
  image: string;
  created_at: string;
};

export type MerchItemInsert = {
  id?: string;
  name: string;
  price: string;
  image: string;
  created_at?: string;
};

export type HeroRow = {
  id: string;
  name: string;
  position: string;
  number: string;
  image: string;
  created_at: string;
};

export type HeroInsert = {
  id?: string;
  name: string;
  position: string;
  number: string;
  image: string;
  created_at?: string;
};
