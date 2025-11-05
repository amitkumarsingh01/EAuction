import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../lib/api'
import BlockchainProgress from '../../components/BlockchainProgress'
import BlockchainStatus from '../../components/BlockchainStatus'
import { useWallet } from '../../contexts/WalletContext'

export default function CreateContest() {
  const nav = useNavigate()
  const [form, setForm] = useState({
    product_name: '',
    description: '',
    base_price: '',
    start_time: '',
    end_time: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showChain, setShowChain] = useState(false)
  const { isConnected } = useWallet()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const sellerId = Number(localStorage.getItem('auth_user_id') || '0') || 1
      setShowChain(true)
      await new Promise(res => setTimeout(res, 4000))
      await api.post('/auctions/create', {
        product_name: form.product_name,
        description: form.description,
        base_price: Number(form.base_price),
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        seller_id: sellerId,
      })
      nav('/contests', { replace: true })
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to create contest')
    } finally {
      setLoading(false)
      setShowChain(false)
    }
  }

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  // const calculateRevenue = () => 0

  const calculateProfit = () => 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          to="/contests" 
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200"
        >
          <span className="text-xl">←</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Create New Auction
          </h1>
          <p className="text-gray-600 mt-1">Set up a new auction with schedule and base price</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-3xl">🎯</span>
                Contest Details
              </h2>
              <p className="text-gray-600">Fill in the basic information for your new lottery contest</p>
            </div>
            
            <form onSubmit={submit} className="space-y-8">
              <div className="space-y-8">
                <Field 
                  label="Product Name" 
                  description="Give your auction a memorable and attractive product name"
                  required
                >
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">🎪</span>
                    <input 
                      className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg" 
                      placeholder="e.g., iPhone 15 Pro Max, Gaming Laptop"
                      value={form.product_name} 
                      onChange={(e) => set('product_name', e.target.value)} 
                      required
                    />
                  </div>
                </Field>

                <Field 
                  label="Description" 
                  description="Brief description of the product"
                >
                  <div className="relative">
                    <textarea 
                      className="w-full border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg" 
                      placeholder="Describe the product details"
                      value={form.description} 
                      onChange={(e) => set('description', e.target.value)} 
                      rows={4}
                    />
                  </div>
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Field 
                    label="Base Price (₹)" 
                    description="Starting price for the auction"
                    required
                  >
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">💰</span>
                      <input 
                        className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg" 
                        type="number" 
                        placeholder="100"
                        value={form.base_price} 
                        onChange={(e) => set('base_price', e.target.value)} 
                        required
                        min="1"
                      />
                    </div>
                  </Field>

                  <Field 
                    label="Start Time" 
                    description="When the auction should start"
                    required
                  >
                    <div className="relative">
                      <input
                        className="w-full border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
                        type="datetime-local"
                        value={form.start_time}
                        onChange={(e) => set('start_time', e.target.value)}
                        required
                      />
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Field 
                    label="End Time" 
                    description="When the auction should end"
                    required
                  >
                    <div className="relative">
                      <input
                        className="w-full border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
                        type="datetime-local"
                        value={form.end_time}
                        onChange={(e) => set('end_time', e.target.value)}
                        required
                      />
                    </div>
                  </Field>
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

              <div className="flex gap-4 pt-6">
                <button 
                  type="button"
                  onClick={() => nav('/contests')}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading || !form.product_name || !form.base_price || !form.start_time || !form.end_time}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-yellow-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Auction...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl">🎯</span>
                      Create Auction
                      {isConnected && (
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                          ⛓️
                        </span>
                      )}
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Preview & Info */}
        <div className="space-y-6">
          {/* Contest Preview */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-2xl">👁️</span>
              Live Preview
            </h3>
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-2xl">
                <div className="bg-gradient-to-r from-primary to-yellow-500 p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xl">{form.product_name || 'Product Name'}</h4>
                      <p className="text-sm opacity-75">Auction</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/20 rounded-lg p-3">
                      <p className="text-sm opacity-75">Base Price</p>
                      <p className="text-2xl font-bold">₹{form.base_price || '0'}</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <p className="text-sm opacity-75">Start → End</p>
                      <p className="text-sm font-semibold">
                        {form.start_time || '—'} → {form.end_time || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 flex items-center gap-2">
                    <span className="text-lg">⏰</span>
                    Duration
                  </span>
                  <span className="font-bold text-gray-800">Auto-calculated by your input</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary (placeholder) */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-2xl">💰</span>
              Financial Analysis
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-700 font-medium">Potential Revenue</span>
                  <span className="text-2xl font-bold text-blue-800">₹0</span>
                </div>
                <p className="text-xs text-blue-600">Depends on bids</p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-700 font-medium">Prize Money</span>
                  <span className="text-2xl font-bold text-green-800">₹0</span>
                </div>
                <p className="text-xs text-green-600">Not applicable</p>
              </div>
              
              <div className={`p-4 rounded-xl border ${
                calculateProfit() >= 0 
                  ? 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200' 
                  : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${calculateProfit() >= 0 ? 'text-purple-700' : 'text-red-700'}`}>
                    Net Profit
                  </span>
                  <span className={`text-2xl font-bold ${calculateProfit() >= 0 ? 'text-purple-800' : 'text-red-800'}`}>
                    ₹0
                  </span>
                </div>
                <p className={`text-xs ${calculateProfit() >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  Based on auction results
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              Tips
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <span className="font-medium text-green-800">Clear Title & Description</span>
                  <p className="text-xs text-green-600">Helps buyers bid confidently</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <span className="font-medium text-green-800">Realistic Base Price</span>
                  <p className="text-xs text-green-600">Improves participation</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <span className="font-medium text-green-800">Good Timing</span>
                  <p className="text-xs text-green-600">Set start/end for visibility</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BlockchainProgress 
        open={showChain} 
        onClose={() => {}} 
        title="Creating Auction On-Chain"
        steps={[
          { key: 'prepare', label: 'Preparing on-chain transaction', durationMs: 1200 },
          { key: 'sign', label: 'Awaiting signature', durationMs: 1500 },
          { key: 'broadcast', label: 'Broadcasting to network', durationMs: 1500 },
          { key: 'mempool', label: 'Mempool propagation', durationMs: 1500 },
          { key: 'confirm1', label: 'Confirmations (1/2)', durationMs: 1500 },
          { key: 'confirm2', label: 'Confirmations (2/2)', durationMs: 1500 },
        ]}
      />
    </div>
  )
}

function Field({ label, description, children, required }: { 
  label: string
  description?: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <label className="block">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg font-semibold text-gray-800">{label}</span>
        {required && (
          <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
            Required
          </span>
        )}
      </div>
      {description && (
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{description}</p>
      )}
      {children}
    </label>
  )
}

// Blockchain modal at root mount
// Note: place at bottom to render above page
;(() => {})()


