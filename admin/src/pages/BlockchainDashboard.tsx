import { useState, useEffect } from 'react'
import { useWallet } from '../contexts/WalletContext'
import BlockchainStatus from '../components/BlockchainStatus'
import BlockchainActivityFeed from '../components/BlockchainActivityFeed'
import BlockchainTransactionTracker from '../components/BlockchainTransactionTracker'
import BlockchainAuction from '../components/BlockchainAuction'

export default function BlockchainDashboard() {
  const { isConnected, account, balance } = useWallet()
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalVolume: '0',
    activeAuctions: 0,
    networkStatus: 'disconnected'
  })

  useEffect(() => {
    if (isConnected) {
      // Simulate real-time stats updates
      const interval = setInterval(() => {
        setStats(prev => ({
          totalTransactions: prev.totalTransactions + Math.floor(Math.random() * 3),
          totalVolume: (parseFloat(prev.totalVolume) + Math.random() * 0.5).toFixed(3),
          activeAuctions: Math.floor(Math.random() * 10) + 5,
          networkStatus: 'connected'
        }))
      }, 5000)

      return () => clearInterval(interval)
    } else {
      setStats(prev => ({
        ...prev,
        networkStatus: 'disconnected'
      }))
    }
  }, [isConnected])

  const getNetworkName = () => {
    return 'Local Blockchain Simulation'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
            ⛓️
          </div>
          <div>
            <h1 className="text-4xl font-bold">Blockchain Dashboard</h1>
            <p className="text-xl opacity-90">Real-time blockchain activity and analytics</p>
            {isConnected && (
              <div className="mt-2 text-sm opacity-80">
                Connected to Local Network • Balance: {balance} ETH
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="📊"
          label="Total Transactions"
          value={stats.totalTransactions}
          color="from-blue-500 to-blue-600"
          change="+12%"
          changeType="positive"
        />
        <StatCard
          icon="💰"
          label="Total Volume"
          value={`${stats.totalVolume} ETH`}
          color="from-green-500 to-green-600"
          change="+8.5%"
          changeType="positive"
        />
        <StatCard
          icon="🎯"
          label="Active Auctions"
          value={stats.activeAuctions}
          color="from-orange-500 to-orange-600"
          change="+3"
          changeType="positive"
        />
        <StatCard
          icon="🔗"
          label="Network Status"
          value={stats.networkStatus === 'connected' ? 'Online' : 'Offline'}
          color={stats.networkStatus === 'connected' ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'}
          change={stats.networkStatus === 'connected' ? 'Live' : 'Disconnected'}
          changeType={stats.networkStatus === 'connected' ? 'positive' : 'negative'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Status and Activity */}
        <div className="lg:col-span-1 space-y-6">
          <BlockchainStatus showDetails={true} />
          <BlockchainActivityFeed />
        </div>

        {/* Right Column - Transactions and Auctions */}
        <div className="lg:col-span-2 space-y-6">
          <BlockchainTransactionTracker />
          <BlockchainAuction auctionId="dashboard-auction-1" />
        </div>
      </div>

      {/* Network Information */}
      {isConnected && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Network Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">Current Network</div>
              <div className="font-semibold text-gray-800">{getNetworkName()}</div>
              <div className="text-xs text-gray-500 mt-1">Local Simulation</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">Connected Account</div>
              <div className="font-mono text-sm text-gray-800">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </div>
              <div className="text-xs text-gray-500 mt-1">MetaMask Wallet</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">Account Balance</div>
              <div className="font-bold text-gray-800">{balance} ETH</div>
              <div className="text-xs text-gray-500 mt-1">Native Token</div>
            </div>
          </div>
        </div>
      )}

      {/* Blockchain Features Overview */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Blockchain Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            icon="🎯"
            title="Smart Auctions"
            description="Decentralized auction contracts with automatic execution"
            status="active"
          />
          <FeatureCard
            icon="💰"
            title="Instant Bidding"
            description="Real-time bidding with immediate blockchain confirmation"
            status="active"
          />
          <FeatureCard
            icon="🔒"
            title="Secure Payments"
            description="Cryptocurrency payments with smart contract escrow"
            status="active"
          />
          <FeatureCard
            icon="📊"
            title="Transparent Records"
            description="Immutable transaction history on the blockchain"
            status="active"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color, 
  change, 
  changeType 
}: { 
  icon: string
  label: string
  value: string | number
  color: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
}) {
  return (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-white text-2xl`}>
          {icon}
        </div>
        {change && (
          <div className={`text-xs px-2 py-1 rounded-full ${
            changeType === 'positive' ? 'bg-green-100 text-green-700' :
            changeType === 'negative' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {change}
          </div>
        )}
      </div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
    </div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  status 
}: { 
  icon: string
  title: string
  description: string
  status: 'active' | 'coming-soon' | 'beta'
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{title}</h4>
          <div className={`text-xs px-2 py-1 rounded-full inline-block ${
            status === 'active' ? 'bg-green-100 text-green-700' :
            status === 'beta' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {status === 'active' ? 'Active' : status === 'beta' ? 'Beta' : 'Coming Soon'}
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
