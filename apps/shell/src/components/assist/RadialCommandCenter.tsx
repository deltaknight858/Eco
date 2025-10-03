/**
 * RadialCommandCenter.tsx
 * Floating action menu used across Assist and Pathways.
 * Lightweight implementation tailored to PathwaysLauncher expected props.
 */

'use client'

import React, { useState } from 'react'
import { cn } from '@eco/halo-components'

export type RCPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

export interface RadialAction {
  id: string
  icon?: React.ReactNode | string
  label: string
  description?: string
  onClick: () => void
  disabled?: boolean
  color?: string
  badge?: string
  metadata?: Record<string, any>
}

export interface RadialCommandCenterProps {
  variant?: string
  position?: RCPosition
  offset?: { x: number; y: number }
  actions: RadialAction[]
  tier?: 'bronze' | 'silver' | 'gold'
  animated?: boolean
  className?: string
  triggerIcon?: React.ReactNode | string
  triggerLabel?: string
  triggerDescription?: string
}

export const RadialCommandCenter: React.FC<RadialCommandCenterProps> = ({
  variant = 'default',
  position = 'bottom-right',
  offset = { x: 24, y: 24 },
  actions,
  tier,
  animated = true,
  className,
  triggerIcon = '⚡',
  triggerLabel,
  triggerDescription
}) => {
  const [open, setOpen] = useState(false)

  const rootPosition = (() => {
    const base = 'fixed z-50'
    const pos = {
      'bottom-right': `bottom-[${offset.y}px] right-[${offset.x}px]`,
      'bottom-left': `bottom-[${offset.y}px] left-[${offset.x}px]`,
      'top-right': `top-[${offset.y}px] right-[${offset.x}px]`,
      'top-left': `top-[${offset.y}px] left-[${offset.x}px]`
    }[position]
    return cn(base, pos)
  })()

  const tierRing = tier === 'gold' ? 'ring-yellow-400/40' : tier === 'silver' ? 'ring-gray-300/40' : tier === 'bronze' ? 'ring-orange-400/40' : 'ring-cyan-400/30'

  return (
    <div className={cn(rootPosition, className)}>
      {/* Expanded list */}
      {open && (
        <div
          className={cn(
            'absolute w-72 rc-menu',
            position.startsWith('bottom') ? 'bottom-20' : 'top-20',
            position.endsWith('right') ? 'right-0' : 'left-0'
          )}
        >
          <div className={cn(
            'rounded-xl border backdrop-blur-md bg-slate-900/90 border-cyan-400/20 p-2 space-y-2 shadow-lg',
            animated && 'animate-in fade-in slide-in-from-bottom-2 duration-200'
          )}>
            {triggerLabel && (
              <div className="px-2 py-1">
                <div className="text-cyan-200 text-sm font-medium">{triggerLabel}</div>
                {triggerDescription && (
                  <div className="text-slate-400 text-xs">{triggerDescription}</div>
                )}
              </div>
            )}

            {actions.map((a, i) => (
              <button
                key={a.id}
                className={cn(
                  'rc-action w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all',
                  'bg-gradient-to-r from-slate-800/70 to-slate-900/70 hover:from-cyan-500/10 hover:to-cyan-600/10',
                  'border border-cyan-400/20 hover:border-cyan-400/40',
                  a.disabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => !a.disabled && (setOpen(false), a.onClick())}
                disabled={a.disabled}
                title={a.description}
              >
                <span className="text-lg" aria-hidden>{a.icon}</span>
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">{a.label}</div>
                  {a.description && <div className="text-xs text-slate-400">{a.description}</div>}
                </div>
                {a.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-200 border border-slate-600">
                    {a.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center text-xl',
          'bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-md',
          'border-2 border-cyan-400/40 hover:border-cyan-400/80',
          'shadow-lg hover:shadow-cyan-400/30 hover:shadow-xl transition-all duration-300 hover:scale-110',
          open && 'rotate-45',
          tierRing
        )}
        aria-label={triggerLabel || 'Open command center'}
      >
        {typeof triggerIcon === 'string' ? <span aria-hidden>{triggerIcon}</span> : triggerIcon}
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] -z-10" onClick={() => setOpen(false)} />
      )}

      {/* Component styles */}
      <style>{`
        .rc-menu .rc-action { animation: rcc-fade-in 200ms ease-out both; }
        .rc-menu .rc-action:nth-child(1) { animation-delay: 0ms; }
        .rc-menu .rc-action:nth-child(2) { animation-delay: 30ms; }
        .rc-menu .rc-action:nth-child(3) { animation-delay: 60ms; }
        .rc-menu .rc-action:nth-child(4) { animation-delay: 90ms; }
        .rc-menu .rc-action:nth-child(5) { animation-delay: 120ms; }
        .rc-menu .rc-action:nth-child(6) { animation-delay: 150ms; }
        @keyframes rcc-fade-in {
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

export default RadialCommandCenter