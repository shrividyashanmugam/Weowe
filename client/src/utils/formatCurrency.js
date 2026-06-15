export const formatCurrency = (amount, currency = 'INR') => {
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }
  const symbol = symbols[currency] || '₹'
  return `${symbol}${Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}
