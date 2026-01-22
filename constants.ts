
import { Product, Category, Table } from './types';

export const INITIAL_CATEGORIES: Category[] = ['Cà phê', 'Trà & Macchiato', 'Đá xay', 'Bánh & Tráng miệng'];

export const INITIAL_TABLES: Table[] = [
  { id: 't1', name: 'Bàn 1', status: 'available' },
  { id: 't2', name: 'Bàn 2', status: 'available' },
  { id: 't3', name: 'Bàn 3', status: 'available' },
  { id: 't4', name: 'Bàn 4', status: 'available' },
  { id: 't5', name: 'Bàn 5', status: 'available' },
  { id: 't6', name: 'Bàn 6', status: 'available' },
  { id: 't7', name: 'Mang đi', status: 'available' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Cà Phê Sữa Đá',
    price: 29000,
    category: 'Cà phê',
    image: 'https://picsum.photos/seed/coffee1/400/300',
    description: 'Vị cà phê đậm đà kết hợp sữa đặc truyền thống.'
  },
  {
    id: '2',
    name: 'Bạc Xỉu',
    price: 32000,
    category: 'Cà phê',
    image: 'https://picsum.photos/seed/coffee2/400/300',
    description: 'Nhiều sữa ít cà phê, vị ngọt thanh dịu.'
  },
  {
    id: '4',
    name: 'Trà Đào Cam Sả',
    price: 45000,
    category: 'Trà & Macchiato',
    image: 'https://picsum.photos/seed/tea1/400/300',
    description: 'Trà đào thơm ngát với cam tươi và sả.'
  }
];
