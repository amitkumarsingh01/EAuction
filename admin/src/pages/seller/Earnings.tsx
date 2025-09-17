import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

export default function SellerEarnings() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const userId = Number(localStorage.getItem('auth_user_id') || '1')

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/seller/earnings-summary', { params: { user_id: userId } })
        setData(res.data)
      } catch (e: any) {
        setError(e?.response?.data?.detail || 'Failed to load earnings summary')
      } finally {
        setLoading(false)
      }
    })()
  }, [userId])

  if (loading) return <Loader text="Loading earnings..." />
  if (error) return <ErrorCard title="Error Loading Earnings" error={error} />

  const months = data ? Object.keys(data.monthly_breakdown || {}) : []

  return (
    <div className="space-y-8">
      <Header title="Earnings Summary" subtitle="Revenue and profit analytics" icon="💹" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Auctions" value={data.total_auctions} icon="📦" color="from-blue-500 to-blue-600" />
        <StatCard label="Completed" value={data.completed_auctions} icon="✅" color="from-green-500 to-green-600" />
        <StatCard label="Total Earnings" value={`₹${data.total_earnings.toLocaleString()}`} icon="💰" color="from-emerald-500 to-emerald-600" />
        <StatCard label="Total Profit" value={`₹${data.total_profit.toLocaleString()}`} icon="📈" color="from-purple-500 to-purple-600" />
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="text-xl font-bold text-gray-800">Monthly Breakdown</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {months.length === 0 ? (
            <div className="text-gray-600">No completed auctions yet.</div>
          ) : (
            months.map((m: string) => (
              <div key={m} className="p-4 bg-gray-50 rounded-xl border">
                <div className="text-sm text-gray-500">{m}</div>
                <div className="text-2xl font-bold text-gray-800">₹{data.monthly_breakdown[m].toLocaleString()}</div>
              </div>
            ))
          )}
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

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
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
