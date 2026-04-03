/*
  # Sistema POS Fonda Tor-Tec

  1. Nuevas Tablas
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, nombre del producto)
      - `price` (numeric, precio del producto)
      - `category` (text, categoría del producto)
      - `available` (boolean, si está disponible)
      - `created_at` (timestamp)
    
    - `sales`
      - `id` (uuid, primary key)
      - `total` (numeric, total de la venta)
      - `payment_method` (text, método de pago)
      - `created_at` (timestamp, fecha de la venta)
    
    - `sale_items`
      - `id` (uuid, primary key)
      - `sale_id` (uuid, referencia a sales)
      - `product_id` (uuid, referencia a products)
      - `product_name` (text, nombre del producto al momento de la venta)
      - `quantity` (integer, cantidad vendida)
      - `price` (numeric, precio al momento de la venta)
      - `subtotal` (numeric, cantidad * precio)
      - `created_at` (timestamp)

  2. Seguridad
    - Enable RLS en todas las tablas
    - Políticas para permitir operaciones públicas (sistema interno de fonda)
*/

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  category text NOT NULL DEFAULT 'General',
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total numeric(10,2) NOT NULL CHECK (total >= 0),
  payment_method text NOT NULL DEFAULT 'Efectivo',
  created_at timestamptz DEFAULT now()
);

-- Tabla de items de venta
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  subtotal numeric(10,2) NOT NULL CHECK (subtotal >= 0),
  created_at timestamptz DEFAULT now()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para sistema interno
CREATE POLICY "Allow all operations on products"
  ON products FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on sales"
  ON sales FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on sale_items"
  ON sale_items FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insertar productos de ejemplo para la fonda
INSERT INTO products (name, price, category) VALUES
  ('Tacos de Asada', 15.00, 'Tacos'),
  ('Tacos de Pastor', 15.00, 'Tacos'),
  ('Tacos de Pollo', 12.00, 'Tacos'),
  ('Quesadillas', 25.00, 'Antojitos'),
  ('Torta de Milanesa', 35.00, 'Tortas'),
  ('Torta de Jamón', 30.00, 'Tortas'),
  ('Refresco', 15.00, 'Bebidas'),
  ('Agua Natural', 10.00, 'Bebidas'),
  ('Café', 12.00, 'Bebidas'),
  ('Orden de Flautas', 40.00, 'Antojitos')
ON CONFLICT DO NOTHING;