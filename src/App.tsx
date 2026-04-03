import { useState } from 'react';
import PointOfSale from './components/PointOfSale';
import ProductsManager from './components/ProductsManager';
import SalesHistory from './components/SalesHistory';
import Ticket from './components/Ticket';
import { ShoppingCart, Package, History, Receipt } from 'lucide-react';

type View = 'pos' | 'products' | 'history';

function App() {
  const [currentView, setCurrentView] = useState<View>('pos');
  const [showTicket, setShowTicket] = useState<string | null>(null);

  const handleSaleComplete = (saleId: string) => {
    setShowTicket(saleId);
  };

  const handleViewTicket = (saleId: string) => {
    setShowTicket(saleId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <header className="bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Receipt size={40} />
            <div>
              <h1 className="text-3xl font-bold">Fonda Tor-Tec</h1>
              <p className="text-orange-100">Sistema de Punto de Venta</p>
            </div>
          </div>
          <nav className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCurrentView('pos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                currentView === 'pos'
                  ? 'bg-white text-orange-600 shadow-md'
                  : 'bg-orange-700 hover:bg-orange-800 text-white'
              }`}
            >
              <ShoppingCart size={20} />
              Punto de Venta
            </button>
            <button
              onClick={() => setCurrentView('products')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                currentView === 'products'
                  ? 'bg-white text-orange-600 shadow-md'
                  : 'bg-orange-700 hover:bg-orange-800 text-white'
              }`}
            >
              <Package size={20} />
              Productos
            </button>
            <button
              onClick={() => setCurrentView('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                currentView === 'history'
                  ? 'bg-white text-orange-600 shadow-md'
                  : 'bg-orange-700 hover:bg-orange-800 text-white'
              }`}
            >
              <History size={20} />
              Historial
            </button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentView === 'pos' && <PointOfSale onSaleComplete={handleSaleComplete} />}
        {currentView === 'products' && <ProductsManager />}
        {currentView === 'history' && <SalesHistory onViewTicket={handleViewTicket} />}
      </main>

      {showTicket && (
        <Ticket saleId={showTicket} onClose={() => setShowTicket(null)} />
      )}
    </div>
  );
}

export default App;
