import {
  applySavedTheme,
  bindThemeToggle,
  getStoredUser,
  hydrateUserLabel,
  login,
  registerAccount,
  showToast,
  syncAdminLinks
} from './store.js';

const elements = {
  themeToggle: document.querySelector('#themeToggle'),
  adminLink: document.querySelector('#adminLink'),
  accountLink: document.querySelector('#accountLink'),
  loginForm: document.querySelector('#loginForm'),
  registerForm: document.querySelector('#registerForm'),
  toast: document.querySelector('#toast')
};

function formToObject(formElement) {
  return Object.fromEntries(new FormData(formElement).entries());
}

async function bootstrap() {
  applySavedTheme();
  bindThemeToggle(elements.themeToggle);
  void hydrateUserLabel(elements.accountLink);
  syncAdminLinks(elements.adminLink);

  const storedUser = getStoredUser();
  if (storedUser?.email) {
    showToast(elements.toast, `Vous etes deja connecte en tant que ${storedUser.first_name || storedUser.email}`);
  }

  elements.loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await login(formToObject(elements.loginForm));
      showToast(elements.toast, 'Connexion reussie. Vous pouvez maintenant retrouver votre panier.');
      window.setTimeout(() => {
        window.location.href = './shop.html';
      }, 700);
    } catch (error) {
      showToast(elements.toast, error.message || 'Impossible de vous connecter pour le moment');
    }
  });

  elements.registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await registerAccount(formToObject(elements.registerForm));
      showToast(elements.toast, 'Votre compte a bien ete cree');
      window.setTimeout(() => {
        window.location.href = './shop.html';
      }, 700);
    } catch (error) {
      showToast(elements.toast, error.message || 'Impossible de creer votre compte pour le moment');
    }
  });
}

bootstrap();
