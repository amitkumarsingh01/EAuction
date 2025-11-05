import { useEffect, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { api } from '../../lib/api'
import BlockchainProgress from '../../components/BlockchainProgress'
import BlockchainStatus from '../../components/BlockchainStatus'
import BlockchainTransactionTracker from '../../components/BlockchainTransactionTracker'
import { useWallet } from '../../contexts/WalletContext'

type Auction = {
  id: number
  product_name: string
  description?: string
  base_price: number
  current_highest_bid: number
  status: 'created' | 'active' | 'ended' | 'winner_selected'
  seller_id: number
  start_time: string
  end_time: string
  image_url?: string | null
  winner_id?: number | null
}

type Bid = {
  id: number
  amount: number
  bid_time: string
  bidder_id: number
  auction_id: number
}

export default function ContestDetail() {
  const { id } = useParams()
  const location = useLocation()
  const [overview, setOverview] = useState<Auction | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [placing, setPlacing] = useState(false)
  const [amount, setAmount] = useState('')
  const [showChain, setShowChain] = useState(false)
  const [tab, setTab] = useState<'overview'|'purchases'>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { isConnected } = useWallet()

  useEffect(() => {
    (async () => {
      try {
        const auctionsRes = await api.get('/auctions')
        const auction: Auction | undefined = auctionsRes.data.find((a: Auction) => String(a.id) === String(id))
        if (!auction) {
          setError('Auction not found')
          setLoading(false)
          return
        }
        setOverview(auction)
        const bidsRes = await api.get(`/auctions/${auction.id}/bids`)
        setBids(bidsRes.data)
      } catch (e: any) {
        setError(e?.response?.data?.detail || 'Failed to load auction details')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const t = params.get('tab')
    if (t === 'purchases') setTab('purchases')
  }, [location.search])

  const getStatusColor = (status?: Auction['status']) => {
    if (status === 'active') return 'bg-green-100 text-green-700'
    if (status === 'winner_selected') return 'bg-purple-100 text-purple-700'
    if (status === 'ended') return 'bg-gray-100 text-gray-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  const getStatusText = (status?: Auction['status']) => {
    if (status === 'active') return 'Active'
    if (status === 'winner_selected') return 'Winner Selected'
    if (status === 'ended') return 'Ended'
    return 'Created'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading contest details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-800 mb-2">Error Loading Contest</h3>
        <p className="text-red-600">{error}</p>
        <Link to="/contests" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:shadow-lg transition-all">
          Back to Contests
        </Link>
      </div>
    )
  }

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
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {overview?.product_name}
          </h1>
          <p className="text-gray-600 mt-1">Contest Details & Analytics</p>
        </div>
      </div>

      {/* Contest Header Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-yellow-500 p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-3xl font-bold">{overview?.product_name}</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(overview?.status)}`}>
                  {getStatusText(overview?.status)}
                </div>
                <div className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm flex items-center gap-1">
                  <span>⛓️</span>
                  <span>On-Chain Auction</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎫</span>
                  <div>
                    <p className="text-sm opacity-75">Base Price</p>
                    <p className="text-2xl font-bold">₹{overview?.base_price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <p className="text-sm opacity-75">Current Highest Bid</p>
                    <p className="text-2xl font-bold">₹{overview?.current_highest_bid?.toLocaleString?.() || overview?.current_highest_bid}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="text-sm opacity-75">Seller ID</p>
                    <p className="text-2xl font-bold">{overview?.seller_id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-gray-800">{new Date(overview!.start_time).toLocaleString()}</div>
              <div className="text-sm text-gray-500">Start Time</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-700">{new Date(overview!.end_time).toLocaleString()}</div>
              <div className="text-sm text-gray-500">End Time</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-3xl font-bold text-green-700">{overview?.status}</div>
              <div className="text-sm text-gray-500">Status</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 text-sm text-gray-600">
            Highest bid updates as users bid. Use the Bids tab to monitor activity.
          </div>

          {overview?.status === 'active' && (
            <div className="mt-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3">Place a Bid</h4>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={(overview.current_highest_bid || overview.base_price) + 1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={`>${overview.current_highest_bid}`}
                />
                <button
                  disabled={placing || !amount}
                  onClick={async () => {
                    if (!overview) return
                    setPlacing(true)
                    setShowChain(true)
                    try {
                      const bidderId = Number(localStorage.getItem('auth_user_id') || '2') || 2
                      // Simulate on-chain then call API
                      await new Promise(res => setTimeout(res, 1200))
                      await api.post('/bids/place', { auction_id: overview.id, amount: Number(amount), bidder_id: bidderId })
                      const bidsRes = await api.get(`/auctions/${overview.id}/bids`)
                      setBids(bidsRes.data)
                      setAmount('')
                    } catch (e: any) {
                      alert(e?.response?.data?.detail || 'Failed to place bid')
                    } finally {
                      setPlacing(false)
                      setShowChain(false)
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-primary to-yellow-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {placing ? 'Placing...' : 'Place Bid'}
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">Bid must be higher than current highest bid.</div>
            </div>
          )}
        </div>
      </div>

      <BlockchainProgress
        open={showChain}
        onClose={() => setShowChain(false)}
        title="Submitting Bid On-Chain"
      />

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: '📊', description: 'Auction statistics' },
              { key: 'purchases', label: 'Bids', icon: '🛒', description: 'Bid history' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                className={`flex items-center gap-3 px-6 py-4 font-medium transition-all duration-200 min-w-0 flex-shrink-0 ${
                  tab === t.key
                    ? 'bg-gradient-to-r from-primary to-yellow-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white hover:shadow-md'
                }`}
              >
                <span className="text-xl">{t.icon}</span>
                <div className="text-left">
                  <div className="font-semibold">{t.label}</div>
                  <div className={`text-xs ${tab === t.key ? 'text-white/80' : 'text-gray-500'}`}>
                    {t.description}
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8">
          {tab === 'overview' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  Contest Overview
                  <span className="text-lg">⛓️</span>
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live Data</span>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-purple-600 font-medium">Blockchain</span>
                </div>
              </div>

              {/* Blockchain Status */}
              {isConnected && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <BlockchainStatus showDetails={true} />
                  <BlockchainTransactionTracker />
                </div>
              )}
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🎯</span>
                    <span className="text-sm font-medium text-blue-700">Auction ID</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-800">{overview?.id}</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">💰</span>
                    <span className="text-sm font-medium text-green-700">Current Highest Bid</span>
                  </div>
                  <div className="text-3xl font-bold text-green-800">
                    ₹{overview?.current_highest_bid?.toLocaleString?.() || overview?.current_highest_bid}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📊</span>
                    <span className="text-sm font-medium text-purple-700">Status</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-800">
                    {overview?.status}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🔥</span>
                    <span className="text-sm font-medium text-orange-700">Seller</span>
                  </div>
                  <div className="text-3xl font-bold text-orange-800">
                    {overview?.seller_id}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'purchases' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  Bid History
                  <span className="text-lg">⛓️</span>
                </h3>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  {bids.length} total bids
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    On-Chain
                  </span>
                </div>
              </div>

              {bids.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🛒</div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">No bids yet</h4>
                  <p className="text-gray-600">Once users start bidding, they will appear here with detailed information.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="text-left p-6 font-semibold text-gray-700">Bidder ID</th>
                          <th className="text-left p-6 font-semibold text-gray-700">Amount</th>
                          <th className="text-left p-6 font-semibold text-gray-700">Time</th>
                          <th className="text-left p-6 font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bids.map((b: Bid) => (
                          <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-6 flex items-center gap-2">
                              {b.bidder_id}
                              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                ⛓️
                              </span>
                            </td>
                            <td className="p-6 font-semibold text-green-700">₹{b.amount}</td>
                            <td className="p-6">{new Date(b.bid_time).toLocaleString()}</td>
                            <td className="p-6">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                ✓ Confirmed
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}




