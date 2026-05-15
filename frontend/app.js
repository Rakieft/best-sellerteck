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
  slugToLabel,
  syncAdminLinks
} from './store.js';

const state = {
  products: [],
  filteredProducts: [],
  categories: [],
  activeCategory: 'all',
  searchTerm: ''
};

const elements = {
  categoryGrid: document.querySelector('#categoryGrid'),
  categoryFilters: document.querySelector('#categoryFilters'),
  productGrid: document.querySelector('#productGrid'),
  statusMessage: document.querySelector('#statusMessage'),
  searchInput: document.querySelector('#searchInput'),
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
  themeToggle: document.querySelector('#themeToggle')
};

function renderCategoryHighlights() {
  elements.categoryGrid.innerHTML = state.categories
    .map((category) => {
      const title = category.name || slugToLabel(category.slug || 'collection');
      const description =
        category.description || 'Retrouvez une selection de produits utiles, populaires et faciles a comparer.';

      return `
        <article class="category-card">
          <span class="eyebrow">Rayon</span>
          <div>
            <strong>${title}</strong>
            <p>${description}</p>
          </div>
          <div class="category-card-actions">
            <button class="secondary-button category-jump" type="button" data-category="${category.slug}">
              Voir
            </button>
            <a class="ghost-button" href="./shop.html?category=${category.slug}">Parcourir</a>
          </div>
        </article>
      `;
    })
    .join('');

  elements.categoryGrid.querySelectorAll('.category-jump').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeCategory = button.dataset.category;
      renderFilters();
      applyFilters();
      document.querySelector('#catalog').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function renderFilters() {
  const filters = [{ slug: 'all', name: 'Tout voir' }, ...state.categories];

  elements.categoryFilters.innerHTML = filters
    .map(
      (filter) => `
        <button
          class="filter-chip ${state.activeCategory === filter.slug ? 'active' : ''}"
          type="button"
          data-category="${filter.slug}"
        >
          ${filter.name}
        </button>
      `
    )
    .join('');

  elements.categoryFilters.querySelectorAll('.filter-chip').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeCategory = button.dataset.category;
      renderFilters();
      applyFilters();
    });
  });
}

function renderProducts() {
  if (!state.filteredProducts.length) {
    elements.productGrid.innerHTML = '';
    elements.statusMessage.textContent = 'Aucun produit ne correspond a votre recherche pour le moment.';
    return;
  }

    elements.statusMessage.textContent = `${state.filteredProducts.length} produit(s) disponible(s)`;

  elements.productGrid.innerHTML = state.filteredProducts
    .map((product) => {
      const price = product.sale_price || product.price;
      const rating = Number(product.average_rating || 0).toFixed(1);
      return `
        <article class="product-card">
          <div class="product-card-top">
            <span class="product-category">${product.category_name || 'Electronics'}</span>
            ${Number(product.stock_quantity) > 0 ? '<span class="product-tag">En stock</span>' : '<span class="product-tag">Rupture</span>'}
          </div>
          <div>
            <h3>${product.name}</h3>
            <p>${product.short_description || 'Consultez les informations essentielles de ce produit avant de l ajouter a votre panier.'}</p>
          </div>
          <div class="product-meta">
            <strong class="product-price">${formatPrice(price)}</strong>
            <span class="product-rating">Note ${rating} / 5</span>
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
      `;
    })
    .join('');

  elements.productGrid.querySelectorAll('button[data-product-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      const product = state.products.find((item) => Number(item.id) === Number(button.dataset.productId));
      if (!product) return;
      if (!isAuthenticated()) {
        showToast(elements.toast, 'Connectez-vous pour retrouver votre panier et finaliser votre commande');
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

function findCategoryName(slug) {
  return state.categories.find((category) => category.slug === slug)?.name || '';
}

function applyFilters() {
  const term = state.searchTerm.trim().toLowerCase();

  state.filteredProducts = state.products.filter((product) => {
    const matchesCategory =
      state.activeCategory === 'all' ||
      String(product.category_name || '').toLowerCase() === String(findCategoryName(state.activeCategory)).toLowerCase() ||
      String(product.category_slug || '').toLowerCase() === state.activeCategory.toLowerCase();

    const haystack = [product.name, product.brand, product.short_description, product.category_name]
      .join(' ')
      .toLowerCase();

    return (!term || haystack.includes(term)) && matchesCategory;
  });

  renderProducts();
}

const cartController = renderCartDrawer({
  cartItemsElement: elements.cartItems,
  cartCountElement: elements.cartCount,
  cartTotalElement: elements.cartTotal,
  drawerElement: elements.cartDrawer,
  openButton: elements.openCartButton,
  closeButton: elements.closeCartButton,
  checkoutElement: elements.checkoutLink
});

async function bootstrap() {
  applySavedTheme();
  bindThemeToggle(elements.themeToggle);
  void hydrateUserLabel(elements.accountLink);
  syncAdminLinks(elements.adminLink);

  elements.searchInput.addEventListener('input', (event) => {
    state.searchTerm = event.target.value;
    applyFilters();
  });

  try {
    const [categoriesResponse, productsResponse] = await Promise.all([
      requestJson('/categories'),
      requestJson('/products')
    ]);

    state.categories = categoriesResponse.data || [];
    state.products = (productsResponse.rows || []).map((product) => ({
      ...product,
      category_slug: findCategorySlug(state.categories, product.category_name)
    }));

    renderCategoryHighlights();
    renderFilters();
    applyFilters();
  } catch (error) {
    elements.statusMessage.textContent =
      "Impossible d'afficher les produits pour le moment. Veuillez reessayer dans quelques instants.";
    elements.productGrid.innerHTML = '';
    elements.categoryGrid.innerHTML = `
      <article class="category-card">
        <span class="eyebrow">Indisponible pour le moment</span>
        <div>
          <strong>Produits temporairement indisponibles</strong>
          <p>Nous n'arrivons pas a charger les categories pour le moment. Veuillez revenir un peu plus tard.</p>
        </div>
      </article>
    `;
  }
}

bootstrap();
