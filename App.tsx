
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ListView from './components/ListView';
import { ViewState } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>('landing');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setView('dashboard');
      } else {
        setView('landing');
      }
    });
    return () => unsubscribe();
  }, []);

  const navigateToList = (listId: string) => {
    setSelectedListId(listId);
    setView('list_detail');
  };

  const backToDashboard = () => {
    setSelectedListId(null);
    setView('dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {view === 'landing' && <Landing onStart={() => setView('auth')} />}
      {view === 'auth' && <Auth onCancel={() => setView('landing')} />}
      {view === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          onNavigateToList={navigateToList} 
        />
      )}
      {view === 'list_detail' && user && selectedListId && (
        <ListView 
          user={user} 
          listId={selectedListId} 
          onBack={backToDashboard} 
        />
      )}
    </div>
  );
};

export default App;
