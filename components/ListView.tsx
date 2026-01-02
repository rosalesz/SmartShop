
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  orderBy,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { Product, ShoppingList } from '../types';

interface ListViewProps {
  user: User;
  listId: string;
  onBack: () => void;
}

const ListView: React.FC<ListViewProps> = ({ user, listId, onBack }) => {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Product Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [store, setStore] = useState('');
  const [link, setLink] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    // Fetch List Metadata
    const fetchList = async () => {
      const docRef = doc(db, 'lists', listId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setList({ id: docSnap.id, ...docSnap.data() } as ShoppingList);
      }
    };
    fetchList();

    // Fetch Products
    const q = query(
      collection(db, 'products'),
      where('listId', '==', listId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(fetchedProducts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [listId]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    try {
      await addDoc(collection(db, 'products'), {
        listId,
        userId: user.uid,
        name: name.trim(),
        price: parseFloat(price),
        store: store.trim(),
        link: link.trim(),
        createdAt: Date.now()
      });
      // Reset form
      setName('');
      setPrice('');
      setStore('');
      setLink('');
      setIsAdding(false);
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  const total = products.reduce((acc, p) => acc + (p.price || 0), 0);

  if (loading) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Navigation */}
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-indigo-600 font-bold hover:text-indigo-800 transition"
      >
        <i className="fas fa-arrow-left mr-2"></i> Volver al Dashboard
      </button>

      {/* List Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900">{list?.name}</h1>
          <p className="text-gray-500 mt-1">{products.length} productos registrados</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400 uppercase font-bold tracking-widest">Gasto Total</p>
          <p className="text-5xl font-black text-indigo-600">${total.toFixed(2)}</p>
        </div>
      </div>

      {/* Add Product Form */}
      {!isAdding ? (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full mb-8 py-4 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-2xl text-indigo-600 font-bold hover:bg-indigo-100 transition"
        >
          <i className="fas fa-plus mr-2"></i> Agregar Producto
        </button>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 mb-8 animate-in slide-in-from-top duration-300">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Añadir nuevo producto</h3>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del producto</label>
              <input 
                required
                type="text"
                placeholder="Ej: Monitor 4K LG"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Precio ($)</label>
              <input 
                required
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tienda</label>
              <input 
                type="text"
                placeholder="Ej: Amazon"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                value={store}
                onChange={(e) => setStore(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Link del producto (opcional)</label>
              <input 
                type="url"
                placeholder="https://..."
                className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
            <div className="md:col-span-2 flex gap-3 mt-2">
              <button type="submit" className="flex-grow bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-sm transition">
                Guardar Producto
              </button>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table/List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {products.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <i className="fas fa-box-open text-4xl mb-4"></i>
            <p className="font-medium">No hay productos en esta lista todavía.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Producto</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Tienda</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Precio</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{product.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      {product.store ? (
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                          {product.store}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-indigo-600">${product.price.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      {product.link ? (
                        <a 
                          href={product.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-600 transition"
                        >
                          <i className="fas fa-external-link-alt"></i>
                        </a>
                      ) : (
                        <span className="text-gray-200"><i className="fas fa-link"></i></span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;
