import { useWallet } from '../contexts/WalletContext'

interface MetaMaskButtonProps {
  className?: string
  showBalance?: boolean
}

export default function MetaMaskButton({ 
  className = '', 
  showBalance = false
}: MetaMaskButtonProps) {
  const {
    isConnected,
    account,
    balance,
    connectWallet,
    disconnectWallet,
    isLoading,
    error
  } = useWallet()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 text-red-500">⚠️</div>
          <div className="text-sm text-red-700">{error}</div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <button
        onClick={connectWallet}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors ${className}`}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <div className="w-4 h-4">🔗</div>
            <span>Connect Local Wallet</span>
          </>
        )}
      </button>
    )
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Balance */}
      {showBalance && balance && (
        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          {balance} ETH
        </div>
      )}

      {/* Account Info */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
        <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs">
          🔗
        </div>
        <div className="text-sm">
          <div className="font-medium text-gray-800">{formatAddress(account!)}</div>
          <div className="text-xs text-gray-500">Local Wallet</div>
        </div>
      </div>

      {/* Disconnect Button */}
      <button
        onClick={disconnectWallet}
        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
      >
        Disconnect
      </button>
    </div>
  )
}
