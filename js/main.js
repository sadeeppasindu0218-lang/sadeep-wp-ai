document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  updateCartCount();
  initCheckoutForm();
});

function initNavigation() {
  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  toggle?.addEventListener('click', () => {
    navLinks?.classList.toggle('open');
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks?.classList.remove('open');
    });
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const href = link.getAttribute('href');
    if (href === path) {
      link.classList.add('active');
    }
  });
}

function initCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const total = getCartTotal();
    const cart = getCart();

    if (cart.length === 0) {
      showToast('Your cart is empty');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Processing...';
    btn.disabled = true;

    const getVal = (id) => document.getElementById(id)?.value || '';

    const orderData = {
      customer_name: getVal('firstName') + ' ' + getVal('lastName'),
      email: getVal('email'),
      phone: getVal('phone'),
      address: {
        street: getVal('address'),
        city: getVal('city'),
        postalCode: getVal('postalCode'),
        country: getVal('country')
      },
      items: cart,
      total: total,
      currency: 'LKR',
      status: 'pending'
    };

    if (typeof placeOrder === 'function') {
      const { error } = await placeOrder(orderData);
      if (error) console.warn('Order DB save failed:', error);
    }

    localStorage.removeItem('kebera_cart');
    updateCartCount();

    form.innerHTML = `
      <div style="text-align:center;padding:60px 20px">
        <div style="font-size:48px;margin-bottom:16px">✨</div>
        <h2 style="margin-bottom:12px">Order Confirmed!</h2>
        <p style="color:var(--text-secondary);margin-bottom:24px">
          Thank you ${getVal('firstName') || 'Valued Customer'}. Your KEBERA order (Rs. ${total.toLocaleString()}) has been placed.
        </p>
        <a href="shop.html" class="glass-button">Continue Shopping</a>
      </div>
    `;
  });
}
