// KEBERA - Supabase Client (UMD CDN)
// Uses globals from: https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js

const SUPABASE_URL = (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_URL) || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_ANON_KEY) || 'your-anon-key-here';
const ADMIN_EMAIL = (window.APP_CONFIG && window.APP_CONFIG.ADMIN_EMAIL) || 'admin@kebera.com';

let _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return _supabase;
  }
  return null;
}

// ===== AUTH =====
async function signUp(email, password) {
  const sb = getSupabase();
  if (!sb) return { error: { message: 'Supabase not loaded' } };
  const { data, error } = await sb.auth.signUp({ email, password });
  return { data, error };
}

async function signIn(email, password) {
  const sb = getSupabase();
  if (!sb) return { error: { message: 'Supabase not loaded' } };
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  return { data, error };
}

async function signOut() {
  const sb = getSupabase();
  if (!sb) return;
  await sb.auth.signOut();
}

async function getSession() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session;
}

async function getUser() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user;
}

async function resetPassword(email) {
  const sb = getSupabase();
  if (!sb) return { error: { message: 'Supabase not loaded' } };
  const { data, error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: (window.APP_CONFIG && window.APP_CONFIG.SITE_URL || '') + '/admin/update-password.html'
  });
  return { data, error };
}

async function signInWithGoogle() {
  const sb = getSupabase();
  if (!sb) return { error: { message: 'Supabase not loaded' } };
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: (window.APP_CONFIG && window.APP_CONFIG.SITE_URL || '') + '/admin/dashboard.html'
    }
  });
  return { data, error };
}

async function isAdminEmail(email) {
  return email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

// ===== PRODUCTS (public) =====
async function loadProductsFromDB() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false });
  if (error) { console.error('Supabase error:', error); return null; }
  return data.map(p => ({
    id: p.id, name: p.name, category: p.category, price: p.price,
    currency: p.currency, image: p.image_url, description: p.description,
    sizes: p.sizes, colors: p.colors
  }));
}

async function loadSettingsFromDB() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('settings').select('*');
  if (error) return null;
  const settings = {};
  data.forEach(s => { settings[s.key] = s.value; });
  return settings;
}

async function placeOrder(orderData) {
  const sb = getSupabase();
  if (!sb) return { error: { message: 'Supabase not loaded' } };
  const user = await getUser();
  const { data, error } = await sb.from('orders').insert([{ ...orderData, user_id: user?.id || null }]).select();
  return { data, error };
}

// ===== ADMIN (auth required) =====
async function adminCreateProduct(product) {
  const sb = getSupabase();
  const { data, error } = await sb.from('products').insert([{
    name: product.name, category: product.category, price: product.price,
    currency: product.currency || 'LKR', image_url: product.image_url || '',
    description: product.description || '', sizes: product.sizes || ['S','M','L','XL'],
    colors: product.colors || ['#1a1a2e','#2d2d44']
  }]).select();
  return { data, error };
}

async function adminUpdateProduct(id, updates) {
  const sb = getSupabase();
  const { data, error } = await sb.from('products').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select();
  return { data, error };
}

async function adminDeleteProduct(id) {
  const sb = getSupabase();
  const { error } = await sb.from('products').delete().eq('id', id);
  return { error };
}

async function adminGetAllProducts() {
  const sb = getSupabase();
  const { data, error } = await sb.from('products').select('*').order('created_at', { ascending: false });
  return { data, error };
}

async function adminUpdateSetting(key, value) {
  const sb = getSupabase();
  const { data, error } = await sb.from('settings').upsert({ key, value, updated_at: new Date().toISOString() }).select();
  return { data, error };
}

async function adminGetAllSettings() {
  const sb = getSupabase();
  const { data, error } = await sb.from('settings').select('*');
  return { data, error };
}

async function adminGetOrders() {
  const sb = getSupabase();
  const { data, error } = await sb.from('orders').select('*').order('created_at', { ascending: false });
  return { data, error };
}

async function adminUpdateOrderStatus(id, status) {
  const sb = getSupabase();
  const { error } = await sb.from('orders').update({ status }).eq('id', id);
  return { error };
}

async function uploadFile(bucket, path, file) {
  const sb = getSupabase();
  const { data, error } = await sb.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) return { url: null, error };
  const { data: urlData } = sb.storage.from(bucket).getPublicUrl(path);
  return { url: urlData.publicUrl, error: null };
}
