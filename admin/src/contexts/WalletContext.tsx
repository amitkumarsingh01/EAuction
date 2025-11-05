import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

// MetaMask window interface
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, handler: (...args: any[]) => void) => void
      removeListener: (event: string, handler: (...args: any[]) => void) => void
      selectedAddress: string | null
    }
  }
}

interface WalletContextType {
  isConnected: boolean
  account: string | null
  balance: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  isLoading: boolean
  error: string | null
  isMetaMaskInstalled: boolean
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
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false)

  // Check if MetaMask is installed
  useEffect(() => {
    const checkMetaMask = () => {
      if (typeof window !== 'undefined' && window.ethereum?.isMetaMask) {
        setIsMetaMaskInstalled(true)
      } else {
        setIsMetaMaskInstalled(false)
      }
    }
    
    checkMetaMask()
    window.addEventListener('load', checkMetaMask)
    
    return () => {
      window.removeEventListener('load', checkMetaMask)
    }
  }, [])

  // Check if already connected on load
  useEffect(() => {
    if (!isMetaMaskInstalled) return

    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum?.request({ method: 'eth_accounts' })
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0])
          await updateBalance(accounts[0])
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }

    checkConnection()

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setIsConnected(false)
        setAccount(null)
        setBalance(null)
      } else {
        setAccount(accounts[0])
        updateBalance(accounts[0])
        setIsConnected(true)
      }
    }

    window.ethereum?.on('accountsChanged', handleAccountsChanged)

    // Listen for chain changes
    const handleChainChanged = () => {
      window.location.reload()
    }

    window.ethereum?.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum?.removeListener('chainChanged', handleChainChanged)
    }
  }, [isMetaMaskInstalled])

  const updateBalance = async (address: string) => {
    try {
      const balance = await window.ethereum?.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      })
      
      if (balance) {
        // Convert from wei to ETH
        const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4)
        setBalance(balanceInEth)
      }
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      setError('MetaMask is not installed. Please install MetaMask to continue.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Request account access
      const accounts = await window.ethereum?.request({
        method: 'eth_requestAccounts'
      })

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0])
        await updateBalance(accounts[0])
        setIsConnected(true)
      } else {
        throw new Error('No accounts found')
      }
    } catch (error: any) {
      if (error.code === 4001) {
        setError('Please connect to MetaMask')
      } else {
        setError(error.message || 'Failed to connect wallet')
      }
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAccount(null)
    setBalance(null)
    setError(null)
  }

  const value: WalletContextType = {
    isConnected,
    account,
    balance,
    connectWallet,
    disconnectWallet,
    isLoading,
    error,
    isMetaMaskInstalled
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
