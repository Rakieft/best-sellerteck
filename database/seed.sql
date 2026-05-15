USE best_sellerteck;

INSERT INTO categories (name, slug, description) VALUES
('Smartphones', 'smartphones', 'Latest smartphones from trusted global brands.'),
('Laptops', 'laptops', 'Reliable laptops for work, study and gaming.'),
('Televisions', 'televisions', 'Premium TVs and home entertainment displays.')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
VALUES ('Admin', 'BestSellerTeck', 'admin@best-sellerteck.ht', '+50900000000', '$2a$12$/8k.jPyiai6Z55xO0H0Qf.Duxdwq3DqFttaj1BcenT9Ji/wHqqlDe', 'admin')
ON DUPLICATE KEY UPDATE role = VALUES(role);

INSERT INTO admins (user_id, access_level)
SELECT id, 'super_admin' FROM users WHERE email = 'admin@best-sellerteck.ht'
ON DUPLICATE KEY UPDATE access_level = VALUES(access_level);

INSERT INTO products (category_id, name, slug, brand, sku, short_description, description, price, sale_price, stock_quantity, image_url, is_featured, status)
SELECT c.id, 'iPhone 15 Pro', 'iphone-15-pro', 'Apple', 'APL-IP15PRO', 'Flagship Apple smartphone', 'Premium smartphone tuned for power users in Haiti.', 129999.00, 119999.00, 12, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', 1, 'active'
FROM categories c WHERE c.slug = 'smartphones'
ON DUPLICATE KEY UPDATE price = VALUES(price), sale_price = VALUES(sale_price), stock_quantity = VALUES(stock_quantity);
