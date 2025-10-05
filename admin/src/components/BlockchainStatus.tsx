import { useState, useEffect } from 'react'
import { useWallet } from '../contexts/WalletContext'

interface BlockchainStatusProps {
  showDetails?: boolean
  className?: string
}

interface Transaction {
  id: string
  type: 'bid' | 'create' | 'end' | 'withdraw'
  amount?: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
  hash: string
  description: string
}

export default function BlockchainStatus({ showDetails = false, className = '' }: BlockchainStatusProps) {
  const { isConnected, account, balance } = useWallet()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())

  // Simulate real-time transaction updates
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      setLastUpdate(Date.now())
      // Simulate checking for new transactions
      if (Math.random() > 0.8) {
        addMockTransaction()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isConnected])

  const addMockTransaction = () => {
    const types: Transaction['type'][] = ['bid', 'create', 'end', 'withdraw']
    const type = types[Math.floor(Math.random() * types.length)]
    
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type,
      amount: type === 'bid' || type === 'withdraw' ? (Math.random() * 2).toFixed(3) : undefined,
      status: 'confirmed',
      timestamp: Date.now(),
      hash: generateTxHash(),
      description: getTransactionDescription(type)
    }

    setTransactions(prev => [newTx, ...prev.slice(0, 9)]) // Keep last 10 transactions
  }

  const generateTxHash = () => {
    const chars = 'abcdef0123456789'
    let hash = '0x'
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)]
    }
    return hash
  }

  const getTransactionDescription = (type: Transaction['type']) => {
    const descriptions = {
      bid: 'Placed bid on local auction',
      create: 'Created new local auction',
      end: 'Ended local auction',
      withdraw: 'Withdrew funds locally'
    }
    return descriptions[type]
  }

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'bid': return '💰'
      case 'create': return '🎯'
      case 'end': return '🏁'
      case 'withdraw': return '💸'
      default: return '📄'
    }
  }

  if (!isConnected) {
    return (
      <div className={`bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">🔗</span>
          </div>
          <div>
            <div className="font-medium text-gray-700">Local Wallet Disconnected</div>
            <div className="text-sm text-gray-500">Connect local wallet to enable blockchain features</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
            <span className="text-lg">🔗</span>
          </div>
          <div>
            <div className="font-medium text-gray-800">Local Wallet Connected</div>
            <div className="text-sm text-gray-500">Local Blockchain Simulation</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      {/* Account Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Account</div>
          <div className="font-mono text-sm text-gray-800">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Balance</div>
          <div className="font-bold text-gray-800">{balance} ETH</div>
        </div>
      </div>

      {/* Recent Transactions */}
      {showDetails && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800">Recent Transactions</h4>
            <span className="text-xs text-gray-500">{transactions.length} total</span>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="text-lg">{getTypeIcon(tx.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {tx.description}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {tx.amount && (
                      <span className="text-sm font-medium text-gray-800">
                        {tx.amount} ETH
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <div className="text-2xl mb-2">📄</div>
                <div className="text-sm">No transactions yet</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Activity Indicator */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last updated: {new Date(lastUpdate).toLocaleTimeString()}</span>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
            <span>Syncing</span>
          </div>
        </div>
      </div>
    </div>
  )
}
