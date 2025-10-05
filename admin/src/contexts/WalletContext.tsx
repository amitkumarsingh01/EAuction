import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface WalletContextType {
  isConnected: boolean
  account: string | null
  balance: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  isLoading: boolean
  error: string | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if already connected on load
  useEffect(() => {
    const savedAccount = localStorage.getItem('local_wallet_account')
    if (savedAccount) {
      setAccount(savedAccount)
      setBalance('10.0') // Mock local balance
      setIsConnected(true)
    }
  }, [])

  const connectWallet = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate mock local account
      const mockAccount = generateLocalAddress()
      setAccount(mockAccount)
      setBalance('10.0') // Mock local balance
      setIsConnected(true)
      
      // Save to localStorage for persistence
      localStorage.setItem('local_wallet_account', mockAccount)
    } catch (error: any) {
      setError('Failed to connect local wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAccount(null)
    setBalance(null)
    setError(null)
    localStorage.removeItem('local_wallet_account')
  }

  const generateLocalAddress = () => {
    const chars = 'abcdef0123456789'
    let address = '0x'
    for (let i = 0; i < 40; i++) {
      address += chars[Math.floor(Math.random() * chars.length)]
    }
    return address
  }

  const value: WalletContextType = {
    isConnected,
    account,
    balance,
    connectWallet,
    disconnectWallet,
    isLoading,
    error
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
