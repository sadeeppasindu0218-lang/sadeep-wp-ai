function getCart() {
  return JSON.parse(localStorage.getItem('kebera_cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('kebera_cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

function addToCart(productId) {
  const cart = getCart();
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    const product = products.find(p => p.id === productId);
    if (product) {
      cart.push({ id: productId, qty: 1, name: product.name, price: product.price, image: product.image });
    }
  }

  saveCart(cart);
  showToast(`${productId ? products.find(p => p.id === productId)?.name || 'Item' : 'Item'} added to cart`);
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
  renderCartPage();
}

function updateQuantity(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      removeFromCart(productId);
      return;
    }
    saveCart(cart);
    renderCartPage();
  }
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCartPage() {
  const container = document.getElementById('cart-container');
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <a href="shop.html" class="glass-button">Shop Collection</a>
      </div>
    `;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item glass">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">Rs. ${item.price.toLocaleString()}</div>
      </div>
      <div class="cart-item-actions">
        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
        <span class="cart-qty">${item.qty}</span>
        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
        <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
      </div>
    </div>
  `).join('');

  const total = getCartTotal();
  const summary = document.getElementById('cart-summary');
  if (summary) {
    summary.innerHTML = `
      <div class="cart-summary-row">
        <span>Subtotal</span>
        <span>Rs. ${total.toLocaleString()}</span>
      </div>
      <div class="cart-summary-row">
        <span>Shipping</span>
        <span>Calculated at checkout</span>
      </div>
      <div class="cart-summary-total">
        <span>Total</span>
        <span>Rs. ${total.toLocaleString()}</span>
      </div>
      <a href="checkout.html" class="glass-button" style="width:100%;justify-content:center;margin-top:20px">
        Proceed to Checkout
      </a>
    `;
  }
}

function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
    ${message}
  `;
  Object.assign(toast.style, {
    position: 'fixed', bottom: '24px', right: '24px', zIndex: '9999',
    padding: '14px 24px', borderRadius: '12px',
    background: 'rgba(192,132,252,0.15)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(192,132,252,0.2)',
    color: '#f0ebe3', fontSize: '14px', fontWeight: '500',
    display: 'flex', alignItems: 'center', gap: '10px',
    transform: 'translateY(20px)', opacity: '0',
    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  });
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}
