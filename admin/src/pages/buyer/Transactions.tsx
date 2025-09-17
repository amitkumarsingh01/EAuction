import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

export default function BuyerTransactions() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const userId = Number(localStorage.getItem('auth_user_id') || '1')

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/buyer/transaction-history', { params: { user_id: userId } })
        setItems(res.data)
      } catch (e: any) {
        setError(e?.response?.data?.detail || 'Failed to load transactions')
      } finally {
        setLoading(false)
      }
    })()
  }, [userId])

  if (loading) return <Loader text="Loading transactions..." />
  if (error) return <ErrorCard title="Error Loading Transactions" error={error} />

  return (
    <div className="space-y-6">
      <Header title="Transaction History" subtitle="Your activity across auctions" icon="💳" />

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="text-left p-6 font-semibold text-gray-700">Auction</th>
                <th className="text-left p-6 font-semibold text-gray-700">Your Highest Bid</th>
                <th className="text-left p-6 font-semibold text-gray-700">Winning Bid</th>
                <th className="text-left p-6 font-semibold text-gray-700">Won</th>
                <th className="text-left p-6 font-semibold text-gray-700">End Time</th>
                <th className="text-left p-6 font-semibold text-gray-700">Total Bids</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((t: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-6">{t.product_name || t.auction_id}</td>
                  <td className="p-6">₹{t.your_highest_bid}</td>
                  <td className="p-6">₹{t.winning_bid}</td>
                  <td className="p-6">{t.won ? 'Yes' : 'No'}</td>
                  <td className="p-6">{new Date(t.end_time).toLocaleString()}</td>
                  <td className="p-6">{t.total_bids_placed}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
