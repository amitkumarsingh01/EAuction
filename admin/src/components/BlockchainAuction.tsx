import { useState, useEffect } from 'react'
import { useWallet } from '../contexts/WalletContext'
import { localBlockchainService } from '../services/blockchain'
import type { AuctionData, BidData } from '../services/blockchain'
import BlockchainProgress from './BlockchainProgress'

interface BlockchainAuctionProps {
  auctionId?: string
}

export default function BlockchainAuction({ auctionId = 'local-auction-1' }: BlockchainAuctionProps) {
  const { isConnected, account } = useWallet()
  const [auction, setAuction] = useState<AuctionData | null>(null)
  const [bidHistory, setBidHistory] = useState<BidData[]>([])
  const [bidAmount, setBidAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showProgress, setShowProgress] = useState(false)

  useEffect(() => {
    loadAuctionData()
  }, [auctionId])

  const loadAuctionData = async () => {
    try {
      const auctionData = await localBlockchainService.getAuctionData(auctionId)
      const bidData = await localBlockchainService.getBidHistory(auctionId)
      setAuction(auctionData)
      setBidHistory(bidData)
    } catch (error) {
      console.error('Error loading auction data:', error)
    }
  }

  const handlePlaceBid = async () => {
    if (!isConnected || !account || !bidAmount) return

    setIsLoading(true)
    setShowProgress(true)

    try {
      await localBlockchainService.placeBid(auctionId, account, bidAmount)
      
      // Reload auction data after successful bid
      setTimeout(() => {
        loadAuctionData()
        setBidAmount('')
      }, 3000)
    } catch (error) {
      console.error('Error placing bid:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndAuction = async () => {
    if (!isConnected || !account) return

    setIsLoading(true)
    setShowProgress(true)

    try {
      await localBlockchainService.endAuction(auctionId)
      
      // Reload auction data
      setTimeout(() => {
        loadAuctionData()
      }, 3000)
    } catch (error) {
      console.error('Error ending auction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!auction) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Auction Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
              🔗
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Local Auction #{auctionId}</h3>
              <p className="text-sm text-gray-500">Local blockchain simulation</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            auction.isActive 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {auction.isActive ? 'Active' : 'Ended'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-sm text-gray-500 mb-1">Seller</div>
            <div className="font-mono text-sm">{formatAddress(auction.seller)}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-sm text-gray-500 mb-1">Highest Bid</div>
            <div className="text-lg font-bold text-green-600">{auction.highestBid} ETH</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-sm text-gray-500 mb-1">End Time</div>
            <div className="text-sm">{formatTime(auction.endTime)}</div>
          </div>
        </div>

        {/* Bid Form */}
        {isConnected && auction.isActive && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Place Bid (ETH)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={parseFloat(auction.highestBid) + 0.01}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={`Min: ${parseFloat(auction.highestBid) + 0.01}`}
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handlePlaceBid}
                  disabled={isLoading || !bidAmount || parseFloat(bidAmount) <= parseFloat(auction.highestBid)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Place Bid'}
                </button>
                {account === auction.seller && (
                  <button
                    onClick={handleEndAuction}
                    disabled={isLoading}
                    className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                  >
                    End Auction
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {!isConnected && (
          <div className="border-t border-gray-200 pt-6">
            <div className="text-center py-4">
              <p className="text-gray-500 mb-4">Connect your local wallet to participate in this auction</p>
            </div>
          </div>
        )}
      </div>

      {/* Bid History */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Bid History</h4>
        {bidHistory.length > 0 ? (
          <div className="space-y-3">
            {bidHistory.map((bid, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-mono text-sm">{formatAddress(bid.bidder)}</div>
                    <div className="text-xs text-gray-500">{formatTime(bid.timestamp)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{bid.amount} ETH</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No bids placed yet
          </div>
        )}
      </div>

      {/* Blockchain Progress Modal */}
      <BlockchainProgress
        open={showProgress}
        onClose={() => setShowProgress(false)}
        onDone={() => setShowProgress(false)}
        title="Processing Local Transaction"
        steps={[
          { key: 'prepare', label: 'Preparing local transaction', durationMs: 800 },
          { key: 'validate', label: 'Validating bid', durationMs: 600 },
          { key: 'update', label: 'Updating local state', durationMs: 500 },
          { key: 'confirm', label: 'Transaction confirmed', durationMs: 400 }
        ]}
      />
    </div>
  )
}