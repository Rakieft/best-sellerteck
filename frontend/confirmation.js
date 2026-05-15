import {
  applySavedTheme,
  bindThemeToggle,
  fetchOrderById,
  formatPrice,
  hydrateUserLabel,
  isAuthenticated,
  syncAdminLinks
} from './store.js';

const orderId = new URLSearchParams(window.location.search).get('id');

const elements = {
  themeToggle: document.querySelector('#themeToggle'),
  adminLink: document.querySelector('#adminLink'),
  accountLink: document.querySelector('#accountLink'),
  confirmationGate: document.querySelector('#confirmationGate'),
  confirmationHero: document.querySelector('#confirmationHero'),
  confirmationItems: document.querySelector('#confirmationItems'),
  confirmationDelivery: document.querySelector('#confirmationDelivery')
};

function setGate(message, show = true) {
  elements.confirmationGate.textContent = message;
  elements.confirmationGate.classList.toggle('hidden', !show);
}

function renderOrder(order) {
  elements.confirmationHero.innerHTML = `
    <strong>${order.order_number}</strong>
    <p>Statut: ${order.status} • Paiement: ${order.payment_method}</p>
    <p>Total: ${formatPrice(order.total_amount)}</p>
  `;

  elements.confirmationItems.innerHTML = (order.items || [])
    .map(
      (item) => `
        <article class="cart-item">
          <div class="cart-item-row">
            <strong>${item.product_name}</strong>
            <span>${item.quantity}x</span>
          </div>
          <div class="cart-item-row">
            <span>${formatPrice(item.unit_price)}</span>
            <strong>${formatPrice(item.line_total)}</strong>
          </div>
        </article>
      `
    )
    .join('');

  elements.confirmationDelivery.innerHTML = `
    <div class="profile-item">
      <span class="summary-label">Client</span>
      <strong>${order.delivery_name}</strong>
    </div>
    <div class="profile-item">
      <span class="summary-label">Telephone</span>
      <strong>${order.delivery_phone}</strong>
    </div>
    <div class="profile-item">
      <span class="summary-label">Email</span>
      <strong>${order.delivery_email}</strong>
    </div>
    <div class="profile-item">
      <span class="summary-label">Adresse</span>
      <strong>${order.delivery_address}, ${order.delivery_city}</strong>
    </div>
  `;
}

async function bootstrap() {
  applySavedTheme();
  bindThemeToggle(elements.themeToggle);
  void hydrateUserLabel(elements.accountLink);
  syncAdminLinks(elements.adminLink);

  if (!isAuthenticated()) {
    setGate('Connectez-vous pour consulter les details de votre commande.');
    return;
  }

  if (!orderId) {
    setGate('Aucune commande n a ete selectionnee.');
    return;
  }

  try {
    const order = await fetchOrderById(orderId);
    renderOrder(order);
    setGate('', false);
  } catch (error) {
    setGate("Impossible d'afficher le recapitulatif de cette commande pour le moment.");
  }
}

bootstrap();
