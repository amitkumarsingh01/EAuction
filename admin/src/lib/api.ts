import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://eauction.iaks.site/',
})

// Attach bearer token if present
api.interceptors.request.use((config) => {
  config.headers = config.headers || {}
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth helpers
export type AuthUser = {
  access_token: string
  token_type: string
  user_type: 'buyer' | 'seller' | 'admin'
  user_id: number
}

export function saveAuth(auth: AuthUser) {
  localStorage.setItem('auth_token', auth.access_token)
  localStorage.setItem('auth_user_type', auth.user_type)
  localStorage.setItem('auth_user_id', String(auth.user_id))
  localStorage.setItem('admin_authed', 'true')
}

export function clearAuth() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user_type')
  localStorage.removeItem('auth_user_id')
  localStorage.removeItem('admin_authed')
  localStorage.removeItem('admin_userId')
}

// Admin Dashboard (mapped from backend /dashboard/admin)
export type AdminDashboard = {
  active_auctions: number
  total_users: number
  total_sales_volume: number
  total_bids: number
}

