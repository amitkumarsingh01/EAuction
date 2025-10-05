// Local Blockchain Service - Completely Local Implementation
export interface AuctionData {
  id: string
  seller: string
  highestBidder: string
  highestBid: string
  endTime: number
  isActive: boolean
}

export interface BidData {
  auctionId: string
  bidder: string
  amount: string
  timestamp: number
}

class LocalBlockchainService {
  private auctions: Map<string, AuctionData> = new Map()
  private bids: Map<string, BidData[]> = new Map()

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    const mockAuction: AuctionData = {
      id: 'local-auction-1',
      seller: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      highestBidder: '0x8ba1f109551bD432803012645Hac136c22C172e8',
      highestBid: '1.5',
      endTime: Date.now() + 3600000, // 1 hour from now
      isActive: true
    }

    this.auctions.set(mockAuction.id, mockAuction)
    this.bids.set(mockAuction.id, [
      {
        auctionId: mockAuction.id,
        bidder: '0x8ba1f109551bD432803012645Hac136c22C172e8',
        amount: '1.5',
        timestamp: Date.now() - 1800000 // 30 minutes ago
      },
      {
        auctionId: mockAuction.id,
        bidder: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '1.2',
        timestamp: Date.now() - 3600000 // 1 hour ago
      }
    ])
  }

  // Create an auction (local simulation)
  async createAuction(
    seller: string,
    startingPrice: string,
    duration: number
  ): Promise<string> {
    try {
      const auctionId = `local-auction-${Date.now()}`
      const auction: AuctionData = {
        id: auctionId,
        seller,
        highestBidder: '',
        highestBid: startingPrice,
        endTime: Date.now() + duration,
        isActive: true
      }

      this.auctions.set(auctionId, auction)
      this.bids.set(auctionId, [])

      console.log('Local auction created:', auction)
      return auctionId
    } catch (error) {
      console.error('Error creating local auction:', error)
      throw error
    }
  }

  // Place a bid (local simulation)
  async placeBid(
    auctionId: string,
    bidder: string,
    amount: string
  ): Promise<string> {
    try {
      const auction = this.auctions.get(auctionId)
      if (!auction) {
        throw new Error('Auction not found')
      }

      if (!auction.isActive) {
        throw new Error('Auction is not active')
      }

      if (parseFloat(amount) <= parseFloat(auction.highestBid)) {
        throw new Error('Bid must be higher than current highest bid')
      }

      // Update auction
      auction.highestBidder = bidder
      auction.highestBid = amount

      // Add bid to history
      const bid: BidData = {
        auctionId,
        bidder,
        amount,
        timestamp: Date.now()
      }

      const existingBids = this.bids.get(auctionId) || []
      existingBids.unshift(bid) // Add to beginning
      this.bids.set(auctionId, existingBids)

      console.log('Local bid placed:', bid)
      return `local-tx-${Date.now()}`
    } catch (error) {
      console.error('Error placing local bid:', error)
      throw error
    }
  }

  // End an auction (local simulation)
  async endAuction(auctionId: string): Promise<string> {
    try {
      const auction = this.auctions.get(auctionId)
      if (!auction) {
        throw new Error('Auction not found')
      }

      auction.isActive = false
      console.log('Local auction ended:', auctionId)
      return `local-tx-${Date.now()}`
    } catch (error) {
      console.error('Error ending local auction:', error)
      throw error
    }
  }

  // Get auction data
  async getAuctionData(auctionId: string): Promise<AuctionData | null> {
    try {
      const auction = this.auctions.get(auctionId)
      return auction || null
    } catch (error) {
      console.error('Error getting local auction data:', error)
      return null
    }
  }

  // Get bid history
  async getBidHistory(auctionId: string): Promise<BidData[]> {
    try {
      return this.bids.get(auctionId) || []
    } catch (error) {
      console.error('Error getting local bid history:', error)
      return []
    }
  }

  // Get all auctions
  async getAllAuctions(): Promise<AuctionData[]> {
    try {
      return Array.from(this.auctions.values())
    } catch (error) {
      console.error('Error getting all local auctions:', error)
      return []
    }
  }

  // Utility methods
  formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  generateTxHash(): string {
    const chars = 'abcdef0123456789'
    let hash = '0x'
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)]
    }
    return hash
  }
}

// Export singleton instance
export const localBlockchainService = new LocalBlockchainService()
export default localBlockchainService