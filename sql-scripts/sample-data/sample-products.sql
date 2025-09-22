-- Sample Products for IoT Hub
-- Run this in your Supabase SQL Editor to populate the products table

-- First, clear existing products (optional)
-- DELETE FROM products;

-- Insert sample IoT components
INSERT INTO products (name, description, price, category, subcategory, image_url, stock_quantity, product_type, brand, rating, created_at, updated_at) VALUES
-- Microcontrollers
('Arduino Uno R3', 'Official Arduino Uno R3 microcontroller board with USB cable and documentation. Perfect for beginners and professionals.', 599, 'iot_components', 'microcontrollers', 'https://images.unsplash.com/photo-1553406830-ef2513450d76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 45, 'physical', 'Arduino', 4.5, NOW(), NOW()),

('ESP32 Development Board', 'ESP32 WiFi + Bluetooth development board with dual-core processor and GPIO pins. Ideal for IoT projects.', 899, 'iot_components', 'microcontrollers', 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 32, 'physical', 'Espressif', 4.7, NOW(), NOW()),

('Raspberry Pi 4 Model B', 'Latest Raspberry Pi 4 with 4GB RAM, dual-band WiFi, Bluetooth 5.0, and Gigabit Ethernet. Perfect for advanced projects.', 3499, 'iot_components', 'microcontrollers', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 18, 'physical', 'Raspberry Pi Foundation', 4.8, NOW(), NOW()),

-- Sensors
('DHT22 Temperature & Humidity Sensor', 'High-precision digital temperature and humidity sensor with single-wire interface. Ideal for weather monitoring.', 249, 'iot_components', 'sensors', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 67, 'physical', 'Adafruit', 4.3, NOW(), NOW()),

('HC-SR04 Ultrasonic Sensor', 'Ultrasonic distance measurement sensor with 2-400cm range. Perfect for obstacle detection and robotics.', 149, 'iot_components', 'sensors', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 89, 'physical', 'Generic', 4.2, NOW(), NOW()),

('MQ-2 Gas Sensor', 'Sensitive gas sensor for detecting LPG, propane, hydrogen, methane, alcohol, and smoke. Great for safety applications.', 199, 'iot_components', 'sensors', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 54, 'physical', 'Generic', 4.1, NOW(), NOW()),

-- Single Board Computers
('Arduino Mega 2560', 'Arduino Mega with 54 digital pins, 16 analog inputs, and 4 UARTs. Perfect for complex projects requiring more I/O.', 1299, 'iot_components', 'microcontrollers', 'https://images.unsplash.com/photo-1553406830-ef2513450d76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 23, 'physical', 'Arduino', 4.6, NOW(), NOW()),

-- Actuators
('SG90 Servo Motor', 'Micro servo motor with 180-degree rotation. Ideal for robotics and automation projects.', 89, 'iot_components', 'actuators', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 156, 'physical', 'Tower Pro', 4.4, NOW(), NOW()),

('DC Motor with Encoder', 'High-quality DC motor with built-in encoder for precise speed and position control.', 399, 'iot_components', 'actuators', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 41, 'physical', 'Generic', 4.3, NOW(), NOW()),

-- Digital Projects
('Smart Home Automation System', 'Complete IoT-based home automation system with mobile app control, voice commands, and scheduling features.', 2999, 'digital_projects', 'home_automation', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 999, 'digital_project', 'IoT Hub', 4.7, NOW(), NOW()),

('Weather Monitoring Station', 'Real-time weather monitoring system with data logging, web dashboard, and mobile notifications.', 1899, 'digital_projects', 'monitoring', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 999, 'digital_project', 'IoT Hub', 4.5, NOW(), NOW()),

('IoT Security Camera System', 'Wireless IP camera system with motion detection, night vision, and cloud storage integration.', 2499, 'digital_projects', 'security', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 999, 'digital_project', 'IoT Hub', 4.6, NOW(), NOW());

-- Verify the products were inserted
SELECT 
  id,
  name,
  price,
  category,
  subcategory,
  stock_quantity,
  product_type,
  brand,
  rating,
  created_at
FROM products 
ORDER BY created_at DESC;
