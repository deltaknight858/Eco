import React, { useMemo } from 'react'
import { cn } from '@eco/halo-components'
import type { AgentEventSeverity, ProvenanceTier } from '../../types'
import './NeonGlassIconStream.css'

export type NeonGlassStatus = 'idle' | 'active' | 'error' | 'success'

export interface NeonGlassIconStreamProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode
  label?: string
  status?: NeonGlassStatus
  severity?: AgentEventSeverity
  provenanceTier?: ProvenanceTier
  intensity?: number
  glow?: boolean
  size?: 'sm' | 'md' | 'lg'
  crown?: boolean
}

const SIZE_MAP: Record<Required<NeonGlassIconStreamProps>['size'], string> = {
  sm: 'w-10 h-10 text-base',
  md: 'w-14 h-14 text-2xl',
  lg: 'w-20 h-20 text-3xl'
}

const STATUS_BORDER: Record<NeonGlassStatus, string> = {
  idle: 'border-slate-600/40',
  active: 'border-cyan-400/60',
  error: 'border-rose-400/70',
  success: 'border-emerald-400/70'
}

const STATUS_BACKGROUND: Record<NeonGlassStatus, string> = {
  idle: 'bg-slate-900/70',
  active: 'bg-cyan-500/15 backdrop-blur',
  error: 'bg-rose-500/20 backdrop-blur',
  success: 'bg-emerald-500/20 backdrop-blur'
}

function crownGradient(tier?: ProvenanceTier) {
  switch (tier) {
    case 'gold':
      return 'from-yellow-500 via-amber-200 to-yellow-400'
    case 'silver':
      return 'from-slate-300 via-slate-100 to-slate-300'
    case 'bronze':
      return 'from-amber-500 via-orange-300 to-amber-400'
    default:
      return 'from-cyan-400 via-sky-300 to-cyan-200'
  }
}

export const NeonGlassIconStream: React.FC<NeonGlassIconStreamProps> = ({
  icon,
  label,
  className,
  status = 'idle',
  severity,
  provenanceTier,
  intensity = 0,
  glow = true,
  size = 'md',
  crown = false,
  ...rest
}) => {
  const effectiveStatus: NeonGlassStatus = useMemo(() => {
    if (severity === 'error') return 'error'
    if (severity === 'success') return 'success'
    return status
  }, [severity, status])

  const glowLevel = useMemo(() => {
    if (!glow) return 'off'
    if (intensity < 15) return 'off'
    if (intensity < 35) return 'low'
    if (intensity < 65) return 'medium'
    return 'high'
  }, [glow, intensity])

  const tierClass = provenanceTier ? `stream-tier-${provenanceTier}` : undefined
  const glowClass = `stream-glow-${glowLevel}`

  const intensityClass = useMemo(() => {
    if (intensity < 20) return 'opacity-80'
    if (intensity < 50) return 'opacity-90'
    return 'opacity-100'
  }, [intensity])

  return (
    <div className="flex flex-col items-center space-y-2" {...rest}>
      <div
        className={cn(
          'neon-glass-icon-stream rounded-full border-2 transition-all duration-300 ease-out flex items-center justify-center select-none',
          STATUS_BORDER[effectiveStatus],
          STATUS_BACKGROUND[effectiveStatus],
          SIZE_MAP[size],
          intensityClass,
          tierClass,
          glowClass,
          crown && 'pt-4'
        )}
      >
        {crown && (
          <div className="absolute -top-3 flex items-center justify-center">
            <div
              className={cn(
                'w-8 h-4 rounded-t-full bg-gradient-to-r shadow-lg shadow-yellow-200/40',
                `from-yellow-500 via-amber-200 to-yellow-500`,
                `bg-gradient-to-r ${crownGradient(provenanceTier)}`
              )}
            >
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-900 font-semibold">
                👑
              </div>
            </div>
          </div>
        )}
        <span>{icon}</span>
      </div>
      {label && (
        <div className="text-xs text-slate-300 uppercase tracking-wide">
          {label}
        </div>
      )}
    </div>
  )
}

export default NeonGlassIconStream
