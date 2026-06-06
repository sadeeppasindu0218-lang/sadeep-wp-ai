-- KEBERA Fashion - Supabase Database Schema
-- Run this in your Supabase project SQL editor

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'uncategorized',
  price INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'LKR',
  image_url TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  sizes JSONB NOT NULL DEFAULT '["S","M","L","XL"]'::jsonb,
  colors JSONB NOT NULL DEFAULT '["#1a1a2e","#2d2d44"]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Site settings table (logo, hero text, etc)
CREATE TABLE IF NOT EXISTS settings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  address JSONB NOT NULL DEFAULT '{}'::jsonb,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'LKR',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('site_name', '{"text":"KEBERA"}'),
  ('hero_title', '{"text":"KEBERA","highlight":"Redefine Fashion"}'),
  ('hero_subtitle', '{"text":"A/W 2026 Collection"}'),
  ('hero_description', '{"text":"Where avant-garde design meets timeless elegance. Discover the new silhouette of modern luxury."}'),
  ('about_title', '{"text":"Defining the New Luxury"}'),
  ('about_text', '{"text":"Founded in 2024, KEBERA represents a new wave of fashion."}'),
  ('logo_url', '{"url":""}'),
  ('favicon_url', '{"url":""}')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Public can read active products
CREATE POLICY "Public read products"
  ON products FOR SELECT
  USING (is_active = true);

-- Public can read settings
CREATE POLICY "Public read settings"
  ON settings FOR SELECT
  USING (true);

-- Only authenticated admin can write
CREATE POLICY "Admin all products"
  ON products FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin all settings"
  ON settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin all orders"
  ON orders FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Public can create orders (checkout)
CREATE POLICY "Public insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);
