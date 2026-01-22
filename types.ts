
export type Category = string;

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  image: string;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
  note?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  timestamp: number;
  tableName: string;
  status: 'completed' | 'pending';
}

export interface Table {
  id: string;
  name: string;
  status: 'available' | 'occupied';
}
