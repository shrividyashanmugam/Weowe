import { NavLink, useNavigate } from 'react-router-dom'
import { FiHome, FiGrid, FiPlusCircle, FiUsers, FiUser } from 'react-icons/fi'

export default function MobileBottomNav() {
  const navigate = useNavigate()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100
                    flex items-center justify-around px-4 py-2 z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
      {[
        { to:'/dashboard', icon:FiHome,  label:'Home'    },
        { to:'/groups',    icon:FiGrid,  label:'Groups'  },
      ].map(({ to, icon:Icon, label }) => (
        <NavLink key={to} to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all
             ${isActive ? 'text-primary' : 'text-gray-400'}`
          }>
          <Icon size={20} />
          <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
      ))}

      <button onClick={() => navigate('/add-expense')}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary
                         text-white flex items-center justify-center shadow-hover
                         -mt-6 border-4 border-wbg transition-transform active:scale-95">
        <FiPlusCircle size={26} />
      </button>

      {[
        { to:'/friends', icon:FiUsers, label:'Friends' },
        { to:'/profile', icon:FiUser,  label:'Profile' },
      ].map(({ to, icon:Icon, label }) => (
        <NavLink key={to} to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all
             ${isActive ? 'text-primary' : 'text-gray-400'}`
          }>
          <Icon size={20} />
          <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
