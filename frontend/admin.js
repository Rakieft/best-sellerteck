import {
  applySavedTheme,
  bindThemeToggle,
  createProduct,
  deleteProduct,
  fetchAdminOrders,
  fetchAdminStats,
  fetchCategories,
  fetchCurrentUser,
  formatPrice,
  hydrateUserLabel,
  isAdminUser,
  isAuthenticated,
  requestJson,
  showToast,
  syncAdminLinks,
  updateAdminOrderStatus,
  updateProduct
} from './store.js';

const elements = {
  themeToggle: document.querySelector('#themeToggle'),
  accountLink: document.querySelector('#accountLink'),
  adminGate: document.querySelector('#adminGate'),
  adminGreeting: document.querySelector('#adminGreeting'),
  totalUsersStat: document.querySelector('#totalUsersStat'),
  totalProductsStat: document.querySelector('#totalProductsStat'),
  totalOrdersStat: document.querySelector('#totalOrdersStat'),
  revenueStat: document.querySelector('#revenueStat'),
  categorySelect: document.querySelector('#categorySelect'),
  productForm: document.querySelector('#productForm'),
  resetProductFormButton: document.querySelector('#resetProductFormButton'),
  adminProductsList: document.querySelector('#adminProductsList'),
  adminOrdersList: document.querySelector('#adminOrdersList'),
  toast: document.querySelector('#toast')
};

const state = {
  products: [],
  categories: [],
  orders: []
};

function setGate(message, show = true) {
  elements.adminGate.textContent = message;
  elements.adminGate.classList.toggle('hidden', !show);
}

function fillStats(stats) {
  elements.totalUsersStat.textContent = String(stats.totalUsers || 0);
  elements.totalProductsStat.textContent = String(stats.totalProducts || 0);
  elements.totalOrdersStat.textContent = String(stats.totalOrders || 0);
  elements.revenueStat.textContent = formatPrice(stats.revenue || 0);
}

function renderCategories() {
  elements.categorySelect.innerHTML = state.categories
    .map((category) => `<option value="${category.id}">${category.name}</option>`)
    .join('');
}

function resetProductForm() {
  elements.productForm.reset();
  elements.productForm.elements.product_id.value = '';
  if (elements.categorySelect.options.length) {
    elements.categorySelect.selectedIndex = 0;
  }
}

function productToPayload(formData) {
  return {
    category_id: Number(formData.category_id),
    name: formData.name,
    slug: formData.slug,
    brand: formData.brand,
    sku: formData.sku,
    short_description: formData.short_description || null,
    description: formData.description || null,
    price: Number(formData.price),
    sale_price: formData.sale_price ? Number(formData.sale_price) : null,
    stock_quantity: Number(formData.stock_quantity),
    image_url: formData.image_url || null,
    is_featured: Boolean(formData.is_featured),
    status: formData.status
  };
}

function populateProductForm(product) {
  const form = elements.productForm.elements;
  form.product_id.value = product.id;
  form.category_id.value = product.category_id;
  form.name.value = product.name;
  form.slug.value = product.slug;
  form.brand.value = product.brand;
  form.sku.value = product.sku;
  form.short_description.value = product.short_description || '';
  form.description.value = product.description || '';
  form.price.value = product.price;
  form.sale_price.value = product.sale_price || '';
  form.stock_quantity.value = product.stock_quantity;
  form.image_url.value = product.image_url || '';
  form.status.value = product.status;
  form.is_featured.checked = Boolean(product.is_featured);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderProducts() {
  if (!state.products.length) {
    elements.adminProductsList.innerHTML = '<p class="status-message">Aucun produit trouve.</p>';
    return;
  }

  elements.adminProductsList.innerHTML = state.products
    .map(
      (product) => `
        <article class="order-card">
          <div class="cart-item-row">
            <strong>${product.name}</strong>
            <span class="product-tag">${product.status}</span>
          </div>
          <div class="cart-item-row">
            <span>${product.brand} • Stock ${product.stock_quantity}</span>
            <strong>${formatPrice(product.sale_price || product.price)}</strong>
          </div>
          <div class="cart-item-row">
            <span>${product.category_name || 'Categorie'}</span>
            <div class="form-actions">
              <button class="secondary-button" type="button" data-edit-id="${product.id}">Modifier</button>
              <button class="ghost-button" type="button" data-delete-id="${product.id}">Supprimer</button>
            </div>
          </div>
        </article>
      `
    )
    .join('');

  elements.adminProductsList.querySelectorAll('[data-edit-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const product = state.products.find((item) => Number(item.id) === Number(button.dataset.editId));
      if (product) populateProductForm(product);
    });
  });

  elements.adminProductsList.querySelectorAll('[data-delete-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      await deleteProduct(Number(button.dataset.deleteId));
      showToast(elements.toast, 'Produit supprime');
      await loadProducts();
      await loadStats();
    });
  });
}

function renderOrders() {
  if (!state.orders.length) {
    elements.adminOrdersList.innerHTML = '<p class="status-message">Aucune commande pour le moment.</p>';
    return;
  }

  elements.adminOrdersList.innerHTML = state.orders
    .map(
      (order) => `
        <article class="order-card">
          <div class="cart-item-row">
            <strong>${order.order_number}</strong>
            <span class="product-tag">${order.status}</span>
          </div>
          <div class="cart-item-row">
            <span>${order.delivery_name} • ${order.payment_method}</span>
            <strong>${formatPrice(order.total_amount)}</strong>
          </div>
          <div class="admin-order-grid">
            <label>
              <span>Commande</span>
              <select data-order-status="${order.id}">
                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>pending</option>
                <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>confirmed</option>
                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>processing</option>
                <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>shipped</option>
                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>delivered</option>
                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>cancelled</option>
              </select>
            </label>
            <label>
              <span>Paiement</span>
              <select data-payment-status="${order.id}">
                <option value="pending" ${order.payment_status === 'pending' ? 'selected' : ''}>pending</option>
                <option value="authorized" ${order.payment_status === 'authorized' ? 'selected' : ''}>authorized</option>
                <option value="paid" ${order.payment_status === 'paid' ? 'selected' : ''}>paid</option>
                <option value="failed" ${order.payment_status === 'failed' ? 'selected' : ''}>failed</option>
                <option value="refunded" ${order.payment_status === 'refunded' ? 'selected' : ''}>refunded</option>
              </select>
            </label>
            <button class="primary-button" type="button" data-save-order="${order.id}">Mettre a jour</button>
          </div>
        </article>
      `
    )
    .join('');

  elements.adminOrdersList.querySelectorAll('[data-save-order]').forEach((button) => {
    button.addEventListener('click', async () => {
      const orderId = Number(button.dataset.saveOrder);
      const status = elements.adminOrdersList.querySelector(`[data-order-status="${orderId}"]`).value;
      const paymentStatus = elements.adminOrdersList.querySelector(`[data-payment-status="${orderId}"]`).value;
      await updateAdminOrderStatus(orderId, { status, payment_status: paymentStatus });
      showToast(elements.toast, 'Commande mise a jour');
      await loadOrders();
      await loadStats();
    });
  });
}

async function loadStats() {
  const stats = await fetchAdminStats();
  fillStats(stats);
}

async function loadProducts() {
  const response = await requestJson('/products?limit=100');
  state.products = response.rows || [];
  renderProducts();
}

async function loadOrders() {
  state.orders = await fetchAdminOrders();
  renderOrders();
}

async function bootstrap() {
  applySavedTheme();
  bindThemeToggle(elements.themeToggle);
  void hydrateUserLabel(elements.accountLink);

  if (!isAuthenticated()) {
    setGate('Connectez-vous avec un compte admin pour acceder au dashboard.');
    return;
  }

  let user;
  try {
    user = await fetchCurrentUser();
  } catch (error) {
    setGate("Impossible de verifier la session admin.");
    return;
  }

  syncAdminLinks([]);

  if (!isAdminUser(user)) {
    setGate("Votre compte n'a pas les droits admin.");
    return;
  }

  elements.adminGreeting.textContent = `Bonjour ${user.first_name || 'Admin'}`;
  setGate('', false);

  try {
    state.categories = await fetchCategories();
    renderCategories();
    await Promise.all([loadStats(), loadProducts(), loadOrders()]);
  } catch (error) {
    setGate("Impossible de charger les donnees admin pour le moment.");
    return;
  }

  elements.productForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(elements.productForm).entries());
    const payload = productToPayload(formData);

    try {
      if (formData.product_id) {
        await updateProduct(Number(formData.product_id), payload);
        showToast(elements.toast, 'Produit mis a jour');
      } else {
        await createProduct(payload);
        showToast(elements.toast, 'Produit ajoute');
      }
      resetProductForm();
      await loadProducts();
      await loadStats();
    } catch (error) {
      showToast(elements.toast, error.message || 'Operation produit impossible');
    }
  });

  elements.resetProductFormButton.addEventListener('click', resetProductForm);
}

bootstrap();
