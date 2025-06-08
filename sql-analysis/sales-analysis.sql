-- Create and populate the orders table
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    customer TEXT,
    amount REAL,
    order_date DATE
);

INSERT INTO orders (customer, amount, order_date) VALUES
('Alice', 5000, '2024-03-01'),
('Bob', 8000, '2024-03-05'),
('Alice', 3000, '2024-03-15'),
('Charlie', 7000, '2024-02-20'),
('Alice', 10000, '2024-02-28'),
('Bob', 4000, '2024-02-10'),
('Charlie', 9000, '2024-03-22'),
('Alice', 2000, '2024-03-30');

-- Query 1: Calculate total sales volume for March 2024
SELECT 
    SUM(amount) as total_sales_march
FROM 
    orders
WHERE 
    strftime('%Y-%m', order_date) = '2024-03';

-- Query 2: Find the customer who spent the most overall
SELECT 
    customer,
    SUM(amount) as total_spent
FROM 
    orders
GROUP BY 
    customer
ORDER BY 
    total_spent DESC
LIMIT 1;

-- Query 3: Calculate the average order value
SELECT 
    AVG(amount) as average_order_value
FROM 
    orders; 
