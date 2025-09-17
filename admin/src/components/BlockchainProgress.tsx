import { useEffect, useMemo, useState } from 'react'

type Step = {
  key: string
  label: string
  durationMs?: number
}

export default function BlockchainProgress({ open, onClose, onDone, title, steps }: {
  open: boolean
  onClose?: () => void
  onDone?: () => void
  title?: string
  steps?: Step[]
}) {
  const defaultSteps: Step[] = useMemo(() => steps || [
    { key: 'prepare', label: 'Preparing on-chain transaction', durationMs: 600 },
    { key: 'sign', label: 'Awaiting signature', durationMs: 800 },
    { key: 'broadcast', label: 'Broadcasting to network', durationMs: 700 },
    { key: 'confirm', label: 'Confirmations (2/2)', durationMs: 900 },
  ], [steps])

  const [current, setCurrent] = useState(0)
  const [txHash] = useState(() => generateTxHash())
  const [wallet] = useState(() => mockWallet())
  const [network] = useState(() => mockNetwork())

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setCurrent(0)
    const run = async () => {
      for (let i = 0; i < defaultSteps.length; i++) {
        if (cancelled) return
        setCurrent(i)
        await sleep(defaultSteps[i].durationMs || 700)
      }
      if (!cancelled) {
        onDone && onDone()
      }
    }
    run()
    return () => { cancelled = true }
  }, [open, defaultSteps, onDone])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center">⛓️</div>
            <div>
              <div className="text-lg font-bold text-gray-800">{title || 'Blockchain Transaction'}</div>
              <div className="text-xs text-gray-500">Simulated on-chain flow</div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-3">
          {defaultSteps.map((s, i) => (
            <div key={s.key} className={`flex items-center gap-3 p-3 rounded-xl border ${i < current ? 'bg-green-50 border-green-200' : i === current ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm ${i < current ? 'bg-green-500' : i === current ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`}>
                {i < current ? '✓' : i === current ? '…' : i + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">{s.label}</div>
                {i === current && (
                  <div className="w-full h-1 bg-white rounded-full overflow-hidden mt-2">
                    <div className="h-1 bg-gradient-to-r from-primary to-yellow-500 animate-pulse" style={{ width: '70%' }}></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard label="Network" value={`${network.name} (ChainId ${network.chainId})`} />
          <InfoCard label="Wallet" value={`${wallet.name} • ${shorten(wallet.address)}`} />
          <InfoCard label="Gas" value={`${network.gasPriceGwei} Gwei (est.)`} />
          <InfoCard label="Tx Hash" value={shorten(txHash)} link={`https://explorer.example/tx/${txHash}`} />
        </div>

        <div className="mt-4 text-right">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">Close</button>
        </div>
      </div>
    </div>
  )
}

function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)) }

function generateTxHash() {
  const chars = 'abcdef0123456789'
  let out = '0x'
  for (let i = 0; i < 64; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

function shorten(h: string) {
  return h.slice(0, 10) + '…' + h.slice(-6)
}

function mockWallet() {
  return { name: 'MetaMask', address: generateAddress() }
}

function mockNetwork() {
  return { name: 'EVM Testnet', chainId: 80001, gasPriceGwei: (Math.random()*10+20).toFixed(2) }
}

function generateAddress() {
  const chars = 'abcdef0123456789'
  let out = '0x'
  for (let i = 0; i < 40; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

function InfoCard({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        {link ? (
          <a href={link} target="_blank" rel="noreferrer" className="font-mono text-indigo-600 hover:underline">{value}</a>
        ) : (
          <code className="font-mono">{value}</code>
        )}
      </div>
    </div>
  )
}


