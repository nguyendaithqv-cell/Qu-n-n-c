
import { CartItem, Order, Product, Category, Table } from '../types';

const KEYS = {
  TABLE_CARTS: 'bean_brew_table_carts',
  ORDERS: 'bean_brew_orders',
  PRODUCTS: 'bean_brew_products',
  CATEGORIES: 'bean_brew_categories',
  TABLES: 'bean_brew_tables'
};

export const saveToStore = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));
export const getFromStore = (key: string, defaultValue: any) => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
};

// Table Carts Storage (Record<tableId, CartItem[]>)
export const saveTableCarts = (carts: Record<string, CartItem[]>) => saveToStore(KEYS.TABLE_CARTS, carts);
export const getTableCarts = (): Record<string, CartItem[]> => getFromStore(KEYS.TABLE_CARTS, {});

export const saveOrders = (orders: Order[]) => saveToStore(KEYS.ORDERS, orders);
export const getOrders = (): Order[] => getFromStore(KEYS.ORDERS, []);

export const saveProducts = (products: Product[]) => saveToStore(KEYS.PRODUCTS, products);
export const getProducts = (initial: Product[]): Product[] => getFromStore(KEYS.PRODUCTS, initial);

export const saveCategories = (categories: Category[]) => saveToStore(KEYS.CATEGORIES, categories);
export const getCategories = (initial: Category[]): Category[] => getFromStore(KEYS.CATEGORIES, initial);

export const saveTables = (tables: Table[]) => saveToStore(KEYS.TABLES, tables);
export const getTables = (initial: Table[]): Table[] => getFromStore(KEYS.TABLES, initial);

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};
