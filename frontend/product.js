import {
  addCartItem,
  applySavedTheme,
  bindThemeToggle,
  formatPrice,
  hydrateUserLabel,
  isAuthenticated,
  renderCartDrawer,
  requestJson,
  showToast,
  syncAdminLinks
} from './store.js';

const productId = new URLSearchParams(window.location.search).get('id');

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
  productStatus: document.querySelector('#productStatus'),
  productDetail: document.querySelector('#productDetail'),
  productName: document.querySelector('#productName'),
  productShortDescription: document.querySelector('#productShortDescription'),
  productBrandHero: document.querySelector('#productBrandHero'),
  productCategory: document.querySelector('#productCategory'),
  productTitle: document.querySelector('#productTitle'),
  productDescription: document.querySelector('#productDescription'),
  productPrice: document.querySelector('#productPrice'),
  productBrand: document.querySelector('#productBrand'),
  productStock: document.querySelector('#productStock'),
  productReviewsCount: document.querySelector('#productReviewsCount'),
  quantityInput: document.querySelector('#quantityInput'),
  addToCartButton: document.querySelector('#addToCartButton'),
  reviewsGrid: document.querySelector('#reviewsGrid')
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

function renderReviews(reviews = []) {
  if (!reviews.length) {
    elements.reviewsGrid.innerHTML = `
      <article class="testimonial-card">
        <p>Les avis des clients s'afficheront ici des qu'ils seront disponibles.</p>
        <strong>Aucun avis pour le moment</strong>
      </article>
    `;
    return;
  }

  elements.reviewsGrid.innerHTML = reviews
    .map(
      (review) => `
        <article class="testimonial-card">
          <p>${review.comment || 'Avis client sans commentaire detaille.'}</p>
          <strong>${review.first_name || 'Client'} ${review.last_name || ''} • ${review.rating}/5</strong>
        </article>
      `
    )
    .join('');
}

function stockLabel(product) {
  if (Number(product.stock_quantity) <= 0) {
    return 'Rupture';
  }

  if (Number(product.stock_quantity) <= 5) {
    return `${product.stock_quantity} unite(s) restantes`;
  }

  return `${product.stock_quantity} unite(s) disponibles`;
}

async function bootstrap() {
  applySavedTheme();
  bindThemeToggle(elements.themeToggle);
  void hydrateUserLabel(elements.accountLink);
  syncAdminLinks(elements.adminLink);

  if (!productId) {
    elements.productStatus.textContent = 'Aucun produit n a ete selectionne. Retournez au catalogue pour continuer.';
    return;
  }

  try {
    const response = await requestJson(`/products/${productId}`);
    const product = response.data;

    elements.productStatus.classList.add('hidden');
    elements.productDetail.classList.remove('hidden');
    elements.productName.textContent = product.name;
    elements.productShortDescription.textContent =
      product.short_description || 'Consultez les informations importantes de ce produit avant de commander.';
    elements.productBrandHero.textContent = product.brand || 'Marque disponible';
    elements.productCategory.textContent = product.category_name || 'Electronics';
    elements.productTitle.textContent = product.name;
    elements.productDescription.textContent =
      product.description || product.short_description || 'Retrouvez ici les informations utiles pour mieux comprendre ce produit avant votre achat.';
    elements.productPrice.textContent = formatPrice(product.sale_price || product.price);
    elements.productBrand.textContent = product.brand || 'Non specifiee';
    elements.productStock.textContent = stockLabel(product);
    elements.productReviewsCount.textContent = `${product.review_count || 0} avis`;
    renderReviews(product.reviews || []);

    elements.addToCartButton.addEventListener('click', async () => {
      if (!isAuthenticated()) {
        showToast(elements.toast, 'Connectez-vous pour retrouver votre panier et finaliser votre commande');
        window.setTimeout(() => {
          window.location.href = './auth.html';
        }, 700);
        return;
      }

      const quantity = Math.max(1, Number(elements.quantityInput.value || 1));
      await addCartItem(product.id, quantity);
      await cartController.syncCart();
      showToast(elements.toast, `${product.name} a bien ete ajoute a votre panier`);
    });
  } catch (error) {
    elements.productStatus.textContent = "Impossible d'afficher cette fiche produit pour le moment.";
  }
}

bootstrap();
