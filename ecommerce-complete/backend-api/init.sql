-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    is_on_sale BOOLEAN DEFAULT false,
    category VARCHAR(100),
    gender VARCHAR(20),
    product_type VARCHAR(100),
    sizes JSON,
    age_group VARCHAR(50),
    image_url VARCHAR(500),
    images JSON,
    stock INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cart table
CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    items JSON,
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    payment_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create returns table
CREATE TABLE IF NOT EXISTS returns (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sales_offers table
CREATE TABLE IF NOT EXISTS sales_offers (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    discount_percent DECIMAL(5, 2),
    title VARCHAR(255),
    start_date DATE,
    end_date DATE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create search history table
CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    search_query VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_gender ON products(gender);
CREATE INDEX idx_products_product_type ON products(product_type);
CREATE INDEX idx_products_is_on_sale ON products(is_on_sale);
CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_sales_offers_product_id ON sales_offers(product_id);
CREATE INDEX idx_search_history_user_id ON search_history(user_id);

-- Seed sample data
INSERT INTO users (email, password, first_name, last_name, is_admin)
VALUES
  ('admin@shophub.com', '$2a$10$zP8a6JMDP2zOqj/1l2XQnex5mG7jH3h5cB1G1x8p5Gg5jZ4P6L7y.', 'Admin', 'User', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO products (name, description, price, original_price, discount_percent, is_on_sale, category, gender, product_type, sizes, age_group, image_url, stock)
VALUES
  ('Premium Cotton Shirt', 'High-quality cotton shirt with modern fit and comfortable feel.', 599.00, 999.00, 40, true, 'Fashion', 'Men', 'Shirt', '["S", "M", "L", "XL", "XXL"]', '18-40', 'https://via.placeholder.com/300x300?text=Men+Shirt', 50),
  ('Denim Jeans', 'Classic blue denim jeans with perfect fit and durability.', 899.00, 1499.00, 40, true, 'Fashion', 'Men', 'Jeans', '["28", "30", "32", "34", "36", "38"]', '18-50', 'https://via.placeholder.com/300x300?text=Denim+Jeans', 40),
  ('Casual T-Shirt', 'Soft and comfortable casual t-shirt available in multiple colors.', 299.00, 499.00, 40, true, 'Fashion', 'Men', 'T-Shirt', '["XS", "S", "M", "L", "XL", "XXL"]', '18-40', 'https://via.placeholder.com/300x300?text=Casual+TShirt', 60),
  ('Cotton Shorts', 'Breathable cotton shorts perfect for summer.', 449.00, 799.00, 44, true, 'Fashion', 'Men', 'Shorts', '["S", "M", "L", "XL"]', '18-35', 'https://via.placeholder.com/300x300?text=Cotton+Shorts', 35),
  ('Formal Trousers', 'Premium formal trousers for office and formal events.', 1199.00, 1999.00, 40, true, 'Fashion', 'Men', 'Trousers', '["28", "30", "32", "34", "36"]', '25-50', 'https://via.placeholder.com/300x300?text=Formal+Trousers', 30),
  
  ('Saree - Silk', 'Elegant silk saree with traditional patterns and modern designs.', 2499.00, 4999.00, 50, true, 'Fashion', 'Women', 'Saree', '["Free Size"]', '20-60', 'https://via.placeholder.com/300x300?text=Silk+Saree', 25),
  ('Cotton Saree', 'Comfortable and breathable cotton saree for everyday wear.', 999.00, 1999.00, 50, true, 'Fashion', 'Women', 'Saree', '["Free Size"]', '18-60', 'https://via.placeholder.com/300x300?text=Cotton+Saree', 40),
  ('Women Tops', 'Stylish and comfortable tops with trendy designs.', 599.00, 999.00, 40, true, 'Fashion', 'Women', 'Top', '["XS", "S", "M", "L", "XL", "XXL"]', '18-40', 'https://via.placeholder.com/300x300?text=Women+Tops', 55),
  ('Leggings', 'Stretchable and comfortable leggings for all activities.', 399.00, 699.00, 43, true, 'Fashion', 'Women', 'Leggings', '["XS", "S", "M", "L", "XL", "XXL"]', '18-45', 'https://via.placeholder.com/300x300?text=Leggings', 70),
  ('Sports Bra', 'High-support sports bra for active women.', 1299.00, 1999.00, 35, true, 'Fashion', 'Women', 'Bra', '["28", "30", "32", "34", "36", "38", "40", "42", "44", "45"]', '18-50', 'https://via.placeholder.com/300x300?text=Sports+Bra', 45),
  
  ('Kids T-Shirt', 'Soft and colorful t-shirts for kids.', 299.00, 499.00, 40, true, 'Fashion', 'Kids', 'T-Shirt', '["4Y", "6Y", "8Y", "10Y", "12Y", "14Y"]', '4-14', 'https://via.placeholder.com/300x300?text=Kids+TShirt', 80),
  ('Kids Jeans', 'Comfortable jeans designed for kids.', 599.00, 999.00, 40, true, 'Fashion', 'Kids', 'Jeans', '["22", "24", "26"]', '4-14', 'https://via.placeholder.com/300x300?text=Kids+Jeans', 50),
  ('Kids Dress', 'Beautiful and comfortable dresses for girls.', 699.00, 1299.00, 46, true, 'Fashion', 'Kids', 'Dress', '["4Y", "6Y", "8Y", "10Y", "12Y"]', '4-12', 'https://via.placeholder.com/300x300?text=Kids+Dress', 40)
ON CONFLICT DO NOTHING;
