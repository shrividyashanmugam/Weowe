import { useLocation, useNavigate } from 'react-router-dom'
import { FiBell, FiSearch } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { useState } from 'react'

const PAGE_TITLES = {
  '/dashboard':    'Dashboard',
  '/friends':      'Friends',
  '/groups':       'Groups',
  '/add-expense':  'Add Expense',
  '/expenses':     'Expense History',
  '/settlements':  'Settlements',
  '/reports':      'Reports & Analytics',
  '/notifications':'Notifications',
  '/profile':      'My Profile',
  '/settings':     'Settings',
  '/premium':      'Premium',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const { currencySymbol, currency } = useApp()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)

  const basePath = '/' + pathname.split('/').filter(Boolean).slice(0, 1).join('/')
  const title = PAGE_TITLES[pathname] || PAGE_TITLES[basePath] || 'WeOwe'
  const avatarUrl = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`

  return (
    <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-3 flex items-center justify-between shadow-sm">
      <h2 className="font-display font-semibold text-gray-800 text-lg">{title}</h2>

      <div className="flex items-center gap-3">
        <button className="hidden sm:flex items-center gap-1.5 bg-wbg text-primary
                            text-sm font-semibold px-3 py-1.5 rounded-full border border-primary/20
                            hover:bg-primary/10 transition-colors">
          {currencySymbol} {currency}
        </button>

        <button className="p-2 text-gray-400 hover:text-primary hover:bg-wbg rounded-xl transition-colors">
          <FiSearch size={18} />
        </button>

        <button onClick={() => navigate('/notifications')}
                className="relative p-2 text-gray-400 hover:text-primary hover:bg-wbg rounded-xl transition-colors">
          <FiBell size={18} />
        </button>

        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)}
                  className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/20">
            <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-hover
                            border border-gray-100 py-2 w-44 z-50">
              <button onClick={() => { navigate('/profile'); setShowDropdown(false) }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-wbg transition-colors">
                My Profile
              </button>
              <button onClick={() => { navigate('/settings'); setShowDropdown(false) }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-wbg transition-colors">
                Settings
              </button>
              <hr className="my-1 border-gray-100" />
              <button onClick={() => { logout(); navigate('/login'); setShowDropdown(false) }}
                      className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 transition-colors">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
