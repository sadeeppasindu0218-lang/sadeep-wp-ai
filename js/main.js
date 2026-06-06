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

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const total = getCartTotal();

    if (getCart().length === 0) {
      showToast('Your cart is empty');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Processing...';
    btn.disabled = true;

    setTimeout(() => {
      localStorage.removeItem('kebera_cart');
      updateCartCount();
      form.innerHTML = `
        <div style="text-align:center;padding:60px 20px">
          <div style="font-size:48px;margin-bottom:16px">✨</div>
          <h2 style="margin-bottom:12px">Order Confirmed!</h2>
          <p style="color:var(--text-secondary);margin-bottom:24px">
            Thank you ${document.getElementById('name')?.value || 'Valued Customer'}. Your KEBERA order (Rs. ${total.toLocaleString()}) has been placed.
          </p>
          <a href="shop.html" class="glass-button">Continue Shopping</a>
        </div>
      `;
    }, 2000);
  });
}
