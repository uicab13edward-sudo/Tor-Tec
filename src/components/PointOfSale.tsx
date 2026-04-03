import { useState, useEffect } from 'react';
import { supabase, Product } from '../lib/supabase';
import { Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote } from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

interface PointOfSaleProps {
  onSaleComplete: (saleId: string) => void;
}

export default function PointOfSale({ onSaleComplete }: PointOfSaleProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [paymentMethod, setPaymentMethod] = useState<string>('Efectivo');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('available', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error loading products:', error);
      return;
    }

    setProducts(data || []);
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  };

  const completeSale = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const total = calculateTotal();

    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([
        {
          total,
          payment_method: paymentMethod,
        },
      ])
      .select()
      .single();

    if (saleError || !saleData) {
      console.error('Error creating sale:', saleError);
      alert('Error al crear la venta');
      return;
    }

    const saleItems = cart.map((item) => ({
      sale_id: saleData.id,
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      subtotal: item.product.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);

    if (itemsError) {
      console.error('Error creating sale items:', itemsError);
      alert('Error al crear los items de venta');
      return;
    }

    setCart([]);
    onSaleComplete(saleData.id);
  };

  const categories = ['Todos', ...new Set(products.map((p) => p.category))];
  const filteredProducts =
    selectedCategory === 'Todos'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 text-left"
            >
              <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 mb-2">{product.category}</p>
              <p className="text-lg font-bold text-orange-600">
                ${product.price.toFixed(2)}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg h-fit sticky top-4">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="text-orange-600" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Carrito</h2>
        </div>

        {cart.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Carrito vacío</p>
        ) : (
          <div className="space-y-3 mb-4">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="border-b border-gray-200 pb-3"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-800 flex-1">
                    {item.product.name}
                  </h4>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="bg-gray-200 hover:bg-gray-300 rounded p-1 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-semibold w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="bg-gray-200 hover:bg-gray-300 rounded p-1 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="font-bold text-orange-600">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t-2 border-gray-300 pt-4 mb-4">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total:</span>
            <span className="text-orange-600">${calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Método de Pago
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPaymentMethod('Efectivo')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                paymentMethod === 'Efectivo'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Banknote size={20} />
              Efectivo
            </button>
            <button
              onClick={() => setPaymentMethod('Tarjeta')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                paymentMethod === 'Tarjeta'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CreditCard size={20} />
              Tarjeta
            </button>
          </div>
        </div>

        <button
          onClick={completeSale}
          disabled={cart.length === 0}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
        >
          Completar Venta
        </button>
      </div>
    </div>
  );
}
