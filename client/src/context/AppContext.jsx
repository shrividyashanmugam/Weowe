import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }

export function AppProvider({ children }) {
  const [currency, setCurrency] = useState('INR')
  const [theme,    setTheme]    = useState(() =>
    localStorage.getItem('weoowe_theme') || 'light'
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('weoowe_theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  const formatAmount = (amount) => {
    const symbol = CURRENCY_SYMBOLS[currency] || '₹'
    return `${symbol}${Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }

  return (
    <AppContext.Provider value={{ currency, setCurrency, theme, toggleTheme, formatAmount, currencySymbol: CURRENCY_SYMBOLS[currency] }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
