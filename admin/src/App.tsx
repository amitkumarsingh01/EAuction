import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './auth/Login'
import Register from './auth/Register'
import DashboardLayout from './layout/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Users from './pages/users/Users'
import UserDetail from './pages/users/UserDetail'
import Contests from './pages/contests/Contests'
import CreateContest from './pages/contests/CreateContest'
import ContestDetail from './pages/contests/ContestDetail'
// Removed unused legacy pages (Withdrawals, Sliders, Contact, PrizeStructure, Draw)
import Notifications from './pages/Notifications'
import BuyerDashboard from './pages/buyer/BuyerDashboard'
import BuyerBids from './pages/buyer/Bids'
import BuyerWon from './pages/buyer/Won'
import BuyerTransactions from './pages/buyer/Transactions'
import SellerDashboard from './pages/seller/SellerDashboard'
import SellerLive from './pages/seller/LiveAuctions'
import SellerCompleted from './pages/seller/CompletedAuctions'
import SellerEarnings from './pages/seller/Earnings'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="contests" element={<Contests />} />
        <Route path="contests/create" element={<CreateContest />} />
        <Route path="contests/:id" element={<ContestDetail />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="buyer" element={<BuyerDashboard />} />
        <Route path="buyer/bids" element={<BuyerBids />} />
        <Route path="buyer/won" element={<BuyerWon />} />
        <Route path="buyer/transactions" element={<BuyerTransactions />} />
        <Route path="seller" element={<SellerDashboard />} />
        <Route path="seller/live" element={<SellerLive />} />
        <Route path="seller/completed" element={<SellerCompleted />} />
        <Route path="seller/earnings" element={<SellerEarnings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const authed = localStorage.getItem('admin_authed') === 'true'
  if (!authed) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default App
