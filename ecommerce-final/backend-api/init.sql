-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  stock INT DEFAULT 0,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create cart table
CREATE TABLE IF NOT EXISTS cart (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id),
  quantity INT DEFAULT 1,
  added_at TIMESTAMP DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id),
  quantity INT,
  price DECIMAL(10,2)
);

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id),
  discount_percent INT,
  title VARCHAR(255),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_products_category ON products(category);

-- Insert sample products
INSERT INTO products (name, description, price, category, stock) VALUES
('Laptop Pro', 'High performance laptop', 1299.99, 'Electronics', 50),
('Wireless Mouse', 'Comfortable wireless mouse', 29.99, 'Accessories', 200),
('USB-C Cable', 'Fast data transfer cable', 9.99, 'Cables', 500),
('Monitor 27"', '4K Ultra HD Monitor', 399.99, 'Electronics', 30),
('Keyboard Mechanical', 'RGB Mechanical Keyboard', 149.99, 'Accessories', 75);

INSERT INTO offers (product_id, discount_percent, title, start_date, end_date) VALUES
(1, 15, 'Laptop Sale', NOW()::date, (NOW() + INTERVAL '30 days')::date),
(2, 10, 'Mouse Discount', NOW()::date, (NOW() + INTERVAL '30 days')::date);
