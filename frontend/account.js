import {
  applySavedTheme,
  bindThemeToggle,
  fetchCurrentUser,
  fetchOrders,
  formatPrice,
  hydrateUserLabel,
  isAuthenticated,
  logout,
  showToast,
  syncAdminLinks
} from './store.js';

const elements = {
  themeToggle: document.querySelector('#themeToggle'),
  adminLink: document.querySelector('#adminLink'),
  accountLink: document.querySelector('#accountLink'),
  logoutButton: document.querySelector('#logoutButton'),
  accountGate: document.querySelector('#accountGate'),
  profileCard: document.querySelector('#profileCard'),
  ordersList: document.querySelector('#ordersList'),
  toast: document.querySelector('#toast')
};

function setGate(message, show = true) {
  elements.accountGate.textContent = message;
  elements.accountGate.classList.toggle('hidden', !show);
}

function renderProfile(user) {
  elements.profileCard.innerHTML = `
    <div class="profile-item">
      <span class="summary-label">Nom</span>
      <strong>${user.first_name || ''} ${user.last_name || ''}</strong>
    </div>
    <div class="profile-item">
      <span class="summary-label">Email</span>
      <strong>${user.email || ''}</strong>
    </div>
    <div class="profile-item">
      <span class="summary-label">Telephone</span>
      <strong>${user.phone || 'Non renseigne'}</strong>
    </div>
    <div class="profile-item">
      <span class="summary-label">Role</span>
      <strong>${user.role || 'client'}</strong>
    </div>
  `;
}

function renderOrders(orders) {
  if (!orders.length) {
    elements.ordersList.innerHTML = '<p class="status-message">Vous n avez pas encore passe de commande. Vos prochaines commandes apparaitront ici.</p>';
    return;
  }

  elements.ordersList.innerHTML = orders
    .map(
      (order) => `
        <article class="order-card">
          <div class="cart-item-row">
            <strong>${order.order_number}</strong>
            <span class="product-tag">${order.status}</span>
          </div>
          <div class="cart-item-row">
            <span>${order.payment_method}</span>
            <strong>${formatPrice(order.total_amount)}</strong>
          </div>
          <div class="cart-item-row">
            <span>${new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
            <a class="secondary-button" href="./confirmation.html?id=${order.id}">Voir les details</a>
          </div>
        </article>
      `
    )
    .join('');
}

async function bootstrap() {
  applySavedTheme();
  bindThemeToggle(elements.themeToggle);
  void hydrateUserLabel(elements.accountLink);
  syncAdminLinks(elements.adminLink);

  if (!isAuthenticated()) {
    setGate('Connectez-vous pour consulter vos informations et suivre vos commandes plus facilement.');
    elements.profileCard.innerHTML = '<a class="primary-button" href="./auth.html">Se connecter</a>';
    return;
  }

  try {
    const [user, orders] = await Promise.all([fetchCurrentUser(), fetchOrders()]);
    renderProfile(user);
    renderOrders(orders);
    setGate('', false);
  } catch (error) {
    setGate("Impossible d'afficher votre espace client pour le moment.");
  }

  elements.logoutButton.addEventListener('click', async () => {
    await logout();
    showToast(elements.toast, 'Vous avez bien ete deconnecte');
    window.setTimeout(() => {
      window.location.href = './auth.html';
    }, 700);
  });
}

bootstrap();
