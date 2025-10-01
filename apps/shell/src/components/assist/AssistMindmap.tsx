/**
 * AssistMindmap.tsx
 * Based on V.I.B.E/packages/ui/D3MindMap.tsx
 * 
 * Interactive D3 visualization for agent relationships and dependencies
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@eco/halo-components'

interface MindMapNode {
  id: string
  label: string
  type: 'agent' | 'task' | 'dependency' | 'output'
  tier?: 'bronze' | 'silver' | 'gold'
  status?: 'active' | 'idle' | 'error' | 'complete'
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface MindMapLink {
  source: string | MindMapNode
  target: string | MindMapNode
  type: 'orchestrates' | 'depends' | 'produces' | 'consumes'
  strength?: number
}

interface AssistMindmapProps {
  nodes: MindMapNode[]
  links: MindMapLink[]
  onNodeClick?: (node: MindMapNode) => void
  onNodeHover?: (node: MindMapNode | null) => void
  className?: string
  width?: number
  height?: number
}

export function AssistMindmap({
  nodes,
  links,
  onNodeClick,
  onNodeHover,
  className,
  width = 800,
  height = 600
}: AssistMindmapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<any>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  useEffect(() => {
    if (!svgRef.current || typeof window === 'undefined') return

    // Dynamically import D3 to avoid SSR issues
    const initializeD3 = async () => {
      const d3 = await import('d3')
      
      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove() // Clear previous renders

      // Create container groups
      const container = svg.append('g')
      const linkGroup = container.append('g').attr('class', 'links')
      const nodeGroup = container.append('g').attr('class', 'nodes')
      const labelGroup = container.append('g').attr('class', 'labels')

      // Add zoom behavior
      const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
          container.attr('transform', event.transform)
        })

      svg.call(zoom as any)

      // Create simulation
      const simulation = d3.forceSimulation(nodes as any)
        .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(30))

      simulationRef.current = simulation

      // Color schemes for different elements
      const getNodeColor = (node: MindMapNode) => {
        if (node.id === selectedNode) return '#06b6d4' // cyan-500
        if (node.id === hoveredNode) return '#0891b2' // cyan-600
        
        switch (node.type) {
          case 'agent': return '#6366f1' // indigo-500
          case 'task': return '#8b5cf6' // violet-500
          case 'dependency': return '#f59e0b' // amber-500
          case 'output': return '#10b981' // emerald-500
          default: return '#64748b' // slate-500
        }
      }

      const getTierColor = (tier?: string) => {
        switch (tier) {
          case 'gold': return '#eab308' // yellow-500
          case 'silver': return '#94a3b8' // slate-400
          case 'bronze': return '#f97316' // orange-500
          default: return '#64748b' // slate-500
        }
      }

      const getStatusColor = (status?: string) => {
        switch (status) {
          case 'active': return '#10b981' // emerald-500
          case 'idle': return '#64748b' // slate-500
          case 'error': return '#ef4444' // red-500
          case 'complete': return '#06b6d4' // cyan-500
          default: return '#64748b' // slate-500
        }
      }

      // Create links
      const link = linkGroup
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke', '#374151') // gray-700
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', (d: any) => {
          switch (d.type) {
            case 'depends': return '5,5'
            case 'produces': return '10,2'
            case 'consumes': return '2,2'
            default: return null
          }
        })

      // Create nodes
      const node = nodeGroup
        .selectAll('g')
        .data(nodes)
        .join('g')
        .attr('cursor', 'pointer')
        .call(
          d3.drag()
            .on('start', (event, d: any) => {
              if (!event.active) simulation.alphaTarget(0.3).restart()
              d.fx = d.x
              d.fy = d.y
            })
            .on('drag', (event, d: any) => {
              d.fx = event.x
              d.fy = event.y
            })
            .on('end', (event, d: any) => {
              if (!event.active) simulation.alphaTarget(0)
              d.fx = null
              d.fy = null
            }) as any // <-- Fix: cast drag behavior to any
        )

      // Node circles
      node.append('circle')
        .attr('r', (d: any) => {
          switch (d.type) {
            case 'agent': return 20
            case 'task': return 15
            default: return 12
          }
        })
        .attr('fill', (d: any) => getNodeColor(d))
        .attr('stroke', (d: any) => d.tier ? getTierColor(d.tier) : '#374151')
        .attr('stroke-width', 2)

      // Status indicators
      node.filter((d: any) => d.status)
        .append('circle')
        .attr('r', 4)
        .attr('cx', 15)
        .attr('cy', -15)
        .attr('fill', (d: any) => getStatusColor(d.status))
        .attr('stroke', '#1f2937')
        .attr('stroke-width', 1)

      // Node icons/emojis
      node.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', (d: any) => d.type === 'agent' ? '16px' : '12px')
        .text((d: any) => {
          switch (d.type) {
            case 'agent': return '🤖'
            case 'task': return '⚡'
            case 'dependency': return '📦'
            case 'output': return '📄'
            default: return '●'
          }
        })

      // Node labels
      const label = labelGroup
        .selectAll('text')
        .data(nodes)
        .join('text')
        .attr('text-anchor', 'middle')
        .attr('dy', -25)
        .attr('font-size', '12px')
        .attr('fill', '#e2e8f0') // slate-200
        .attr('font-weight', 'bold')
        .text((d: any) => d.label)

      // Event handlers
      node
        .on('click', (event, d: any) => {
          setSelectedNode(d.id === selectedNode ? null : d.id)
          onNodeClick?.(d)
        })
        .on('mouseenter', (event, d: any) => {
          setHoveredNode(d.id)
          onNodeHover?.(d)
        })
        .on('mouseleave', () => {
          setHoveredNode(null)
          onNodeHover?.(null)
        })

      // Update positions on tick
      simulation.on('tick', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y)

        node
          .attr('transform', (d: any) => `translate(${d.x},${d.y})`)

        label
          .attr('x', (d: any) => d.x)
          .attr('y', (d: any) => d.y)
      })

      // Update colors when selection changes
      node.selectAll('circle')
        .attr('fill', (d: any) => getNodeColor(d))
    }

    initializeD3()

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
    }
  }, [nodes, links, selectedNode, hoveredNode, width, height, onNodeClick, onNodeHover])

  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-slate-900/50 border border-slate-700/50', className)}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full"
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#374151" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#374151" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm border border-slate-600/50 rounded-lg p-3 text-xs">
        <div className="font-semibold text-slate-200 mb-2">Legend</div>
        <div className="space-y-1 text-slate-300">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            <span>Agent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-violet-500" />
            <span>Task</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Dependency</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Output</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <button
          onClick={() => {
            if (simulationRef.current) {
              simulationRef.current.alpha(1).restart()
            }
          }}
          className="block w-full px-3 py-2 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-600/50 hover:border-slate-500/50 rounded-lg text-slate-200 text-xs transition-colors"
        >
          Reset Layout
        </button>
        <button
          onClick={() => setSelectedNode(null)}
          className="block w-full px-3 py-2 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-600/50 hover:border-slate-500/50 rounded-lg text-slate-200 text-xs transition-colors"
        >
          Clear Selection
        </button>
      </div>
    </div>
  )
}