import { useEffect, useState, useRef } from 'react'

interface Node {
  id: string
  type: 'buyer' | 'seller' | 'intermediate'
  x: number
  y: number
  label: string
  createdAt: number
  connections: string[]
}

interface NodeEvent {
  id: string
  message: string
  timestamp: number
  type: 'created' | 'connected' | 'active'
}

export default function NetworkNodes() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [events, setEvents] = useState<NodeEvent[]>([])
  const [isSimulating, setIsSimulating] = useState(true)
  const canvasRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    // Initialize with buyer and seller nodes
    const initialNodes: Node[] = [
      {
        id: 'buyer-1',
        type: 'buyer',
        x: 20,
        y: 30,
        label: 'Buyer',
        createdAt: Date.now(),
        connections: []
      },
      {
        id: 'seller-1',
        type: 'seller',
        x: 80,
        y: 30,
        label: 'Seller',
        createdAt: Date.now(),
        connections: []
      }
    ]
    setNodes(initialNodes)

    // Start simulation
    const interval = setInterval(() => {
      if (isSimulating) {
        createNewNode()
      }
    }, 3000) // Create a new node every 3 seconds

    return () => {
      clearInterval(interval)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isSimulating])

  useEffect(() => {
    // Animate node positions
    const animate = () => {
      setNodes(prevNodes => {
        if (prevNodes.length <= 2) return prevNodes

        return prevNodes.map(node => {
          if (node.type === 'buyer' || node.type === 'seller') return node

          // Calculate position based on buyer and seller positions
          const buyer = prevNodes.find(n => n.type === 'buyer')
          const seller = prevNodes.find(n => n.type === 'seller')
          
          if (buyer && seller) {
            // Position intermediate nodes between buyer and seller
            const totalNodes = prevNodes.filter(n => n.type === 'intermediate').length
            const index = prevNodes.filter(n => n.type === 'intermediate').indexOf(node)
            const spacing = 100
            const startX = 150
            const startY = 200
            
            return {
              ...node,
              x: startX + (index * spacing),
              y: startY + Math.sin(index * 0.5) * 30
            }
          }
          return node
        })
      })
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    if (nodes.length > 2) {
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [nodes.length])

  const createNewNode = () => {
    const nodeId = `node-${Date.now()}`
    const buyer = nodes.find(n => n.type === 'buyer')
    const seller = nodes.find(n => n.type === 'seller')
    
    if (!buyer || !seller) return

    const intermediateNodes = nodes.filter(n => n.type === 'intermediate')
    const spacing = 100
    const startX = 150
    const startY = 200
    const index = intermediateNodes.length

    const newNode: Node = {
      id: nodeId,
      type: 'intermediate',
      x: startX + (index * spacing),
      y: startY + Math.sin(index * 0.5) * 30,
      label: `Node ${intermediateNodes.length + 1}`,
      createdAt: Date.now(),
      connections: [buyer.id, seller.id]
    }

    setNodes(prev => [...prev, newNode])

    // Add event
    const event: NodeEvent = {
      id: `event-${Date.now()}`,
      message: `Node ${intermediateNodes.length + 1} created`,
      timestamp: Date.now(),
      type: 'created'
    }

    setEvents(prev => [event, ...prev].slice(0, 10)) // Keep last 10 events

    // Add connection event after a delay
    setTimeout(() => {
      const connectionEvent: NodeEvent = {
        id: `event-conn-${Date.now()}`,
        message: `Node ${intermediateNodes.length + 1} connected to network`,
        timestamp: Date.now(),
        type: 'connected'
      }
      setEvents(prev => [connectionEvent, ...prev].slice(0, 10))
    }, 500)
  }

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'buyer':
        return 'bg-blue-500'
      case 'seller':
        return 'bg-green-500'
      case 'intermediate':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'buyer':
        return '🛒'
      case 'seller':
        return '🏷️'
      case 'intermediate':
        return '🔗'
      default:
        return '●'
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              🌐
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Network Nodes</h3>
              <p className="text-sm text-gray-600">Real-time node simulation between buyers and sellers</p>
            </div>
          </div>
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isSimulating
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isSimulating ? '⏸️ Pause' : '▶️ Resume'}
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Network Visualization */}
          <div className="lg:col-span-2">
            <div
              ref={canvasRef}
              className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 h-96 overflow-hidden"
            >
              {/* SVG for connections */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                {nodes
                  .filter(node => node.type === 'intermediate')
                  .map(node => {
                    const buyer = nodes.find(n => n.type === 'buyer')
                    const seller = nodes.find(n => n.type === 'seller')
                    return (
                      <g key={`connections-${node.id}`}>
                        {buyer && (
                          <line
                            x1={`${buyer.x}%`}
                            y1={`${buyer.y}%`}
                            x2={`${node.x}%`}
                            y2={`${node.y}%`}
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            opacity="0.4"
                          />
                        )}
                        {seller && (
                          <line
                            x1={`${seller.x}%`}
                            y1={`${seller.y}%`}
                            x2={`${node.x}%`}
                            y2={`${node.y}%`}
                            stroke="#10b981"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            opacity="0.4"
                          />
                        )}
                      </g>
                    )
                  })}
              </svg>

              {/* Nodes */}
              {nodes.map((node, index) => (
                <div
                  key={node.id}
                  className={`absolute ${getNodeColor(node.type)} rounded-full shadow-lg flex items-center justify-center text-white font-bold transform transition-all duration-500 ${
                    node.type === 'intermediate' ? 'animate-pulse' : ''
                  }`}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    width: node.type === 'intermediate' ? '60px' : '80px',
                    height: node.type === 'intermediate' ? '60px' : '80px',
                    transform: `translate(-50%, -50%) scale(${node.type === 'intermediate' && index === nodes.length - 1 ? 1.2 : 1})`,
                    zIndex: 10,
                    animation: node.type === 'intermediate' && index === nodes.length - 1 ? 'pulse 1s infinite' : undefined
                  }}
                  title={node.label}
                >
                  <span className="text-2xl">{getNodeIcon(node.type)}</span>
                </div>
              ))}

              {/* Node Labels */}
              {nodes.map(node => (
                <div
                  key={`label-${node.id}`}
                  className="absolute text-xs font-semibold text-gray-700 bg-white px-2 py-1 rounded shadow-sm"
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y + 5}%`,
                    transform: 'translate(-50%, 0)',
                    zIndex: 11
                  }}
                >
                  {node.label}
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{nodes.filter(n => n.type === 'buyer').length}</div>
                <div className="text-xs text-blue-600">Buyers</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
                <div className="text-2xl font-bold text-purple-700">{nodes.filter(n => n.type === 'intermediate').length}</div>
                <div className="text-xs text-purple-600">Nodes</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                <div className="text-2xl font-bold text-green-700">{nodes.filter(n => n.type === 'seller').length}</div>
                <div className="text-xs text-green-600">Sellers</div>
              </div>
            </div>
          </div>

          {/* Event Log */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl border border-gray-200 h-96 overflow-hidden flex flex-col">
              <div className="p-4 border-b bg-gray-100">
                <h4 className="font-semibold text-gray-800">Node Events</h4>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {events.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-8">
                    <div className="text-4xl mb-2">📡</div>
                    <div>Waiting for node events...</div>
                  </div>
                ) : (
                  events.map(event => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border-l-4 animate-slide-in ${
                        event.type === 'created'
                          ? 'bg-blue-50 border-blue-500'
                          : event.type === 'connected'
                          ? 'bg-green-50 border-green-500'
                          : 'bg-purple-50 border-purple-500'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">
                          {event.type === 'created' ? '✨' : event.type === 'connected' ? '🔗' : '⚡'}
                        </span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">{event.message}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

