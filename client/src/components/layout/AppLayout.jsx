import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar  from './Topbar.jsx'
import MobileBottomNav from './MobileBottomNav.jsx'

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-wbg">
      <div className="hidden lg:block w-64 flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>

      <MobileBottomNav />
    </div>
  )
}
