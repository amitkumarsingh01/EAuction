import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'

type Auction = {
  id: number
  product_name: string
  base_price: number
  current_highest_bid: number
  status: 'created' | 'active' | 'ended' | 'winner_selected'
  seller_id: number
  start_time: string
  end_time: string
}

export default function Contests() {
  const [items, setItems] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId] = useState<string>('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/admin/auctions')
        setItems(res.data)
      } catch (e: any) {
        setError(e?.response?.data?.detail || 'Failed to load contests')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const remove = async (_id: string) => {
    alert('Delete not implemented for auctions in backend')
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: Auction['status']) => {
    if (status === 'active') return 'bg-green-100 text-green-700'
    if (status === 'winner_selected') return 'bg-purple-100 text-purple-700'
    if (status === 'ended') return 'bg-gray-100 text-gray-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  const getStatusText = (status: Auction['status']) => {
    if (status === 'active') return 'Active'
    if (status === 'winner_selected') return 'Winner Selected'
    if (status === 'ended') return 'Ended'
    return 'Created'
  }

  const filteredItems = items.filter(auction => {
    if (filter === 'all') return true
    if (filter === 'active') return auction.status === 'active'
    if (filter === 'completed') return auction.status === 'winner_selected' || auction.status === 'ended'
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading contests...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-800 mb-2">Error Loading Contests</h3>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Auctions Management
          </h1>
          <p className="text-gray-600 mt-1">Create, manage, and monitor all lottery contests</p>
        </div>
        
        <Link 
          to="/contests/create" 
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-yellow-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
        >
          <span className="text-xl">➕</span>
          Create New Auction
        </Link>
      </div>

      {/* Filters and Stats */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All', count: items.length },
                { key: 'active', label: 'Active', count: items.filter(c => c.status === 'active').length },
                { key: 'completed', label: 'Completed', count: items.filter(c => c.status === 'winner_selected' || c.status === 'ended').length }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === key
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Total: {items.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Active: {items.filter(c => c.status === 'active').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Completed: {items.filter(c => c.status === 'winner_selected' || c.status === 'ended').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contest Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredItems.map((auction, index) => (
          <div
            key={auction.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-yellow-500 p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{auction.product_name}</h3>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    getStatusColor(auction.status)
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${auction.status === 'active' ? 'bg-green-500' : auction.status === 'winner_selected' ? 'bg-purple-500' : 'bg-yellow-500'}`}></div>
                    {getStatusText(auction.status)}
                    <span className="ml-2 inline-flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      <span>⛓️</span>
                      <span>On-chain</span>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">₹{auction.current_highest_bid.toLocaleString()}</div>
                  <div className="text-sm opacity-75">current bid</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Base Price */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <p className="text-sm text-gray-500">Base Price</p>
                      <p className="text-xl font-bold text-green-700">₹{auction.base_price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Time Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-500">Start</div>
                    <div className="text-lg font-bold text-gray-800">{new Date(auction.start_time).toLocaleString()}</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-xl">
                    <div className="text-sm text-gray-500">End</div>
                    <div className="text-lg font-bold text-blue-700">{new Date(auction.end_time).toLocaleString()}</div>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📅</span>
                    <span>Start: {formatDate(auction.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>🏁</span>
                    <span>End: {formatDate(auction.end_time)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/contests/${auction.id}`}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium text-center"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/contests/${auction.id}?tab=purchases`}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium text-center"
                  >
                    View Bids
                  </Link>
                </div>
                <div className="mt-2 flex gap-2">
                  <Link
                    to={`/contests/${auction.id}?tab=purchases`}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium text-center"
                  >
                    Auction Bids
                  </Link>
                  <button
                    onClick={() => remove(String(auction.id))}
                    disabled={busyId === String(auction.id)}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium disabled:opacity-50"
                  >
                    {busyId === String(auction.id) ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No auctions found</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all' 
              ? "No auctions have been created yet" 
              : `No ${filter} auctions found`
            }
          </p>
          <Link 
            to="/contests/create" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-yellow-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
          >
            <span className="text-xl">➕</span>
            Create First Auction
          </Link>
        </div>
      )}
    </div>
  )
}


