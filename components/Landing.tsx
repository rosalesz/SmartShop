
import React from 'react';

interface LandingProps {
  onStart: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <i className="fas fa-shopping-basket text-white text-xl"></i>
          </div>
          <span className="text-2xl font-bold text-gray-900">SmartShop</span>
        </div>
        <button 
          onClick={onStart}
          className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium hover:bg-indigo-700 transition duration-200"
        >
          Iniciar Sesión
        </button>
      </nav>

      <main className="flex-grow flex items-center justify-center px-6">
        <div className="max-w-4xl text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Organiza tus compras de forma <span className="text-indigo-600">inteligente</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Crea listas personalizadas, añade productos con precios y enlaces, y controla tus gastos en tiempo real. Todo en un solo lugar, solo para ti.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onStart}
              className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transform hover:scale-105 transition-all shadow-lg"
            >
              Comenzar Gratis
            </button>
            <button className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-100 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all">
              Saber más
            </button>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-gray-400 text-sm">
        &copy; 2024 SmartShop Inc. - Sin IA, sin complicaciones.
      </footer>
    </div>
  );
};

export default Landing;
