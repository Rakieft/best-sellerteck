const paymentProviders = {
  moncash: { key: 'moncash', label: 'MonCash', enabled: false },
  natcash: { key: 'natcash', label: 'NatCash', enabled: false },
  paypal: { key: 'paypal', label: 'PayPal', enabled: false },
  card: { key: 'card', label: 'Bank Card', enabled: false }
};

const getPaymentProvider = (provider) => paymentProviders[provider] || null;
const listPaymentProviders = () => Object.values(paymentProviders);

module.exports = { getPaymentProvider, listPaymentProviders };
