import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function Notifications() {
  const [items, setItems] = useState<Array<{id:number; message:string; is_read:boolean; created_at:string}>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const userId = Number(localStorage.getItem('auth_user_id') || '1')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/notifications', { params: { user_id: userId } })
      setItems(res.data)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const markRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`, null, { params: { user_id: userId } })
      setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'Failed to mark as read')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading notifications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-800 mb-2">Error Loading Notifications</h3>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Notifications</h1>
          <p className="text-gray-600 mt-1">System messages and updates</p>
        </div>
        <button onClick={load} className="px-4 py-2 bg-gradient-to-r from-primary to-yellow-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium">
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {items.map((n) => (
          <div key={n.id} className={`flex items-start gap-4 p-4 rounded-2xl border shadow-sm ${n.is_read ? 'bg-white border-gray-200' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'}`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-br from-primary to-yellow-600">🔔</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
                {!n.is_read && (
                  <button onClick={() => markRead(n.id)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:opacity-90">Mark as read</button>
                )}
              </div>
              <div className="font-medium text-gray-800 mt-1">{n.message}</div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No notifications</h3>
          <p className="text-gray-600">You're all caught up.</p>
        </div>
      )}
    </div>
  )
}
