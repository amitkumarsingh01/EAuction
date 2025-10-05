import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { AdminDashboard } from '../lib/api'
import BlockchainAuction from '../components/BlockchainAuction'
import BlockchainStatus from '../components/BlockchainStatus'
import BlockchainActivityFeed from '../components/BlockchainActivityFeed'
import BlockchainTransactionTracker from '../components/BlockchainTransactionTracker'

export default function Dashboard() {
  const [data, setData] = useState<AdminDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/dashboard/admin')
        setData(res.data)
      } catch (e: any) {
        setError(e?.response?.data?.detail || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }
  
  if (!data) return null

  const cards = [
    { 
      label: 'Total Users', 
      value: data.total_users, 
      icon: '👥', 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-700',
      changeType: 'positive'
    },
    { 
      label: 'Active Auctions', 
      value: data.active_auctions, 
      icon: '🔥', 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
      textColor: 'text-orange-700',
      changeType: 'neutral'
    },
    { 
      label: 'Total Bids', 
      value: data.total_bids, 
      icon: '💳', 
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'from-indigo-50 to-indigo-100',
      textColor: 'text-indigo-700',
      changeType: 'positive'
    },
    { 
      label: 'Sales Volume', 
      value: `₹${data.total_sales_volume.toLocaleString()}`, 
      icon: '💰', 
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-50 to-emerald-100',
      textColor: 'text-emerald-700',
      changeType: 'positive'
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-yellow-500 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard Overview</h1>
            <p className="text-xl opacity-90">Real-time insights into your lottery system</p>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-6xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div 
            key={card.label} 
            className={`bg-gradient-to-br ${card.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                card.changeType === 'positive' ? 'bg-green-100 text-green-700' :
                card.changeType === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
              </div>
            </div>
            <div>
              <p className={`text-sm font-medium ${card.textColor} mb-1`}>{card.label}</p>
              <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Blockchain Auction Demo */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            ⛓️
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Blockchain Integration</h2>
        </div>
        
        {/* Blockchain Status Overview */}
        <div className="mb-8">
          <BlockchainStatus showDetails={true} />
        </div>

        {/* Blockchain Components Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <BlockchainActivityFeed />
          <BlockchainTransactionTracker />
        </div>

        {/* Blockchain Auction Demo */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Live Auction Demo</h3>
          <BlockchainAuction auctionId="demo-auction-1" />
        </div>
      </div>
    </div>
  )
}


