
import React from 'react';
import { Product } from '../types';
import { formatCurrency } from '../utils/storage';

interface MenuCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ product, onAdd }) => {
  return (
    <div 
      onClick={() => onAdd(product)}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-slate-100 group"
    >
      <div className="relative h-40 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-slate-800 leading-tight">{product.name}</h3>
          <span className="text-sm font-bold text-amber-700 whitespace-nowrap ml-2">
            {formatCurrency(product.price)}
          </span>
        </div>
        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{product.description}</p>
        <div className="mt-3 flex items-center text-xs font-medium text-amber-800">
          <span className="bg-amber-50 px-2 py-0.5 rounded-full">{product.category}</span>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
