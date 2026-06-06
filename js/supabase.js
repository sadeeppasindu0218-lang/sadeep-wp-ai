// KEBERA - Supabase Client Configuration
// Edit config.js with your Supabase project details
const SUPABASE_URL = (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_URL) || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_ANON_KEY) || 'your-anon-key-here';

// Initialize Supabase client
let supabaseClient = null;

async function initSupabase() {
  if (supabaseClient) return supabaseClient;
  
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseClient;
  } catch (e) {
    // Fallback: load from products.json
    return null;
  }
}

// ===== PRODUCTS =====
async function loadProductsFromDB() {
  const supabase = await initSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    return null;
  }

  return data.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    currency: p.currency,
    image: p.image_url,
    description: p.description,
    sizes: p.sizes,
    colors: p.colors
  }));
}

async function loadSettingsFromDB() {
  const supabase = await initSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('settings')
    .select('*');

  if (error) return null;

  const settings = {};
  data.forEach(s => { settings[s.key] = s.value; });
  return settings;
}

// ===== ADMIN =====
async function adminLogin(email, password) {
  const supabase = await initSupabase();
  if (!supabase) return { error: 'Supabase not configured' };

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { user: data.user, session: data.session };
}

async function adminLogout() {
  const supabase = await initSupabase();
  if (supabase) await supabase.auth.signOut();
}

async function getAdminSession() {
  const supabase = await initSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Admin: CRUD Products
async function adminCreateProduct(product) {
  const supabase = await initSupabase();
  const { data, error } = await supabase.from('products').insert([{
    name: product.name,
    category: product.category,
    price: product.price,
    currency: product.currency || 'LKR',
    image_url: product.image_url || '',
    description: product.description || '',
    sizes: product.sizes || ['S','M','L','XL'],
    colors: product.colors || ['#1a1a2e','#2d2d44']
  }]).select();
  return { data, error };
}

async function adminUpdateProduct(id, updates) {
  const supabase = await initSupabase();
  const { data, error } = await supabase.from('products').update({
    ...updates,
    updated_at: new Date().toISOString()
  }).eq('id', id).select();
  return { data, error };
}

async function adminDeleteProduct(id) {
  const supabase = await initSupabase();
  const { error } = await supabase.from('products').delete().eq('id', id);
  return { error };
}

async function adminGetAllProducts() {
  const supabase = await initSupabase();
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  return { data, error };
}

// Admin: Settings
async function adminUpdateSetting(key, value) {
  const supabase = await initSupabase();
  const { data, error } = await supabase.from('settings').upsert({
    key, value,
    updated_at: new Date().toISOString()
  }).select();
  return { data, error };
}

async function adminGetAllSettings() {
  const supabase = await initSupabase();
  const { data, error } = await supabase.from('settings').select('*');
  return { data, error };
}

// Admin: Orders
async function adminGetOrders() {
  const supabase = await initSupabase();
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  return { data, error };
}

async function adminUpdateOrderStatus(id, status) {
  const supabase = await initSupabase();
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  return { error };
}

// File upload to Supabase Storage
async function uploadFile(bucket, path, file) {
  const supabase = await initSupabase();
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });
  if (error) return { url: null, error };
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: urlData.publicUrl, error: null };
}

// Place order (public)
async function placeOrder(orderData) {
  const supabase = await initSupabase();
  if (!supabase) return { error: 'Checkout unavailable' };
  const { data, error } = await supabase.from('orders').insert([orderData]).select();
  return { data, error };
}
