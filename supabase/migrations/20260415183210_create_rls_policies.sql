/*
  # Create RLS Policies for Public Access

  This migration creates permissive RLS policies for the POS system.
  The policies allow anonymous users to read products and create sales/sale items
  since this is a public-facing POS system without authentication.

  1. Products table
    - Allow anonymous users to read all products
  2. Sales table  
    - Allow anonymous users to create and read sales
  3. Sale Items table
    - Allow anonymous users to create and read sale items
*/

-- Products: Allow everyone to read
CREATE POLICY "products_read_all"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Sales: Allow everyone to create and read
CREATE POLICY "sales_create_all"
  ON sales
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "sales_read_all"
  ON sales
  FOR SELECT
  TO public
  USING (true);

-- Sale Items: Allow everyone to create and read
CREATE POLICY "sale_items_create_all"
  ON sale_items
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "sale_items_read_all"
  ON sale_items
  FOR SELECT
  TO public
  USING (true);