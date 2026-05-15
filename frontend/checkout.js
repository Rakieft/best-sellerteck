import {
  applySavedTheme,
  bindThemeToggle,
  createOrder,
  fetchCart,
  fetchPaymentOptions,
  formatPrice,
  getStoredUser,
  hydrateUserLabel,
  isAuthenticated,
  showToast,
  syncAdminLinks
} from './store.js';

const elements = {
  themeToggle: document.querySelector('#themeToggle'),
  accountLink: document.querySelector('#accountLink'),
  adminLink: document.querySelector('#adminLink'),
  checkoutGate: document.querySelector('#checkoutGate'),
  checkoutForm: document.querySelector('#checkoutForm'),
  paymentOptions: document.querySelector('#paymentOptions'),
  checkoutItems: document.querySelector('#checkoutItems'),
  subtotalValue: document.querySelector('#subtotalValue'),
  shippingValue: document.querySelector('#shippingValue'),
  grandTotalValue: document.querySelector('#grandTotalValue'),
  checkoutCartCount: document.querySelector('#checkoutCartCount'),
  toast: document.querySelector('#toast')
};

function setGateMessage(message, show = true) {
  elements.checkoutGate.textContent = message;
  elements.checkoutGate.classList.toggle('hidden', !show);
}

function renderCartSummary(cartState) {
  const items = cartState?.items || [];
  const subtotal = Number(cartState?.total || 0);
  const shippingFee = subtotal >= 50000 ? 0 : subtotal > 0 ? 1500 : 0;
  const grandTotal = subtotal + shippingFee;

  elements.checkoutCartCount.textContent = `${items.length} article(s)`;
  elements.subtotalValue.textContent = formatPrice(subtotal);
  elements.shippingValue.textContent = formatPrice(shippingFee);
  elements.grandTotalValue.textContent = formatPrice(grandTotal);

  if (!items.length) {
    elements.checkoutItems.innerHTML = '<p class="status-message">Votre panier est vide pour le moment.</p>';
    return;
  }

  elements.checkoutItems.innerHTML = items
    .map(
      (item) => `
        <article class="cart-item">
          <div class="cart-item-row">
            <strong>${item.name}</strong>
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
}

function renderPaymentOptions(options) {
  elements.paymentOptions.innerHTML = options
    .map(
      (option, index) => `
        <label class="payment-option">
          <input type="radio" name="payment_method" value="${option.key}" ${index === 0 ? 'checked' : ''} />
          <span>
            <strong>${option.label}</strong>
            <small>${option.enabled ? 'Disponible pour cette commande' : 'Bientot disponible'}</small>
          </span>
        </label>
      `
    )
    .join('');
}

function prefillUserData() {
  const user = getStoredUser();
  if (!user) return;

  elements.checkoutForm.elements.delivery_name.value = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  elements.checkoutForm.elements.delivery_email.value = user.email || '';
  elements.checkoutForm.elements.delivery_phone.value = user.phone || '';
}

async function bootstrap() {
  applySavedTheme();
  bindThemeToggle(elements.themeToggle);
  void hydrateUserLabel(elements.accountLink);
  syncAdminLinks(elements.adminLink);

  if (!isAuthenticated()) {
    setGateMessage('Connectez-vous pour verifier votre panier et finaliser votre commande en toute securite.');
    elements.checkoutForm.classList.add('hidden');
    return;
  }

  try {
    const [cartState, paymentOptions] = await Promise.all([fetchCart(), fetchPaymentOptions()]);
    renderCartSummary(cartState);
    renderPaymentOptions(paymentOptions);
    prefillUserData();

    if (!cartState.items.length) {
      setGateMessage('Votre panier est vide. Ajoutez un produit avant de passer a la confirmation.');
    } else {
      setGateMessage('', false);
    }
  } catch (error) {
    setGateMessage("Impossible d'afficher le recapitulatif de votre commande pour le moment.");
    elements.checkoutForm.classList.add('hidden');
    return;
  }

  elements.checkoutForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(elements.checkoutForm).entries());

    try {
      const order = await createOrder(payload);
      showToast(elements.toast, `Votre commande ${order.order_number} a bien ete enregistree`);
      window.setTimeout(() => {
        window.location.href = `./confirmation.html?id=${order.id}`;
      }, 1000);
    } catch (error) {
      showToast(elements.toast, error.message || 'Nous n avons pas pu confirmer votre commande pour le moment. Veuillez reessayer.');
    }
  });
}

bootstrap();
