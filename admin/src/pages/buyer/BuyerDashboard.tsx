import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import BlockchainAuction from '../../components/BlockchainAuction'
import BlockchainActivityFeed from '../../components/BlockchainActivityFeed'

export default function BuyerDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const userId = Number(localStorage.getItem('auth_user_id') || '1')

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/dashboard/buyer', { params: { user_id: userId } })
        setData(res.data)
      } catch (e: any) {
        setError(e?.response?.data?.detail || 'Failed to load buyer dashboard')
      } finally {
        setLoading(false)
      }
    })()
  }, [userId])

  if (loading) return <Loader text="Loading buyer dashboard..." />
  if (error) return <ErrorCard title="Error Loading Buyer Dashboard" error={error} />

  return (
    <div className="space-y-8">
      <Header title="Buyer Dashboard" subtitle="Overview of your bidding activity" icon="🛒" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon="🔥" label="Active Bids" value={data.active_bids} color="from-orange-500 to-orange-600" />
        <StatCard icon="🏆" label="Won Items" value={data.won_items} color="from-green-500 to-green-600" />
        <StatCard icon="🎯" label="Total Bids" value={data.total_bids} color="from-blue-500 to-blue-600" />
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="text-xl font-bold text-gray-800">Active Bids Details</h3>
        </div>
        <div className="p-6">
          {data.active_bids_details?.length === 0 ? (
            <div className="text-gray-600">No active bids.</div>
          ) : (
            <ul className="space-y-3">
              {data.active_bids_details.map((b: any) => (
                <li key={b.bid_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-semibold text-gray-800">{b.auction_name}</div>
                    <div className="text-sm text-gray-500">Ends: {new Date(b.auction_end_time).toLocaleString()}</div>
                  </div>
                  <div className="text-lg font-bold text-green-700">₹{b.amount}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="text-xl font-bold text-gray-800">Won Items</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.won_items_details?.length === 0 ? (
            <div className="text-gray-600">No won items yet.</div>
          ) : (
            data.won_items_details.map((w: any) => (
              <div key={w.auction_id} className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="font-semibold text-gray-800">{w.product_name}</div>
                <div className="text-sm text-gray-500">Winning Bid: ₹{w.winning_bid}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Blockchain Integration for Buyers */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            ⛓️
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Blockchain Bidding</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BlockchainAuction auctionId="buyer-auction-1" />
          <BlockchainActivityFeed />
        </div>
      </div>
    </div>
  )
}

function Header({ title, subtitle, icon }: { title: string; subtitle: string; icon: string }) {
  return (
    <div className="bg-gradient-to-r from-primary to-yellow-500 rounded-3xl p-8 text-white">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">{icon}</div>
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="opacity-90">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-white text-2xl`}>{icon}</div>
      </div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
    </div>
  )
}

function Loader({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">{text}</p>
      </div>
    </div>
  )
}

function ErrorCard({ title, error }: { title: string; error: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold text-red-800 mb-2">{title}</h3>
      <p className="text-red-600">{error}</p>
    </div>
  )
}
