import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, saveAuth } from '../lib/api'
import MetaMaskButton from '../components/MetaMaskButton'
import BlockchainStatus from '../components/BlockchainStatus'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<'buyer' | 'seller' | 'admin'>('admin')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (!(username && password)) throw new Error('Enter username and password')

      const res = await api.post('/auth/login', {
        email: username,
        password,
        user_type: userType,
      })
      saveAuth(res.data)
      navigate('/', { replace: true })
      return
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-yellow-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl relative">
            <span className="text-4xl text-white">🎯</span>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs animate-pulse">
              ⛓️
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            E Auction
          </h1>
          <p className="text-gray-600 text-lg flex items-center justify-center gap-2">
            Admin Panel
            <span className="px-2 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-xs font-medium">
              ⛓️ Blockchain Powered
            </span>
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-yellow-500 p-8 text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
              <p className="text-white/80">Sign in to access the admin dashboard</p>
            </div>
          </div>
          
          <div className="p-8">
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">👤</span>
                  <input
                    className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">🔒</span>
                  <input
                    type="password"
                    className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Account Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['buyer','seller','admin'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setUserType(t)}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${userType === t ? 'bg-primary text-white border-transparent' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 text-xl">⚠️</span>
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-yellow-500 text-white py-4 rounded-xl hover:shadow-lg transition-all duration-200 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-xl">🚀</span>
                    Sign In to Dashboard
                  </div>
                )}
              </button>
            </form>
            <div className="text-center text-sm text-gray-600 mt-4">
              New here? <Link to="/register" className="text-primary font-medium">Create an account</Link>
            </div>

            {/* Blockchain Integration */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="mb-4">
                <div className="flex items-center gap-2 justify-center mb-3">
                  <span className="text-lg">⛓️</span>
                  <span className="text-sm font-medium text-gray-700">Connect Blockchain Wallet</span>
                </div>
                <div className="flex justify-center">
                  <MetaMaskButton />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                <BlockchainStatus showDetails={false} className="border-0 shadow-none bg-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


