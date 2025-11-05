import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import BlockchainAuction from '../../components/BlockchainAuction'
import BlockchainTransactionTracker from '../../components/BlockchainTransactionTracker'
import BlockchainStatus from '../../components/BlockchainStatus'
import BlockchainActivityFeed from '../../components/BlockchainActivityFeed'
import { useWallet } from '../../contexts/WalletContext'

export default function SellerDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const userId = Number(localStorage.getItem('auth_user_id') || '1')
  const { isConnected } = useWallet()

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/dashboard/seller', { params: { user_id: userId } })
        setData(res.data)
      } catch (e: any) {
        setError(e?.response?.data?.detail || 'Failed to load seller dashboard')
      } finally {
        setLoading(false)
      }
    })()
  }, [userId])

  if (loading) return <Loader text="Loading seller dashboard..." />
  if (error) return <ErrorCard title="Error Loading Seller Dashboard" error={error} />

  return (
    <div className="space-y-8">
      <Header title="Seller Dashboard" subtitle="Overview of your auctions" icon="🏷️" />

      {/* Blockchain Status */}
      {isConnected && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              ⛓️
            </div>
            <h2 className="text-xl font-bold text-gray-800">Blockchain Seller Dashboard</h2>
          </div>
          <BlockchainStatus showDetails={true} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon="📦" label="Total Auctions" value={data.total_auctions} color="from-blue-500 to-blue-600" />
        <StatCard icon="🔥" label="Active" value={data.active_auctions} color="from-orange-500 to-orange-600" />
        <StatCard icon="✅" label="Completed" value={data.completed_auctions} color="from-green-500 to-green-600" />
        <StatCard icon="💰" label="Earnings" value={`₹${data.total_earnings.toLocaleString()}`} color="from-emerald-500 to-emerald-600" />
      </div>

      <Section title="Active Auctions">
        {data.active_auctions_details?.length === 0 ? (
          <div className="text-gray-600">No active auctions.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.active_auctions_details.map((a: any) => (
              <div key={a.auction_id} className="p-4 bg-white rounded-xl border shadow-sm">
                <div className="font-semibold text-gray-800">{a.product_name}</div>
                <div className="text-sm text-gray-500">Current Bid: ₹{a.current_highest_bid}</div>
                <div className="text-sm text-gray-500">Ends: {new Date(a.end_time).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Completed Auctions">
        {data.completed_auctions_details?.length === 0 ? (
          <div className="text-gray-600">No completed auctions.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.completed_auctions_details.map((a: any) => (
              <div key={a.auction_id} className="p-4 bg-white rounded-xl border shadow-sm">
                <div className="font-semibold text-gray-800">{a.product_name}</div>
                <div className="text-sm text-gray-500">Final Price: ₹{a.final_price}</div>
                <div className="text-sm text-gray-500">Winner: {a.winner_id}</div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Blockchain Integration for Sellers */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            ⛓️
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Blockchain Auctions</h2>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
            Live
          </span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <BlockchainAuction auctionId="seller-auction-1" />
          <BlockchainActivityFeed />
        </div>
        
        {isConnected && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BlockchainTransactionTracker />
          </div>
        )}
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

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
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

function Section({ title, children }: { title: string; children: any }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
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
