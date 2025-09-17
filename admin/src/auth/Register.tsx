import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, saveAuth } from '../lib/api'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<'buyer' | 'seller' | 'admin'>('buyer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        email,
        password,
        user_type: userType,
      })
      saveAuth(res.data)
      navigate('/', { replace: true })
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-yellow-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <span className="text-4xl text-white">🛍️</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            E Auction
          </h1>
          <p className="text-gray-600 text-lg">Create your account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-yellow-500 p-8 text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Join E Auction</h2>
              <p className="text-white/80">Register to start buying or selling</p>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">📧</span>
                  <input
                    type="email"
                    className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">🔒</span>
                  <input
                    type="password"
                    className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">Account Type</label>
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
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-xl">🚀</span>
                    Create Account
                  </div>
                )}
              </button>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium">Sign in</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
