import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AppLayout from '../components/layout/AppLayout.jsx'
import LoginPage          from '../pages/auth/LoginPage.jsx'
import RegisterPage       from '../pages/auth/RegisterPage.jsx'
import DashboardPage      from '../pages/DashboardPage.jsx'
import FriendsPage        from '../pages/FriendsPage.jsx'
import GroupsPage         from '../pages/GroupsPage.jsx'
import GroupDetailPage    from '../pages/GroupDetailPage.jsx'
import AddExpensePage     from '../pages/AddExpensePage.jsx'
import ExpenseHistoryPage from '../pages/ExpenseHistoryPage.jsx'
import SettlementPage     from '../pages/SettlementPage.jsx'
import ReportsPage        from '../pages/ReportsPage.jsx'
import NotificationsPage  from '../pages/NotificationsPage.jsx'
import ProfilePage        from '../pages/ProfilePage.jsx'
import SettingsPage       from '../pages/SettingsPage.jsx'
import PremiumPage        from '../pages/PremiumPage.jsx'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index                  element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"       element={<DashboardPage />} />
          <Route path="friends"         element={<FriendsPage />} />
          <Route path="groups"          element={<GroupsPage />} />
          <Route path="groups/:id"      element={<GroupDetailPage />} />
          <Route path="add-expense"     element={<AddExpensePage />} />
          <Route path="expenses"        element={<ExpenseHistoryPage />} />
          <Route path="settlements"     element={<SettlementPage />} />
          <Route path="reports"         element={<ReportsPage />} />
          <Route path="notifications"   element={<NotificationsPage />} />
          <Route path="profile"         element={<ProfilePage />} />
          <Route path="settings"        element={<SettingsPage />} />
          <Route path="premium"         element={<PremiumPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
