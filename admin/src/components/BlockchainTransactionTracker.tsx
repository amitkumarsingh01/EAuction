import React, { useState, useEffect } from 'react'
import { useWallet } from '../contexts/WalletContext'

interface TransactionStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  duration?: number
  icon: string
}

interface BlockchainTransaction {
  id: string
  type: 'bid' | 'create_auction' | 'end_auction' | 'withdraw' | 'transfer'
  amount: string
  from: string
  to: string
  gasUsed: string
  gasPrice: string
  txHash: string
  blockNumber: number
  timestamp: number
  status: 'pending' | 'confirmed' | 'failed'
  steps: TransactionStep[]
}

export default function BlockchainTransactionTracker() {
  const { isConnected, account } = useWallet()
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([])
  const [activeTransaction, setActiveTransaction] = useState<BlockchainTransaction | null>(null)

  useEffect(() => {
    if (!isConnected) return

    // Create mock transactions with detailed steps
    const mockTransactions: BlockchainTransaction[] = [
      {
        id: 'tx-1',
        type: 'bid',
        amount: '1.5',
        from: account || '',
        to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        gasUsed: '21000',
        gasPrice: '20',
        txHash: generateTxHash(),
        blockNumber: 12345678,
        timestamp: Date.now() - 300000,
        status: 'confirmed',
        steps: [
          {
            id: 'step-1',
            name: 'Transaction Initiated',
            description: 'Transaction created and signed',
            status: 'completed',
            icon: '📝'
          },
          {
            id: 'step-2',
            name: 'Gas Estimation',
            description: 'Calculating gas requirements',
            status: 'completed',
            icon: '⛽'
          },
          {
            id: 'step-3',
            name: 'Network Broadcast',
            description: 'Broadcasting to blockchain network',
            status: 'completed',
            icon: '📡'
          },
          {
            id: 'step-4',
            name: 'Block Confirmation',
            description: 'Waiting for block confirmation',
            status: 'completed',
            icon: '🔗'
          }
        ]
      },
      {
        id: 'tx-2',
        type: 'create_auction',
        amount: '0.1',
        from: account || '',
        to: '0x0000000000000000000000000000000000000000',
        gasUsed: '150000',
        gasPrice: '25',
        txHash: generateTxHash(),
        blockNumber: 12345679,
        timestamp: Date.now() - 600000,
        status: 'confirmed',
        steps: [
          {
            id: 'step-1',
            name: 'Contract Interaction',
            description: 'Interacting with auction contract',
            status: 'completed',
            icon: '📋'
          },
          {
            id: 'step-2',
            name: 'Event Emission',
            description: 'Emitting auction creation event',
            status: 'completed',
            icon: '📢'
          },
          {
            id: 'step-3',
            name: 'State Update',
            description: 'Updating contract state',
            status: 'completed',
            icon: '🔄'
          }
        ]
      }
    ]

    setTransactions(mockTransactions)

    // Simulate new transactions
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newTx = createMockTransaction()
        setTransactions(prev => [newTx, ...prev])
        setActiveTransaction(newTx)
        
        // Simulate transaction progress
        simulateTransactionProgress(newTx.id)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [isConnected, account])

  const createMockTransaction = (): BlockchainTransaction => {
    const types: BlockchainTransaction['type'][] = ['bid', 'create_auction', 'end_auction', 'withdraw']
    const type = types[Math.floor(Math.random() * types.length)]
    
    return {
      id: `tx-${Date.now()}`,
      type,
      amount: (Math.random() * 3).toFixed(3),
      from: account || '',
      to: generateAddress(),
      gasUsed: (Math.random() * 100000 + 21000).toFixed(0),
      gasPrice: (Math.random() * 30 + 10).toFixed(0),
      txHash: generateTxHash(),
      blockNumber: Math.floor(Math.random() * 1000000) + 12000000,
      timestamp: Date.now(),
      status: 'pending',
      steps: getStepsForType(type)
    }
  }

  const getStepsForType = (type: BlockchainTransaction['type']): TransactionStep[] => {
    const baseSteps = [
      {
        id: 'step-1',
        name: 'Transaction Initiated',
        description: 'Transaction created and signed',
        status: 'pending' as const,
        icon: '📝'
      },
      {
        id: 'step-2',
        name: 'Gas Estimation',
        description: 'Calculating gas requirements',
        status: 'pending' as const,
        icon: '⛽'
      },
      {
        id: 'step-3',
        name: 'Network Broadcast',
        description: 'Broadcasting to blockchain network',
        status: 'pending' as const,
        icon: '📡'
      },
      {
        id: 'step-4',
        name: 'Block Confirmation',
        description: 'Waiting for block confirmation',
        status: 'pending' as const,
        icon: '🔗'
      }
    ]

    if (type === 'create_auction') {
      baseSteps.splice(2, 0, {
        id: 'step-contract',
        name: 'Contract Interaction',
        description: 'Interacting with auction contract',
        status: 'pending' as const,
        icon: '📋'
      })
    }

    return baseSteps
  }

  const simulateTransactionProgress = (txId: string) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id === txId) {
        const updatedSteps = tx.steps.map((step, index) => {
          const stepDelay = index * 2000 // 2 seconds per step
          setTimeout(() => {
            setTransactions(prevTx => prevTx.map(prevTxItem => {
              if (prevTxItem.id === txId) {
                const updatedSteps = prevTxItem.steps.map((s, i) => {
                  if (i === index) {
                    return { ...s, status: 'completed' as const }
                  }
                  if (i === index + 1) {
                    return { ...s, status: 'processing' as const }
                  }
                  return s
                })
                return { ...prevTxItem, steps: updatedSteps }
              }
              return prevTxItem
            }))
          }, stepDelay)

          return { ...step, status: index === 0 ? 'processing' as const : 'pending' as const }
        })

        return { ...tx, steps: updatedSteps, status: 'pending' as const }
      }
      return tx
    }))

    // Mark as confirmed after all steps
    setTimeout(() => {
      setTransactions(prev => prev.map(tx => {
        if (tx.id === txId) {
          return { ...tx, status: 'confirmed' as const }
        }
        return tx
      }))
    }, tx.steps.length * 2000 + 1000)
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

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getTypeIcon = (type: BlockchainTransaction['type']) => {
    switch (type) {
      case 'bid': return '💰'
      case 'create_auction': return '🎯'
      case 'end_auction': return '🏁'
      case 'withdraw': return '💸'
      case 'transfer': return '🔄'
      default: return '📄'
    }
  }

  const getTypeColor = (type: BlockchainTransaction['type']) => {
    switch (type) {
      case 'bid': return 'from-yellow-500 to-orange-500'
      case 'create_auction': return 'from-green-500 to-emerald-500'
      case 'end_auction': return 'from-purple-500 to-violet-500'
      case 'withdraw': return 'from-pink-500 to-rose-500'
      case 'transfer': return 'from-blue-500 to-cyan-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusColor = (status: BlockchainTransaction['status']) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStepStatusColor = (status: TransactionStep['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white'
      case 'processing': return 'bg-blue-500 text-white animate-pulse'
      case 'failed': return 'bg-red-500 text-white'
      default: return 'bg-gray-300 text-gray-600'
    }
  }

  if (!isConnected) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Transaction Tracker</h3>
          <p className="text-gray-500">Connect your MetaMask wallet to track transactions</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
            📊
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Transaction Tracker</h3>
            <p className="text-sm text-gray-500">Real-time transaction monitoring</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {transactions.length} transactions
        </div>
      </div>

      <div className="space-y-4">
        {transactions.map((tx) => (
          <div key={tx.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            {/* Transaction Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${getTypeColor(tx.type)} rounded-lg flex items-center justify-center text-white text-lg`}>
                  {getTypeIcon(tx.type)}
                </div>
                <div>
                  <div className="font-medium text-gray-800 capitalize">
                    {tx.type.replace('_', ' ')} Transaction
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(tx.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">{tx.amount} ETH</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                  {tx.status}
                </span>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-500">From:</span>
                <span className="ml-2 font-mono">{formatAddress(tx.from)}</span>
              </div>
              <div>
                <span className="text-gray-500">To:</span>
                <span className="ml-2 font-mono">{formatAddress(tx.to)}</span>
              </div>
              <div>
                <span className="text-gray-500">Gas Used:</span>
                <span className="ml-2">{tx.gasUsed}</span>
              </div>
              <div>
                <span className="text-gray-500">Gas Price:</span>
                <span className="ml-2">{tx.gasPrice} Gwei</span>
              </div>
            </div>

            {/* Transaction Steps */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Transaction Progress</h4>
              {tx.steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getStepStatusColor(step.status)}`}>
                    {step.status === 'completed' ? '✓' : step.status === 'processing' ? '⋯' : index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{step.name}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                  <div className="text-lg">{step.icon}</div>
                </div>
              ))}
            </div>

            {/* Transaction Hash */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Tx Hash: {formatAddress(tx.txHash)}</span>
                <span>Block: {tx.blockNumber}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
