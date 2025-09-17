import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

export default function BuyerWon() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const userId = Number(localStorage.getItem('auth_user_id') || '1')

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/buyer/won-items', { params: { user_id: userId } })
        setItems(res.data)
      } catch (e: any) {
        setError(e?.response?.data?.detail || 'Failed to load won items')
      } finally {
        setLoading(false)
      }
    })()
  }, [userId])

  if (loading) return <Loader text="Loading won items..." />
  if (error) return <ErrorCard title="Error Loading Won Items" error={error} />

  return (
    <div className="space-y-6">
      <Header title="Won Items" subtitle="Auctions where you are the winner" icon="🏆" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((a: any) => (
          <div key={a.auction_id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-gray-800">{a.product_name}</div>
              <div className="text-green-700 font-semibold">₹{a.winning_amount}</div>
            </div>
            <div className="text-sm text-gray-500">Ended: {new Date(a.end_time).toLocaleString()}</div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h4 className="text-xl font-semibold text-gray-800 mb-2">No wins yet</h4>
          <p className="text-gray-600">Keep bidding to win auctions.</p>
        </div>
      )}
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
