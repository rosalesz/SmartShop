
import React, { useState, useEffect } from 'react';
import { User, signOut } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  orderBy 
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { ShoppingList } from '../types';

interface DashboardProps {
  user: User;
  onNavigateToList: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigateToList }) => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [listTotals, setListTotals] = useState<Record<string, number>>({});
  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'lists'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeLists = onSnapshot(q, (snapshot) => {
      const fetchedLists = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ShoppingList[];
      setLists(fetchedLists);
    });

    // Subscribirse a todos los productos del usuario para calcular totales de listas
    const pq = query(
      collection(db, 'products'),
      where('userId', '==', user.uid)
    );

    const unsubscribeProducts = onSnapshot(pq, (snapshot) => {
      const totals: Record<string, number> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const listId = data.listId;
        const price = Number(data.price) || 0;
        totals[listId] = (totals[listId] || 0) + price;
      });
      setListTotals(totals);
    });

    return () => {
      unsubscribeLists();
      unsubscribeProducts();
    };
  }, [user.uid]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      await addDoc(collection(db, 'lists'), {
        userId: user.uid,
        name: newListName.trim(),
        createdAt: Date.now()
      });
      setNewListName('');
      setIsCreating(false);
    } catch (err) {
      console.error("Error creating list:", err);
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Mis Listas</h1>
          <p className="text-gray-500">Sesión iniciada como: <span className="font-semibold text-indigo-600">{user.email}</span></p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center hover:bg-indigo-700 transition shadow-sm"
          >
            <i className="fas fa-plus mr-2"></i> Nueva Lista
          </button>
          <button 
            onClick={handleLogout}
            className="bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Create List Modal/Inline */}
      {isCreating && (
        <div className="mb-8 bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
          <form onSubmit={handleCreateList} className="flex flex-col sm:flex-row gap-4">
            <input 
              autoFocus
              type="text"
              placeholder="Nombre de la lista (ej: Compras Semanales)"
              className="flex-grow px-4 py-3 rounded-xl border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex-grow">
                Crear
              </button>
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="bg-white text-gray-600 px-6 py-3 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lists Grid */}
      {lists.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <div className="bg-gray-100 inline-block p-4 rounded-full mb-4">
            <i className="fas fa-clipboard-list text-gray-400 text-4xl"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900">No tienes listas aún</h3>
          <p className="text-gray-500 mt-1">Crea tu primera lista para empezar a organizar tus compras.</p>
          <button 
            onClick={() => setIsCreating(true)}
            className="mt-6 text-indigo-600 font-bold hover:underline"
          >
            Comenzar ahora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <div 
              key={list.id} 
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group"
              onClick={() => onNavigateToList(list.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-100 p-3 rounded-xl group-hover:bg-indigo-600 transition duration-300">
                  <i className="fas fa-shopping-cart text-indigo-600 group-hover:text-white transition duration-300"></i>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(list.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{list.name}</h3>
              <div className="flex items-center justify-between mt-6">
                <div>
                  <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Total</p>
                  <p className="text-2xl font-black text-indigo-600">
                    ${(listTotals[list.id] || 0).toFixed(2)}
                  </p>
                </div>
                <div className="text-indigo-600 font-bold flex items-center group-hover:translate-x-1 transition-transform">
                  Ver productos <i className="fas fa-chevron-right ml-2 text-sm"></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
