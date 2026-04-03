import { useState, useEffect } from 'react';
import { supabase, Sale, SaleItem } from '../lib/supabase';
import { Receipt, Calendar, DollarSign, CreditCard } from 'lucide-react';

interface SalesHistoryProps {
  onViewTicket: (saleId: string) => void;
}

export default function SalesHistory({ onViewTicket }: SalesHistoryProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<string | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>('today');

  useEffect(() => {
    loadSales();
  }, [dateFilter]);

  const loadSales = async () => {
    setLoading(true);
    let query = supabase.from('sales').select('*').order('created_at', { ascending: false });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (dateFilter === 'today') {
      query = query.gte('created_at', today.toISOString());
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('created_at', weekAgo.toISOString());
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte('created_at', monthAgo.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading sales:', error);
      setLoading(false);
      return;
    }

    setSales(data || []);
    setLoading(false);
  };

  const loadSaleItems = async (saleId: string) => {
    if (selectedSale === saleId) {
      setSelectedSale(null);
      setSaleItems([]);
      return;
    }

    const { data, error } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', saleId);

    if (error) {
      console.error('Error loading sale items:', error);
      return;
    }

    setSaleItems(data || []);
    setSelectedSale(saleId);
  };

  const calculateStats = () => {
    const total = sales.reduce((sum, sale) => sum + sale.total, 0);
    const count = sales.length;
    const average = count > 0 ? total / count : 0;

    return { total, count, average };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Historial de Ventas</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setDateFilter('today')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateFilter === 'today'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateFilter === 'week'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateFilter === 'month'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateFilter === 'all'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Todo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Vendido</p>
              <p className="text-2xl font-bold text-gray-800">
                ${stats.total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Receipt className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Número de Ventas</p>
              <p className="text-2xl font-bold text-gray-800">{stats.count}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Calendar className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ticket Promedio</p>
              <p className="text-2xl font-bold text-gray-800">
                ${stats.average.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Cargando ventas...</p>
        </div>
      ) : sales.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">No hay ventas registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sales.map((sale) => (
            <div key={sale.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => loadSaleItems(sale.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <Receipt className="text-orange-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Ticket #{sale.id.substring(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(sale.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      ${sale.total.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <CreditCard size={14} />
                      {sale.payment_method}
                    </div>
                  </div>
                </div>
              </div>

              {selectedSale === sale.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Detalles de la Venta</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-2">Producto</th>
                        <th className="text-center py-2">Cantidad</th>
                        <th className="text-right py-2">Precio</th>
                        <th className="text-right py-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saleItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-200">
                          <td className="py-2">{item.product_name}</td>
                          <td className="text-center py-2">{item.quantity}</td>
                          <td className="text-right py-2">${item.price.toFixed(2)}</td>
                          <td className="text-right py-2 font-semibold">
                            ${item.subtotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewTicket(sale.id);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Ver Ticket
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
