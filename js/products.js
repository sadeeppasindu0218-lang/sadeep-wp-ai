let products = [];

async function loadProducts() {
  try {
    const res = await fetch('data/products.json');
    products = await res.json();
    return products;
  } catch {
    return [];
  }
}

function renderProducts(productsToRender, containerId = 'products-grid') {
  const grid = document.getElementById(containerId);
  if (!grid) return;

  grid.innerHTML = productsToRender.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <div class="product-actions">
          <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart(${p.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            Add to Cart
          </button>
          <button class="btn-view" onclick="event.stopPropagation(); window.location='product.html?id=${p.id}'">Quick View</button>
        </div>
      </div>
      <div class="product-info" onclick="window.location='product.html?id=${p.id}'">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price">Rs. ${p.price.toLocaleString()}</div>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location = `product.html?id=${card.dataset.id}`;
    });
  });
}

function filterProducts(category) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`.filter-btn[data-category="${category}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  const filtered = category === 'all' ? products : products.filter(p => p.category === category);
  renderProducts(filtered);
}
