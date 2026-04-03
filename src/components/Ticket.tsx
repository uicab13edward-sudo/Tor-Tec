import { useEffect, useState } from 'react';
import { supabase, SaleWithItems, SaleItem } from '../lib/supabase';
import { Printer, X } from 'lucide-react';

interface TicketProps {
  saleId: string;
  onClose: () => void;
}

export default function Ticket({ saleId, onClose }: TicketProps) {
  const [sale, setSale] = useState<SaleWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSale();
  }, [saleId]);

  const loadSale = async () => {
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .select('*')
      .eq('id', saleId)
      .single();

    if (saleError) {
      console.error('Error loading sale:', saleError);
      setLoading(false);
      return;
    }

    const { data: itemsData, error: itemsError } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', saleId);

    if (itemsError) {
      console.error('Error loading sale items:', itemsError);
      setLoading(false);
      return;
    }

    setSale({
      ...saleData,
      sale_items: itemsData as SaleItem[],
    });
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg">
          <p>Cargando ticket...</p>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg">
          <p>Error al cargar el ticket</p>
          <button
            onClick={onClose}
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 no-print">
          <h2 className="text-xl font-bold text-gray-800">Ticket de Venta</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Printer size={20} />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div id="ticket-content" className="p-6 ticket-print">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Fonda Tor-Tec</h1>
            <p className="text-sm text-gray-600">Comida Casera</p>
            <p className="text-xs text-gray-500 mt-2">
              {formatDate(sale.created_at)}
            </p>
          </div>

          <div className="border-t border-b border-gray-300 py-3 mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Ticket #:</span>{' '}
              {sale.id.substring(0, 8).toUpperCase()}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Método de Pago:</span> {sale.payment_method}
            </p>
          </div>

          <div className="mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2">Producto</th>
                  <th className="text-center py-2">Cant.</th>
                  <th className="text-right py-2">Precio</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.sale_items.map((item) => (
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
          </div>

          <div className="border-t-2 border-gray-300 pt-4 mb-6">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>TOTAL:</span>
              <span className="text-orange-600">${sale.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600 border-t border-gray-300 pt-4">
            <p className="font-semibold mb-1">¡Gracias por su preferencia!</p>
            <p className="text-xs">Fonda Tor-Tec</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .ticket-print, .ticket-print * {
            visibility: visible;
          }
          .ticket-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
