import {
  addCartItem,
  applySavedTheme,
  bindThemeToggle,
  findCategorySlug,
  formatPrice,
  hydrateUserLabel,
  isAuthenticated,
  renderCartDrawer,
  requestJson,
  showToast,
  syncAdminLinks
} from './store.js';

const state = {
  products: [],
  filteredProducts: [],
  categories: [],
  activeCategory: new URLSearchParams(window.location.search).get('category') || 'all',
  activeBrand: 'all',
  searchTerm: '',
  maxPrice: 200000,
  sort: 'latest',
  currentPage: 1,
  pageSize: 6
};

const elements = {
  themeToggle: document.querySelector('#themeToggle'),
  cartCount: document.querySelector('#cartCount'),
  cartItems: document.querySelector('#cartItems'),
  cartTotal: document.querySelector('#cartTotal'),
  cartDrawer: document.querySelector('#cartDrawer'),
  openCartButton: document.querySelector('#openCartButton'),
  closeCartButton: document.querySelector('#closeCartButton'),
  checkoutLink: document.querySelector('#checkoutLink'),
  accountLink: document.querySelector('#accountLink'),
  adminLink: document.querySelector('#adminLink'),
  toast: document.querySelector('#toast'),
  searchInput: document.querySelector('#searchInput'),
  categoryFilters: document.querySelector('#categoryFilters'),
  brandFilters: document.querySelector('#brandFilters'),
  priceRange: document.querySelector('#priceRange'),
  priceValue: document.querySelector('#priceValue'),
  sortSelect: document.querySelector('#sortSelect'),
  resetFiltersButton: document.querySelector('#resetFiltersButton'),
  productGrid: document.querySelector('#productGrid'),
  statusMessage: document.querySelector('#statusMessage'),
  pageIndicator: document.querySelector('#pageIndicator'),
  prevPageButton: document.querySelector('#prevPageButton'),
  nextPageButton: document.querySelector('#nextPageButton'),
  catalogCount: document.querySelector('#catalogCount')
};

const cartController = renderCartDrawer({
  cartItemsElement: elements.cartItems,
  cartCountElement: elements.cartCount,
  cartTotalElement: elements.cartTotal,
  drawerElement: elements.cartDrawer,
  openButton: elements.openCartButton,
  closeButton: elements.closeCartButton,
  checkoutElement: elements.checkoutLink
});

function renderFilterGroup(element, values, activeValue, type) {
  element.innerHTML = values
    .map(
      (value) => `
        <button class="filter-chip ${value.slug === activeValue ? 'active' : ''}" type="button" data-type="${type}" data-value="${value.slug}">
          ${value.name}
        </button>
      `
    )
    .join('');
}

function sortProducts(products) {
  const sorted = [...products];
  if (state.sort === 'price_asc') {
    sorted.sort((a, b) => Number(a.sale_price || a.price) - Number(b.sale_price || b.price));
  } else if (state.sort === 'price_desc') {
    sorted.sort((a, b) => Number(b.sale_price || b.price) - Number(a.sale_price || a.price));
  } else if (state.sort === 'rating_desc') {
    sorted.sort((a, b) => Number(b.average_rating || 0) - Number(a.average_rating || 0));
  }
  return sorted;
}

function renderProducts() {
  const totalPages = Math.max(1, Math.ceil(state.filteredProducts.length / state.pageSize));
  state.currentPage = Math.min(state.currentPage, totalPages);
  const start = (state.currentPage - 1) * state.pageSize;
  const pageItems = state.filteredProducts.slice(start, start + state.pageSize);

  elements.pageIndicator.textContent = `Page ${state.currentPage} / ${totalPages}`;
  elements.prevPageButton.disabled = state.currentPage === 1;
  elements.nextPageButton.disabled = state.currentPage === totalPages;
  elements.catalogCount.textContent = `${state.filteredProducts.length} produit(s)`;

  if (!pageItems.length) {
    elements.statusMessage.textContent = 'Aucun produit ne correspond a vos filtres actuels. Essayez de modifier la categorie, la marque ou le budget.';
    elements.productGrid.innerHTML = '';
    return;
  }

  elements.statusMessage.textContent = `${state.filteredProducts.length} produit(s) trouve(s)`;

  elements.productGrid.innerHTML = pageItems
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-card-top">
            <span class="product-category">${product.category_name}</span>
            <span class="product-tag">${Number(product.stock_quantity) > 0 ? 'Disponible' : 'Rupture'}</span>
          </div>
          <div>
            <h3>${product.name}</h3>
            <p>${product.short_description || 'Verifiez rapidement les points importants de ce produit avant de l ajouter au panier.'}</p>
          </div>
          <div class="product-meta">
            <strong class="product-price">${formatPrice(product.sale_price || product.price)}</strong>
            <span class="product-rating">Note ${Number(product.average_rating || 0).toFixed(1)}</span>
          </div>
          <div class="product-footer">
            <span>${product.brand}</span>
            <span>${product.review_count || 0} avis</span>
          </div>
          <div class="product-actions">
            <a class="secondary-button" href="./product.html?id=${product.id}">Voir le detail</a>
            <button type="button" data-product-id="${product.id}">Ajouter au panier</button>
          </div>
        </article>
      `
    )
    .join('');

  elements.productGrid.querySelectorAll('button[data-product-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      const product = state.products.find((item) => Number(item.id) === Number(button.dataset.productId));
      if (!product) return;
      if (!isAuthenticated()) {
        showToast(elements.toast, 'Connectez-vous pour retrouver votre panier, sauvegarder vos choix et poursuivre votre achat');
        window.setTimeout(() => {
          window.location.href = './auth.html';
        }, 700);
        return;
      }
      await addCartItem(product.id, 1);
      await cartController.syncCart();
      showToast(elements.toast, `${product.name} a bien ete ajoute a votre panier`);
    });
  });
}

function applyFilters() {
  const term = state.searchTerm.trim().toLowerCase();

  const nextProducts = state.products.filter((product) => {
    const price = Number(product.sale_price || product.price || 0);
    const matchesCategory = state.activeCategory === 'all' || product.category_slug === state.activeCategory;
    const matchesBrand = state.activeBrand === 'all' || product.brand_slug === state.activeBrand;
    const haystack = [product.name, product.brand, product.short_description, product.category_name].join(' ').toLowerCase();
    const matchesSearch = !term || haystack.includes(term);
    const matchesPrice = price <= state.maxPrice;

    return matchesCategory && matchesBrand && matchesSearch && matchesPrice;
  });

  state.filteredProducts = sortProducts(nextProducts);
  state.currentPage = 1;
  renderProducts();
}

function bindFilterInteractions() {
  document.querySelectorAll('[data-type="category"]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeCategory = button.dataset.value;
      renderFilters();
      applyFilters();
    });
  });

  document.querySelectorAll('[data-type="brand"]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeBrand = button.dataset.value;
      renderFilters();
      applyFilters();
    });
  });
}

function renderFilters() {
  renderFilterGroup(
    elements.categoryFilters,
    [{ slug: 'all', name: 'Tous les rayons' }, ...state.categories.map((category) => ({ slug: category.slug, name: category.name }))],
    state.activeCategory,
    'category'
  );

  const brands = [...new Set(state.products.map((product) => product.brand).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map((brand) => ({ slug: brand.toLowerCase(), name: brand }));

  renderFilterGroup(
    elements.brandFilters,
    [{ slug: 'all', name: 'Toutes les marques' }, ...brands],
    state.activeBrand,
    'brand'
  );

  bindFilterInteractions();
}

async function bootstrap() {
  applySavedTheme();
  bindThemeToggle(elements.themeToggle);
  void hydrateUserLabel(elements.accountLink);
  syncAdminLinks(elements.adminLink);

  elements.searchInput.addEventListener('input', (event) => {
    state.searchTerm = event.target.value;
    applyFilters();
  });

  elements.priceRange.addEventListener('input', (event) => {
    state.maxPrice = Number(event.target.value);
    elements.priceValue.textContent = formatPrice(state.maxPrice);
    applyFilters();
  });

  elements.sortSelect.addEventListener('change', (event) => {
    state.sort = event.target.value;
    state.filteredProducts = sortProducts(state.filteredProducts);
    renderProducts();
  });

  elements.resetFiltersButton.addEventListener('click', () => {
    state.activeCategory = 'all';
    state.activeBrand = 'all';
    state.searchTerm = '';
    state.maxPrice = 200000;
    state.sort = 'latest';
    elements.searchInput.value = '';
    elements.priceRange.value = '200000';
    elements.priceValue.textContent = formatPrice(200000);
    elements.sortSelect.value = 'latest';
    renderFilters();
    applyFilters();
  });

  elements.prevPageButton.addEventListener('click', () => {
    state.currentPage = Math.max(1, state.currentPage - 1);
    renderProducts();
  });

  elements.nextPageButton.addEventListener('click', () => {
    const totalPages = Math.max(1, Math.ceil(state.filteredProducts.length / state.pageSize));
    state.currentPage = Math.min(totalPages, state.currentPage + 1);
    renderProducts();
  });

  elements.priceValue.textContent = formatPrice(state.maxPrice);

  try {
    const [categoriesResponse, productsResponse] = await Promise.all([
      requestJson('/categories'),
      requestJson('/products?limit=100')
    ]);

    state.categories = categoriesResponse.data || [];
    state.products = (productsResponse.rows || []).map((product) => ({
      ...product,
      category_slug: findCategorySlug(state.categories, product.category_name),
      brand_slug: String(product.brand || '').toLowerCase()
    }));

    renderFilters();
    applyFilters();
  } catch (error) {
    elements.statusMessage.textContent = "Impossible d'afficher le catalogue pour le moment. Veuillez reessayer dans quelques instants.";
  }
}

bootstrap();
