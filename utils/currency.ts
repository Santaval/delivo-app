const getCurrencySymbol = (currencyCode: string) => {
  switch (currencyCode) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'CRC':
      return '₡';
    default:
      return currencyCode;
  }
};

const formatCurrency = (amount: number, currencyCode: string) => {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toFixed(2)}`;
};

export { formatCurrency, getCurrencySymbol };

