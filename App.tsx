
import React, { useState, useEffect, useMemo } from 'react';
import { Product, CartItem, Category, Order, Table } from './types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_TABLES } from './constants';
import * as storage from './utils/storage';
import MenuCard from './components/MenuCard';
import Button from './components/Button';

type ViewMode = 'pos' | 'report' | 'settings';

const App: React.FC = () => {
  // Global Data States
  const [view, setView] = useState<ViewMode>('pos');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Per-Table Cart State: { [tableId: string]: CartItem[] }
  const [tableCarts, setTableCarts] = useState<Record<string, CartItem[]>>({});
  
  // POS UI States
  const [selectedTable, setSelectedTable] = useState<string>('t1'); 
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  // Management States
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ name: '', price: 0, category: '', image: '', description: '' });
  const [newCategory, setNewCategory] = useState('');

  // Initial Load from Storage
  useEffect(() => {
    setProducts(storage.getProducts(INITIAL_PRODUCTS));
    setCategories(storage.getCategories(INITIAL_CATEGORIES));
    setTables(storage.getTables(INITIAL_TABLES));
    setOrders(storage.getOrders());
    setTableCarts(storage.getTableCarts());
  }, []);

  // Auto-save effects
  useEffect(() => storage.saveTableCarts(tableCarts), [tableCarts]);
  useEffect(() => storage.saveProducts(products), [products]);
  useEffect(() => storage.saveCategories(categories), [categories]);
  useEffect(() => storage.saveTables(tables), [tables]);
  useEffect(() => storage.saveOrders(orders), [orders]);

  // Derived Values for POS
  const currentCart = useMemo(() => tableCarts[selectedTable] || [], [tableCarts, selectedTable]);
  
  const cartTotal = useMemo(() => {
    return currentCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [currentCart]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const revenueToday = useMemo(() => {
    const today = new Date().setHours(0,0,0,0);
    return orders.filter(o => o.timestamp >= today).reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  // Cart Actions
  const addToCart = (product: Product) => {
    setTableCarts(prev => {
      const tableCart = prev[selectedTable] || [];
      const existing = tableCart.find(item => item.id === product.id);
      
      let updatedCart;
      if (existing) {
        updatedCart = tableCart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedCart = [...tableCart, { ...product, quantity: 1 }];
      }
      
      return { ...prev, [selectedTable]: updatedCart };
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setTableCarts(prev => {
      const tableCart = prev[selectedTable] || [];
      const updatedCart = tableCart.map(item => {
        if (item.id === productId) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      });
      return { ...prev, [selectedTable]: updatedCart };
    });
  };

  const removeFromCart = (productId: string) => {
    setTableCarts(prev => {
      const tableCart = prev[selectedTable] || [];
      const updatedCart = tableCart.filter(item => item.id !== productId);
      return { ...prev, [selectedTable]: updatedCart };
    });
  };

  const clearCurrentTableCart = () => {
    setTableCarts(prev => {
      const newCarts = { ...prev };
      delete newCarts[selectedTable];
      return newCarts;
    });
  };

  const finalizeOrder = () => {
    if (currentCart.length === 0) return;
    
    const table = tables.find(t => t.id === selectedTable);
    const newOrder: Order = {
      id: Date.now().toString(),
      items: [...currentCart],
      total: cartTotal,
      timestamp: Date.now(),
      tableName: table?.name || 'Mang đi',
      status: 'completed'
    };
    
    setOrders([newOrder, ...orders]);
    clearCurrentTableCart();
    setShowCheckout(false);
    alert("Thanh toán thành công!");
  };

  // Management Actions
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.category) return;
    const product: Product = {
      ...(newProduct as Product),
      id: Date.now().toString(),
      image: newProduct.image || `https://picsum.photos/seed/${Date.now()}/400/300`
    };
    setProducts([...products, product]);
    setNewProduct({ name: '', price: 0, category: '', image: '', description: '' });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory || categories.includes(newCategory)) return;
    setCategories([...categories, newCategory]);
    setNewCategory('');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-30 shadow-sm shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-amber-700 rounded-lg flex items-center justify-center text-white shadow-md shadow-amber-100">☕</div>
             <span className="font-bold text-slate-800 text-lg">Bean POS</span>
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setView('pos')} className={`px-5 py-1.5 rounded-lg text-sm font-bold transition-all ${view === 'pos' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Bán hàng</button>
            <button onClick={() => setView('report')} className={`px-5 py-1.5 rounded-lg text-sm font-bold transition-all ${view === 'report' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Báo cáo</button>
            <button onClick={() => setView('settings')} className={`px-5 py-1.5 rounded-lg text-sm font-bold transition-all ${view === 'settings' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Cấu hình</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hôm nay</p>
             <p className="text-sm font-black text-amber-700">{storage.formatCurrency(revenueToday)}</p>
          </div>
        </div>
      </nav>

      {view === 'pos' && (
        <div className="flex flex-1 overflow-hidden">
          {/* Menu & Tables Area */}
          <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
            {/* Table Selection Grid */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
               <div className="flex justify-between items-center mb-4">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sơ đồ bàn</p>
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">● ĐANG PHỤC VỤ</span>
               </div>
               <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                 {tables.map(t => {
                   const isOccupied = tableCarts[t.id] && tableCarts[t.id].length > 0;
                   const isSelected = selectedTable === t.id;
                   
                   return (
                     <button 
                       key={t.id} 
                       onClick={() => setSelectedTable(t.id)} 
                       className={`relative py-3 px-2 rounded-xl text-xs font-black border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                         isSelected 
                         ? 'bg-amber-700 border-amber-700 text-white shadow-lg shadow-amber-200 scale-105 z-10' 
                         : isOccupied 
                            ? 'bg-amber-50 border-amber-400 text-amber-800' 
                            : 'bg-white border-slate-100 text-slate-500 hover:border-amber-200'
                       }`}
                     >
                       {t.name}
                       {isOccupied && !isSelected && (
                         <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse absolute top-1 right-1"></span>
                       )}
                       {isOccupied && (
                         <span className={`text-[9px] ${isSelected ? 'text-amber-100' : 'text-amber-600'}`}>
                           {storage.formatCurrency(tableCarts[t.id].reduce((s,i) => s + i.price * i.quantity, 0))}
                         </span>
                       )}
                     </button>
                   );
                 })}
               </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
                <button 
                  onClick={() => setSelectedCategory('All')} 
                  className={`px-5 py-2 rounded-full text-xs font-black whitespace-nowrap border transition-all ${selectedCategory === 'All' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  TẤT CẢ
                </button>
                {categories.map(c => (
                  <button 
                    key={c} 
                    onClick={() => setSelectedCategory(c)} 
                    className={`px-5 py-2 rounded-full text-xs font-black whitespace-nowrap border transition-all ${selectedCategory === c ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                  >
                    {c.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-64">
                <input 
                  type="text" 
                  placeholder="Tìm món nhanh..." 
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all pl-10" 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map(p => <MenuCard key={p.id} product={p} onAdd={addToCart} />)}
              {filteredProducts.length === 0 && (
                 <div className="col-span-full py-20 text-center text-slate-400 italic">Không tìm thấy món nào</div>
              )}
            </div>
          </main>

          {/* Right Sidebar - Active Cart for Table */}
          <aside className="w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-2xl shrink-0 z-20">
             <div className="p-5 bg-slate-50/80 border-b border-slate-200 flex justify-between items-center backdrop-blur-sm">
                <div>
                   <h2 className="font-black text-slate-800">Đơn hàng hiện tại</h2>
                   <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                      <p className="text-xs text-amber-700 font-black uppercase tracking-widest">{tables.find(t => t.id === selectedTable)?.name}</p>
                   </div>
                </div>
                {currentCart.length > 0 && (
                  <button 
                    onClick={() => { if(confirm("Xóa đơn hàng của bàn này?")) clearCurrentTableCart() }} 
                    className="text-[10px] bg-red-50 text-red-500 px-3 py-1.5 rounded-lg font-black hover:bg-red-100 transition-colors uppercase"
                  >
                    Xóa bàn
                  </button>
                )}
             </div>
             
             <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
               {currentCart.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-3xl">🧺</div>
                    <p className="text-slate-400 font-bold text-sm">Bàn chưa có món</p>
                    <p className="text-[10px] text-slate-300 mt-1 uppercase font-black">Chọn món bên trái để bắt đầu</p>
                 </div>
               ) : (
                 currentCart.map(item => (
                   <div key={item.id} className="flex justify-between items-start group p-2 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                      <div className="flex-1 pr-4">
                         <h4 className="text-sm font-bold text-slate-800 leading-tight">{item.name}</h4>
                         <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm">
                              <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-l-lg transition-colors font-bold">-</button>
                              <span className="text-xs font-black w-6 text-center text-slate-800">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-r-lg transition-colors font-bold">+</button>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">{storage.formatCurrency(item.price)}/món</span>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-black text-slate-900">{storage.formatCurrency(item.price * item.quantity)}</p>
                         <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="mt-2 text-[10px] text-red-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                         >
                           Gỡ món
                         </button>
                      </div>
                   </div>
                 ))
               )}
             </div>

             <div className="p-6 border-t border-slate-100 space-y-4 bg-white">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-end text-slate-400 uppercase font-black text-[10px] tracking-widest">
                    <span>Tổng tiền</span>
                  </div>
                  <div className="flex justify-between items-center text-3xl font-black text-slate-900">
                    <span className="text-amber-700">{storage.formatCurrency(cartTotal)}</span>
                  </div>
                </div>
                <Button 
                  fullWidth 
                  className="py-5 text-lg font-black tracking-widest uppercase shadow-xl shadow-amber-200" 
                  disabled={currentCart.length === 0} 
                  onClick={() => setShowCheckout(true)}
                >
                  THANH TOÁN
                </Button>
             </div>
          </aside>
        </div>
      )}

      {view === 'report' && (
        <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full custom-scrollbar">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Lịch Sử Bán Hàng</h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Toàn bộ giao dịch đã hoàn thành</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6">
                 <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl">💰</div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Doanh thu tổng</p>
                    <p className="text-3xl font-black text-slate-900">{storage.formatCurrency(orders.reduce((s,o) => s + o.total, 0))}</p>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                      <tr>
                         <th className="px-8 py-5">Mã đơn / Thời gian</th>
                         <th className="px-8 py-5">Vị trí</th>
                         <th className="px-8 py-5">Nội dung đơn hàng</th>
                         <th className="px-8 py-5 text-right">Tổng thanh toán</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 text-sm">
                      {orders.map(order => (
                         <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-6">
                               <p className="font-black text-slate-800">#{order.id.slice(-6)}</p>
                               <p className="text-[10px] text-slate-400 font-bold mt-1">{new Date(order.timestamp).toLocaleString('vi-VN')}</p>
                            </td>
                            <td className="px-8 py-6">
                               <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black">{order.tableName.toUpperCase()}</span>
                            </td>
                            <td className="px-8 py-6 text-slate-600">
                               <div className="max-w-[300px] flex flex-wrap gap-1">
                                  {order.items.map((i, idx) => (
                                     <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                                       {i.quantity}x {i.name}
                                     </span>
                                  ))}
                               </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <p className="text-lg font-black text-slate-900">{storage.formatCurrency(order.total)}</p>
                               <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-1">Đã tất toán</p>
                            </td>
                         </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-20 text-center">
                            <div className="opacity-20 text-4xl mb-4">📄</div>
                            <p className="text-slate-400 font-bold italic">Chưa có dữ liệu giao dịch</p>
                          </td>
                        </tr>
                      )}
                   </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

      {view === 'settings' && (
        <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-10 custom-scrollbar">
           {/* Products Management */}
           <section className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-white text-xs">🍔</div>
                 <h3 className="text-xl font-black text-slate-800">Quản Lý Thực Đơn</h3>
              </div>
              <form onSubmit={handleAddProduct} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                 <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tên món</label>
                       <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all" value={newProduct.name || ''} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Giá bán (VNĐ)</label>
                       <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: parseInt(e.target.value) || 0})} required />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Danh mục</label>
                       <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none" value={newProduct.category || ''} onChange={e => setNewProduct({...newProduct, category: e.target.value})} required>
                          <option value="">Chọn...</option>
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>
                 <Button fullWidth type="submit" className="py-4">THÊM MÓN VÀO MENU</Button>
              </form>

              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                 <div className="p-5 bg-slate-50 border-b flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh sách hiện tại</span>
                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">{products.length} món</span>
                 </div>
                 <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
                    {products.map(p => (
                       <div key={p.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                <img src={p.image} className="w-full h-full object-cover" alt="" />
                             </div>
                             <div>
                                <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{p.category} • {storage.formatCurrency(p.price)}</p>
                             </div>
                          </div>
                          <button 
                            onClick={() => { if(confirm(`Xóa món ${p.name}?`)) setProducts(products.filter(item => item.id !== p.id)) }} 
                            className="w-8 h-8 flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                             ✕
                          </button>
                       </div>
                    ))}
                 </div>
              </div>
           </section>

           {/* Categories & System Management */}
           <div className="space-y-10">
              <section className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-white text-xs">🏷️</div>
                    <h3 className="text-xl font-black text-slate-800">Phân Loại Món</h3>
                 </div>
                 <form onSubmit={handleAddCategory} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex gap-3">
                    <input type="text" className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500" placeholder="Tên danh mục..." value={newCategory} onChange={e => setNewCategory(e.target.value)} required />
                    <Button type="submit">THÊM</Button>
                 </form>

                 <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
                    {categories.map(c => (
                       <div key={c} className="group bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-3 transition-all cursor-default border border-transparent hover:border-amber-200">
                          {c.toUpperCase()}
                          <button onClick={() => setCategories(categories.filter(item => item !== c))} className="text-slate-300 group-hover:text-amber-500 transition-colors">✕</button>
                       </div>
                    ))}
                 </div>
              </section>

              <section className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white text-xs">⚠️</div>
                    <h3 className="text-xl font-black text-slate-800">Hệ Thống</h3>
                 </div>
                 <div className="bg-red-50 border border-red-100 rounded-3xl p-8 space-y-4">
                    <div>
                       <h4 className="font-black text-red-800 text-sm uppercase tracking-widest">Vùng nguy hiểm</h4>
                       <p className="text-xs text-red-600/70 mt-1 font-medium leading-relaxed">Hành động này sẽ xóa sạch toàn bộ dữ liệu bao gồm thực đơn, lịch sử bán hàng và các đơn đang phục vụ. Không thể hoàn tác.</p>
                    </div>
                    <button 
                      onClick={() => { if(confirm("CẢNH BÁO: Xóa toàn bộ dữ liệu ứng dụng?")) { localStorage.clear(); window.location.reload(); } }} 
                      className="w-full py-4 bg-white text-red-600 border border-red-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                       Reset toàn bộ dữ liệu
                    </button>
                 </div>
              </section>
           </div>
        </div>
      )}

      {/* Checkout Backdrop & Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden animate-in zoom-in duration-300 shadow-2xl border border-white/20">
              <div className="p-8 bg-amber-700 text-white text-center relative">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Thông tin thanh toán</p>
                 <h2 className="text-3xl font-black">{tables.find(t => t.id === selectedTable)?.name.toUpperCase()}</h2>
                 <button onClick={() => setShowCheckout(false)} className="absolute top-6 right-8 text-white/40 hover:text-white transition-colors text-xl">✕</button>
              </div>
              <div className="p-10 space-y-8">
                 <div className="text-center">
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Tổng thu</p>
                    <p className="text-6xl font-black text-slate-900 my-4 tracking-tighter">{storage.formatCurrency(cartTotal)}</p>
                 </div>
                 
                 <div className="bg-slate-50 rounded-3xl p-6 space-y-3 border border-slate-100">
                    {currentCart.map(i => (
                       <div key={i.id} className="flex justify-between text-xs font-bold text-slate-600">
                          <span>{i.quantity}x {i.name}</span>
                          <span className="font-black text-slate-900">{storage.formatCurrency(i.price * i.quantity)}</span>
                       </div>
                    ))}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 border-2 border-amber-500 bg-amber-50 rounded-3xl text-center cursor-pointer shadow-sm">
                       <span className="block text-3xl mb-2">💵</span>
                       <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Tiền mặt</span>
                    </div>
                    <div className="p-5 border border-slate-100 bg-white rounded-3xl text-center opacity-40 cursor-not-allowed group relative">
                       <span className="block text-3xl mb-2">💳</span>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thẻ/QR</span>
                    </div>
                 </div>

                 <Button fullWidth className="py-6 text-xl font-black tracking-widest uppercase shadow-2xl shadow-amber-200" onClick={finalizeOrder}>XÁC NHẬN THANH TOÁN</Button>
                 
                 <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-widest">Nhấn để xác nhận đã thu đủ tiền và in hóa đơn</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
