const API_BASE_URL = `${window.location.origin}/api/v1`;
const FALLBACK_API_BASE_URL = 'http://localhost:5001/api/v1';
const STORAGE_KEYS = {
  theme: 'bst-theme',
  token: 'bst-token',
  user: 'bst-user'
};

const runtime = {
  usingFallbackApi: false
};

export function formatPrice(value) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'HTG',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export function slugToLabel(slug) {
  return String(slug || '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getTheme() {
  return localStorage.getItem(STORAGE_KEYS.theme) || 'light';
}

export function applySavedTheme() {
  document.body.dataset.theme = getTheme();
}

export function toggleTheme() {
  const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = nextTheme;
  localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
  return nextTheme;
}

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.token) || '';
}

export function saveSession({ token, user }) {
  localStorage.setItem(STORAGE_KEYS.token, token);
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || 'null');
  } catch (error) {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export async function requestJson(path, options = {}) {
  const targets = runtime.usingFallbackApi
    ? [FALLBACK_API_BASE_URL]
    : [API_BASE_URL, FALLBACK_API_BASE_URL];

  let lastError = null;

  for (const baseUrl of targets) {
    try {
      const headers = new Headers(options.headers || {});
      if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
      }

      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers
      });
      if (!response.ok) {
        let payload = null;
        try {
          payload = await response.json();
        } catch (error) {
          payload = null;
        }
        const message = payload?.message || `HTTP ${response.status}`;
        const requestError = new Error(message);
        requestError.status = response.status;
        requestError.payload = payload;
        throw requestError;
      }

      if (baseUrl === FALLBACK_API_BASE_URL) {
        runtime.usingFallbackApi = true;
      }

      return await response.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export function findCategorySlug(categories, categoryName) {
  return categories.find((category) => category.name === categoryName)?.slug || '';
}

export async function login(credentials) {
  const response = await requestJson('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  saveSession({ token: response.token, user: response.user });
  return response;
}

export async function registerAccount(payload) {
  const response = await requestJson('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  saveSession({ token: response.token, user: response.user });
  return response;
}

export async function fetchCurrentUser() {
  const response = await requestJson('/auth/me');
  if (response?.data) {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(response.data));
  }
  return response.data;
}

export async function logout() {
  try {
    await requestJson('/auth/logout', { method: 'POST' });
  } finally {
    clearSession();
  }
}

export async function fetchCart() {
  const response = await requestJson('/cart');
  return response.data;
}

export async function addCartItem(productId, quantity = 1) {
  const response = await requestJson('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity })
  });
  return response.data;
}

export async function removeCartItem(itemId) {
  const response = await requestJson(`/cart/items/${itemId}`, {
    method: 'DELETE'
  });
  return response.data;
}

export async function fetchPaymentOptions() {
  const response = await requestJson('/orders/payment-options');
  return response.data || [];
}

export async function fetchCategories() {
  const response = await requestJson('/categories');
  return response.data || [];
}

export async function createOrder(payload) {
  const response = await requestJson('/orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return response.data;
}

export async function fetchOrders() {
  const response = await requestJson('/orders');
  return response.data || [];
}

export async function fetchOrderById(orderId) {
  const response = await requestJson(`/orders/${orderId}`);
  return response.data;
}

export async function fetchAdminStats() {
  const response = await requestJson('/admin/stats');
  return response.data;
}

export async function fetchAdminOrders() {
  const response = await requestJson('/admin/orders');
  return response.data || [];
}

export async function updateAdminOrderStatus(orderId, payload) {
  const response = await requestJson(`/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return response.data;
}

export async function createProduct(payload) {
  const response = await requestJson('/products', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return response.data;
}

export async function updateProduct(productId, payload) {
  const response = await requestJson(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  return response.data;
}

export async function deleteProduct(productId) {
  const response = await requestJson(`/products/${productId}`, {
    method: 'DELETE'
  });
  return response;
}

export function getCartSummary(cartState) {
  const items = cartState?.items || [];
  return {
    count: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    total: Number(cartState?.total || 0)
  };
}

export function showToast(element, message) {
  if (!element) return;
  element.textContent = message;
  element.classList.add('visible');
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    element.classList.remove('visible');
  }, 2200);
}

export function bindThemeToggle(button) {
  if (!button) return;
  const themeButtonMarkup = (theme) => `
    <svg class="ui-icon" aria-hidden="true">
      <use href="./icons.svg#${theme === 'dark' ? 'icon-sun' : 'icon-moon'}"></use>
    </svg>
    <span>${theme === 'dark' ? 'Theme jour' : 'Theme nuit'}</span>
  `;

  const syncLabel = () => {
    button.innerHTML = themeButtonMarkup(document.body.dataset.theme);
  };

  syncLabel();
  button.addEventListener('click', () => {
    toggleTheme();
    syncLabel();
  });
}

export async function hydrateUserLabel(accountElement) {
  if (!accountElement) return;

  if (!isAuthenticated()) {
    accountElement.textContent = 'Connexion';
    accountElement.setAttribute('href', './auth.html');
    return;
  }

  const storedUser = getStoredUser();
  if (storedUser?.first_name) {
    accountElement.textContent = storedUser.first_name;
    accountElement.setAttribute('href', './account.html');
  }

  try {
    const user = await fetchCurrentUser();
    accountElement.textContent = user.first_name || 'Mon compte';
    accountElement.setAttribute('href', './account.html');
  } catch (error) {
    clearSession();
    accountElement.textContent = 'Connexion';
    accountElement.setAttribute('href', './auth.html');
  }
}

export function isAdminUser(user = getStoredUser()) {
  return user?.role === 'admin';
}

export function syncAdminLinks(adminElements, user = getStoredUser()) {
  const visible = isAdminUser(user);
  (Array.isArray(adminElements) ? adminElements : [adminElements]).forEach((element) => {
    if (!element) return;
    element.classList.toggle('hidden', !visible);
  });
}

export function renderCartDrawer({
  cartItemsElement,
  cartCountElement,
  cartTotalElement,
  drawerElement,
  openButton,
  closeButton,
  checkoutElement,
  accountRequiredMarkup = '<p class="status-message">Connectez-vous pour utiliser votre panier synchronise.</p>'
}) {
  const syncCart = async () => {
    if (!isAuthenticated()) {
      if (cartCountElement) {
        cartCountElement.textContent = '0';
      }
      if (cartTotalElement) {
        cartTotalElement.textContent = formatPrice(0);
      }
      if (cartItemsElement) {
        cartItemsElement.innerHTML = `${accountRequiredMarkup}<a class="primary-button full-width" href="./auth.html">Se connecter</a>`;
      }
      if (checkoutElement) {
        checkoutElement.setAttribute('href', './auth.html');
        checkoutElement.textContent = 'Se connecter';
      }
      return;
    }

    let cartState;
    try {
      cartState = await fetchCart();
    } catch (error) {
      if (error.status === 401) {
        clearSession();
      }
      if (cartItemsElement) {
        cartItemsElement.innerHTML = '<p class="status-message">Impossible de charger le panier pour le moment.</p>';
      }
      return;
    }

    const summary = getCartSummary(cartState);

    if (cartCountElement) {
      cartCountElement.textContent = String(summary.count);
    }

    if (cartTotalElement) {
      cartTotalElement.textContent = formatPrice(summary.total);
    }

    if (checkoutElement) {
      checkoutElement.setAttribute('href', './checkout.html');
        checkoutElement.textContent = 'Passer au paiement';
    }

    if (!cartItemsElement) {
      return;
    }

    if (!cartState.items.length) {
      cartItemsElement.innerHTML = '<p class="status-message">Votre panier est vide pour le moment.</p>';
      return;
    }

    cartItemsElement.innerHTML = cartState.items
      .map(
        (item) => `
          <article class="cart-item">
            <div class="cart-item-row">
              <strong>${item.name}</strong>
              <button class="ghost-button" type="button" data-remove-id="${item.id}">Retirer</button>
            </div>
            <div class="cart-item-row">
              <span>Quantite ${item.quantity}</span>
              <strong>${formatPrice(item.line_total)}</strong>
            </div>
          </article>
        `
      )
      .join('');

    cartItemsElement.querySelectorAll('[data-remove-id]').forEach((button) => {
      button.addEventListener('click', async () => {
        await removeCartItem(Number(button.dataset.removeId));
        await syncCart();
      });
    });
  };

  const openDrawer = () => {
    if (!drawerElement) return;
    drawerElement.classList.add('open');
    drawerElement.setAttribute('aria-hidden', 'false');
  };

  const closeDrawer = () => {
    if (!drawerElement) return;
    drawerElement.classList.remove('open');
    drawerElement.setAttribute('aria-hidden', 'true');
  };

  openButton?.addEventListener('click', openDrawer);
  closeButton?.addEventListener('click', closeDrawer);

  void syncCart();

  return { syncCart, openDrawer, closeDrawer };
}
