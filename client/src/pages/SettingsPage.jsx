import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useApp } from '../context/AppContext.jsx'
import { userService } from '../services/userService.js'
import Button from '../components/ui/Button.jsx'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'currency', label: 'Currency & Region' },
  { id: 'language', label: 'Language' },
  { id: 'privacy', label: 'Privacy' },
]

const CURRENCIES = [
  { id: 'INR', label: '₹ INR — Indian Rupee' },
  { id: 'USD', label: '$ USD — US Dollar' },
  { id: 'EUR', label: '€ EUR — Euro' },
  { id: 'GBP', label: '£ GBP — British Pound' },
]

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const { theme, toggleTheme, currency, setCurrency } = useApp()
  const [category, setCategory] = useState('appearance')
  const [prefs, setPrefs] = useState(user?.notificationPrefs || {})
  const [privacy, setPrivacy] = useState(user?.privacy || { groupAddPolicy: 'friends', balanceVisibility: 'friends' })

  const saveUser = async (updates) => {
    try {
      const res = await userService.updateProfile(updates)
      updateUser(res.data.data)
      toast.success('Settings saved!')
    } catch {
      toast.error('Failed to save settings')
    }
  }

  const handleCurrencyChange = (c) => {
    setCurrency(c)
    saveUser({ currency: c })
  }

  const handlePrefToggle = (key) => {
    const updated = { ...prefs, [key]: !prefs[key] }
    setPrefs(updated)
    saveUser({ notificationPrefs: updated })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="card p-4 space-y-1">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${category === c.id ? 'bg-primary text-white' : 'text-gray-600 hover:bg-wbg'}`}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="lg:col-span-3 card">
        {category === 'appearance' && (
          <div>
            <h3 className="font-display font-semibold text-gray-800 mb-4">Appearance</h3>
            <div className="flex items-center justify-between p-4 bg-wbg rounded-2xl">
              <div>
                <p className="font-medium text-sm">Theme</p>
                <p className="text-xs text-gray-500">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
              </div>
              <button onClick={() => { toggleTheme(); saveUser({ theme: theme === 'light' ? 'dark' : 'light' }) }}
                      className={`w-14 h-8 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-gray-300'}`}>
                <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform mx-1
                  ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        )}

        {category === 'notifications' && (
          <div>
            <h3 className="font-display font-semibold text-gray-800 mb-4">Notifications</h3>
            <div className="space-y-3">
              {[
                { key: 'newExpense', label: 'New Expense Alerts' },
                { key: 'payment', label: 'Payment Reminders' },
                { key: 'groupInvite', label: 'Group Invites' },
                { key: 'weeklySummary', label: 'Weekly Summary' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-wbg rounded-2xl">
                  <span className="text-sm font-medium">{item.label}</span>
                  <button onClick={() => handlePrefToggle(item.key)}
                          className={`w-12 h-7 rounded-full transition-colors ${prefs[item.key] ? 'bg-primary' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-1
                      ${prefs[item.key] ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {category === 'currency' && (
          <div>
            <h3 className="font-display font-semibold text-gray-800 mb-4">Currency & Region</h3>
            <div className="space-y-2">
              {CURRENCIES.map(c => (
                <button key={c.id} onClick={() => handleCurrencyChange(c.id)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all
                          ${currency === c.id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary/30'}`}>
                  <span className="font-medium text-sm">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {category === 'language' && (
          <div>
            <h3 className="font-display font-semibold text-gray-800 mb-4">Language</h3>
            <div className="space-y-2">
              {['English', 'Tamil', 'Hindi'].map(lang => (
                <div key={lang} className={`p-4 rounded-2xl border-2 ${lang === 'English' ? 'border-primary bg-primary/5' : 'border-gray-100'}`}>
                  <span className="font-medium text-sm">{lang}</span>
                  {lang !== 'English' && <span className="text-xs text-gray-400 ml-2">Coming soon</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {category === 'privacy' && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-gray-800">Privacy</h3>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Who can add me to groups</label>
              <select className="input-field" value={privacy.groupAddPolicy}
                      onChange={e => setPrivacy(p => ({ ...p, groupAddPolicy: e.target.value }))}>
                <option value="anyone">Anyone</option>
                <option value="friends">Friends only</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Show my balance to</label>
              <select className="input-field" value={privacy.balanceVisibility}
                      onChange={e => setPrivacy(p => ({ ...p, balanceVisibility: e.target.value }))}>
                <option value="everyone">Everyone</option>
                <option value="friends">Friends only</option>
                <option value="none">No one</option>
              </select>
            </div>
            <Button onClick={() => saveUser({ privacy })}>Save Privacy Settings</Button>
          </div>
        )}
      </div>
    </div>
  )
}
