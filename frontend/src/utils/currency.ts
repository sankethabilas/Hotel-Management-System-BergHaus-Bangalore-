// Currency utility functions for Sri Lankan Rupees
export const formatCurrency = (amount: number): string => {
  return `Rs ${amount.toFixed(2)}`
}

export const formatCurrencyWhole = (amount: number): string => {
  return `Rs ${amount.toFixed(0)}`
}

export const formatCurrencyWithCommas = (amount: number): string => {
  return `Rs ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
