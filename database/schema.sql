CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  stock INTEGER NOT NULL CHECK (stock >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY,
  customer_name VARCHAR(120) NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount > 0),
  status VARCHAR(30) NOT NULL CHECK (status IN ('CONFIRMED', 'PAYMENT_REFUSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO products (sku, name, price, stock)
VALUES
  ('NOTE-VELOZ-14', 'Notebook Veloz 14', 3899.90, 25),
  ('FONE-PRO-BT', 'Fone Bluetooth Pro', 299.90, 120),
  ('MOUSE-ERG-01', 'Mouse Ergonomico', 149.90, 80),
  ('TECLADO-MEC-RGB', 'Teclado Mecanico RGB', 419.90, 45)
ON CONFLICT (sku) DO NOTHING;
