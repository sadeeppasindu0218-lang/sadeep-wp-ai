-- KEBERA Fashion - Supabase Schema + Security Policies
-- Run this in Supabase SQL Editor

-- === TABLES ===
CREATE TABLE IF NOT EXISTS public.products (
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

CREATE TABLE IF NOT EXISTS public.settings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
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

-- Add user_id column if table already existed without it
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- === DEFAULT SETTINGS ===
INSERT INTO public.settings (key, value) VALUES
  ('site_name', '{"text":"KEBERA"}'),
  ('hero_title', '{"text":"KEBERA","highlight":"Redefine Fashion"}'),
  ('hero_subtitle', '{"text":"A/W 2026 Collection"}'),
  ('hero_description', '{"text":"Where avant-garde design meets timeless elegance."}'),
  ('about_title', '{"text":"Defining the New Luxury"}'),
  ('about_text', '{"text":"Founded in 2024, KEBERA represents a new wave of fashion."}'),
  ('logo_url', '{"url":""}'),
  ('favicon_url', '{"url":""}'),
  ('admin_email', '{"text":"sadeeppasindu0218@gmail.com"}')
ON CONFLICT (key) DO NOTHING;

-- === ENABLE RLS ===
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- === SECURITY POLICIES ===

-- Helper: check if authenticated user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.settings
    WHERE key = 'admin_email'
    AND value ->> 'text' = auth.jwt() ->> 'email'
  );
$$;

-- PRODUCTS: anyone can view active products
DROP POLICY IF EXISTS "products_public_select" ON public.products;
CREATE POLICY "products_public_select" ON public.products
  FOR SELECT USING (is_active = true);

-- PRODUCTS: only admin can modify
DROP POLICY IF EXISTS "products_admin_all" ON public.products;
CREATE POLICY "products_admin_all" ON public.products
  FOR ALL USING (public.is_admin());

-- SETTINGS: anyone can read
DROP POLICY IF EXISTS "settings_public_select" ON public.settings;
CREATE POLICY "settings_public_select" ON public.settings
  FOR SELECT USING (true);

-- SETTINGS: only admin can modify
DROP POLICY IF EXISTS "settings_admin_all" ON public.settings;
CREATE POLICY "settings_admin_all" ON public.settings
  FOR ALL USING (public.is_admin());

-- ORDERS: users can see their own orders
DROP POLICY IF EXISTS "orders_user_select" ON public.orders;
CREATE POLICY "orders_user_select" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- ORDERS: authenticated users can insert their own order
DROP POLICY IF EXISTS "orders_user_insert" ON public.orders;
CREATE POLICY "orders_user_insert" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ORDERS: admin can see/modify all orders
DROP POLICY IF EXISTS "orders_admin_all" ON public.orders;
CREATE POLICY "orders_admin_all" ON public.orders
  FOR ALL USING (public.is_admin());

-- === STORAGE ===
-- Create bucket (run in Storage > New Bucket > kebera-assets > public)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kebera-assets', 'kebera-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public to read files
DROP POLICY IF EXISTS "storage_public_select" ON storage.objects;
CREATE POLICY "storage_public_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'kebera-assets');

-- Allow admin to upload/delete files
DROP POLICY IF EXISTS "storage_admin_insert" ON storage.objects;
CREATE POLICY "storage_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'kebera-assets'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "storage_admin_delete" ON storage.objects;
CREATE POLICY "storage_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'kebera-assets'
    AND auth.role() = 'authenticated'
  );
