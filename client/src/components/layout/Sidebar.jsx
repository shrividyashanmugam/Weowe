import { NavLink, useNavigate } from 'react-router-dom'
import { FiHome, FiUsers, FiGrid, FiPlusCircle, FiList,
         FiArrowRightCircle, FiBarChart2, FiBell, FiUser,
         FiSettings, FiStar, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext.jsx'

const navItems = [
  { to:'/dashboard',    icon: FiHome,             label:'Dashboard'       },
  { to:'/friends',      icon: FiUsers,            label:'Friends'         },
  { to:'/groups',       icon: FiGrid,             label:'Groups'          },
  { to:'/add-expense',  icon: FiPlusCircle,       label:'Add Expense'     },
  { to:'/expenses',     icon: FiList,             label:'Expense History' },
  { to:'/settlements',  icon: FiArrowRightCircle, label:'Settlements'     },
  { to:'/reports',      icon: FiBarChart2,        label:'Reports'         },
]

const bottomItems = [
  { to:'/notifications', icon: FiBell,     label:'Notifications' },
  { to:'/profile',       icon: FiUser,     label:'Profile'       },
  { to:'/settings',      icon: FiSettings, label:'Settings'      },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const avatarUrl = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`

  const handleLogout = async () => { await logout(); navigate('/login') }

  return (
    <div className="h-full flex flex-col"
         style={{ background: 'linear-gradient(180deg, #1A6B6B 0%, #0f4a4a 100%)' }}>

      <div className="p-6 border-b border-white/10">
        <h1 className="font-display font-bold text-white text-xl">💰 WeOwe</h1>
        <p className="text-white/50 text-xs mt-0.5">Split Expenses, Not Friendships</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }>
            <Icon size={18} />
            <span className="font-body text-sm font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 space-y-1 border-t border-white/10">
        {bottomItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            <span className="font-body text-sm">{label}</span>
          </NavLink>
        ))}

        <NavLink to="/premium"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          style={{ color: '#FDCB6E' }}>
          <FiStar size={18} />
          <span className="font-body text-sm font-semibold">Premium</span>
        </NavLink>
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <img src={avatarUrl} alt={user?.name}
               className="w-9 h-9 rounded-full object-cover bg-white/20" />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium font-display truncate">{user?.name}</p>
            <p className="text-white/50 text-xs truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout}
                  className="text-white/60 hover:text-white transition-colors p-1"
                  title="Logout">
            <FiLogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
