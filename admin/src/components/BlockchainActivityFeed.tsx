import React, { useState, useEffect } from 'react'
import { useWallet } from '../contexts/WalletContext'

interface BlockchainEvent {
  id: string
  type: 'auction_created' | 'bid_placed' | 'auction_ended' | 'funds_transferred' | 'wallet_connected'
  title: string
  description: string
  timestamp: number
  amount?: string
  from?: string
  to?: string
  txHash?: string
  status: 'success' | 'pending' | 'failed'
}

export default function BlockchainActivityFeed() {
  const { isConnected, account } = useWallet()
  const [events, setEvents] = useState<BlockchainEvent[]>([])
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    if (!isConnected) return

    // Add initial events
    const initialEvents: BlockchainEvent[] = [
      {
        id: 'event-1',
        type: 'wallet_connected',
        title: 'Wallet Connected',
        description: `MetaMask wallet connected successfully`,
        timestamp: Date.now() - 300000, // 5 minutes ago
        status: 'success'
      },
      {
        id: 'event-2',
        type: 'auction_created',
        title: 'Auction Created',
        description: 'New auction "Vintage Watch Collection" created',
        timestamp: Date.now() - 600000, // 10 minutes ago
        amount: '0.1',
        from: account || '',
        txHash: generateTxHash(),
        status: 'success'
      },
      {
        id: 'event-3',
        type: 'bid_placed',
        title: 'Bid Placed',
        description: 'Bid placed on auction "Vintage Watch Collection"',
        timestamp: Date.now() - 900000, // 15 minutes ago
        amount: '1.5',
        from: account || '',
        txHash: generateTxHash(),
        status: 'success'
      }
    ]

    setEvents(initialEvents)

    // Simulate real-time events
    const interval = setInterval(() => {
      if (!isLive) return

      const eventTypes: BlockchainEvent['type'][] = [
        'auction_created',
        'bid_placed',
        'auction_ended',
        'funds_transferred'
      ]

      if (Math.random() > 0.7) {
        const type = eventTypes[Math.floor(Math.random() * eventTypes.length)]
        const newEvent = createMockEvent(type)
        setEvents(prev => [newEvent, ...prev.slice(0, 19)]) // Keep last 20 events
      }
    }, 8000)

    return () => clearInterval(interval)
  }, [isConnected, isLive, account])

  const createMockEvent = (type: BlockchainEvent['type']): BlockchainEvent => {
    const baseEvent = {
      id: `event-${Date.now()}`,
      timestamp: Date.now(),
      status: 'success' as const
    }

    switch (type) {
      case 'auction_created':
        return {
          ...baseEvent,
          type: 'auction_created',
          title: 'Auction Created',
          description: 'New auction created on blockchain',
          amount: '0.05',
          from: account || '',
          txHash: generateTxHash()
        }
      case 'bid_placed':
        return {
          ...baseEvent,
          type: 'bid_placed',
          title: 'Bid Placed',
          description: 'New bid placed on auction',
          amount: (Math.random() * 3 + 0.5).toFixed(3),
          from: account || '',
          txHash: generateTxHash()
        }
      case 'auction_ended':
        return {
          ...baseEvent,
          type: 'auction_ended',
          title: 'Auction Ended',
          description: 'Auction ended successfully',
          txHash: generateTxHash()
        }
      case 'funds_transferred':
        return {
          ...baseEvent,
          type: 'funds_transferred',
          title: 'Funds Transferred',
          description: 'Funds transferred between accounts',
          amount: (Math.random() * 2).toFixed(3),
          from: account || '',
          to: generateAddress(),
          txHash: generateTxHash()
        }
      default:
        return baseEvent
    }
  }

  const generateTxHash = () => {
    const chars = 'abcdef0123456789'
    let hash = '0x'
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)]
    }
    return hash
  }

  const generateAddress = () => {
    const chars = 'abcdef0123456789'
    let address = '0x'
    for (let i = 0; i < 40; i++) {
      address += chars[Math.floor(Math.random() * chars.length)]
    }
    return address
  }

  const getEventIcon = (type: BlockchainEvent['type']) => {
    switch (type) {
      case 'wallet_connected': return '🔗'
      case 'auction_created': return '🎯'
      case 'bid_placed': return '💰'
      case 'auction_ended': return '🏁'
      case 'funds_transferred': return '💸'
      default: return '📄'
    }
  }

  const getEventColor = (type: BlockchainEvent['type']) => {
    switch (type) {
      case 'wallet_connected': return 'from-blue-500 to-blue-600'
      case 'auction_created': return 'from-green-500 to-green-600'
      case 'bid_placed': return 'from-yellow-500 to-yellow-600'
      case 'auction_ended': return 'from-purple-500 to-purple-600'
      case 'funds_transferred': return 'from-pink-500 to-pink-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusIcon = (status: BlockchainEvent['status']) => {
    switch (status) {
      case 'success': return '✅'
      case 'pending': return '⏳'
      case 'failed': return '❌'
      default: return '❓'
    }
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔗</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Blockchain Activity</h3>
          <p className="text-gray-500">Connect your MetaMask wallet to see blockchain activity</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
            ⛓️
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Blockchain Activity</h3>
            <p className="text-sm text-gray-500">Real-time blockchain events</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              isLive 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isLive ? '🔴 Live' : '⏸️ Paused'}
          </button>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className={`w-10 h-10 bg-gradient-to-br ${getEventColor(event.type)} rounded-lg flex items-center justify-center text-white text-lg`}>
                {getEventIcon(event.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-800">{event.title}</h4>
                  <span className="text-sm">{getStatusIcon(event.status)}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{formatTime(event.timestamp)}</span>
                  {event.amount && (
                    <span className="font-medium text-green-600">{event.amount} ETH</span>
                  )}
                  {event.txHash && (
                    <span className="font-mono">Tx: {formatAddress(event.txHash)}</span>
                  )}
                </div>
                
                {(event.from || event.to) && (
                  <div className="mt-2 text-xs text-gray-500">
                    {event.from && <span>From: {formatAddress(event.from)}</span>}
                    {event.from && event.to && <span className="mx-2">→</span>}
                    {event.to && <span>To: {formatAddress(event.to)}</span>}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-3xl mb-3">📊</div>
            <p>No blockchain activity yet</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Showing {events.length} events</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  )
}
