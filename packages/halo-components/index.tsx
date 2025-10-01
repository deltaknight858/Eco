import { ReactNode, HTMLAttributes, ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { getProvenanceColor, stampProvenance, type ProvenanceTier } from './utils/provenance'

// Utility function for className merging
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// HaloButton Component
interface HaloButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  asChild?: boolean
}

const buttonVariants = {
  primary: 'bg-gradient-to-r from-orange-500 to-orange-600 text-black hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25',
  secondary: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/25',
  ghost: 'text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300 border border-transparent hover:border-cyan-400/30',
  outline: 'border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black'
}

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-base rounded-lg',
  lg: 'px-6 py-3 text-lg rounded-xl'
}

export const HaloButton = forwardRef<HTMLButtonElement, HaloButtonProps>(
  ({ variant = 'primary', size = 'md', children, className, asChild, ...props }, ref) => {
    const buttonClasses = cn(
      'inline-flex items-center justify-center font-medium transition-all duration-200 backdrop-blur-sm',
      buttonVariants[variant],
      buttonSizes[size],
      'hover:scale-105 active:scale-95',
      className
    )

    if (asChild && typeof children === 'object' && children !== null) {
      // For asChild, we'll just return the children with added classes
      const child = children as React.ReactElement
      return {
        ...child,
        props: {
          ...child.props,
          className: cn(buttonClasses, child.props.className),
          ref
        }
      }
    }

    return (
      <button ref={ref} className={buttonClasses} {...props}>
        {children}
      </button>
    )
  }
)

HaloButton.displayName = 'HaloButton'

// HaloCard Component
interface HaloCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass'
  glow?: 'primary' | 'secondary' | 'none'
  children: ReactNode
}

const cardVariants = {
  default: 'bg-gray-900/80 border border-gray-700',
  glass: 'bg-white/5 backdrop-blur-lg border border-white/10'
}

const cardGlows = {
  primary: 'shadow-lg shadow-cyan-500/20',
  secondary: 'shadow-lg shadow-purple-500/20',
  none: ''
}

export const HaloCard = forwardRef<HTMLDivElement, HaloCardProps>(
  ({ variant = 'glass', glow = 'primary', children, className, ...props }, ref) => {
    const cardClasses = cn(
      'p-6 rounded-lg transition-all duration-200',
      cardVariants[variant],
      cardGlows[glow],
      className
    )

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {children}
      </div>
    )
  }
)

HaloCard.displayName = 'HaloCard'

// HaloAlert Component
interface HaloAlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error' | 'provenance'
  children: ReactNode
}

const alertVariants = {
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  success: 'bg-green-500/10 border-green-500/30 text-green-400',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  error: 'bg-red-500/10 border-red-500/30 text-red-400',
  provenance: 'bg-yellow-400/10 border-yellow-400/60 text-yellow-100 shadow-yellow-400/50 shadow-lg'
}

export const HaloAlert = forwardRef<HTMLDivElement, HaloAlertProps>(
  ({ variant = 'info', children, className, ...props }, ref) => {
    const isProvenance = variant === 'provenance'
    
    const alertClasses = cn(
      'p-4 rounded-lg border backdrop-blur-sm',
      alertVariants[variant],
      isProvenance && 'animate-pulse',
      className
    )

    return (
      <div 
        ref={ref} 
        className={alertClasses} 
        {...(isProvenance ? stampProvenance('HaloAlert') : {})}
        {...props}
      >
        {isProvenance && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-400">🛡️</span>
            <span className="font-bold text-yellow-200">Provenance Verified</span>
          </div>
        )}
        {children}
      </div>
    )
  }
)

HaloAlert.displayName = 'HaloAlert'

// HaloBadge Component
interface HaloBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  tier?: ProvenanceTier // New provenance tier prop
  children: ReactNode
}

const badgeVariants = {
  primary: 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-black',
  secondary: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
  outline: 'border border-cyan-400 text-cyan-400 bg-transparent'
}

export const HaloBadge = forwardRef<HTMLSpanElement, HaloBadgeProps>(
  ({ variant = 'primary', tier, children, className, ...props }, ref) => {
    // If tier is provided, use provenance styling
    const provenanceColors = tier ? getProvenanceColor(tier) : null
    
    const badgeClasses = cn(
      'inline-block px-3 py-1 rounded-full text-xs font-bold transition-all duration-200',
      tier ? [
        `bg-gradient-to-r ${provenanceColors!.gradient}`,
        provenanceColors!.text,
        provenanceColors!.glow,
        'animate-pulse'
      ] : badgeVariants[variant],
      className
    )

    return (
      <span 
        ref={ref} 
        className={badgeClasses} 
        {...(tier ? stampProvenance('HaloBadge', tier) : {})}
        {...props}
      >
        {tier === 'gold' && '👑 '}{children}
      </span>
    )
  }
)

HaloBadge.displayName = 'HaloBadge'

// HaloTimeline Component
interface HaloTimelineProps extends HTMLAttributes<HTMLDivElement> {
  provenanceSteps?: boolean
  currentStep?: 'Created' | 'Reviewed' | 'Verified'
  steps?: Array<{ title: string; description?: string; completed?: boolean }>
}

export const HaloTimeline = forwardRef<HTMLDivElement, HaloTimelineProps>(
  ({ provenanceSteps = false, currentStep = 'Created', steps, className, ...props }, ref) => {
    const timelineSteps = provenanceSteps 
      ? [
          { title: 'Created', description: 'Initial contribution created', completed: true },
          { title: 'Reviewed', description: 'Peer review completed', completed: currentStep !== 'Created' },
          { title: 'Verified', description: 'Provenance verified', completed: currentStep === 'Verified' }
        ]
      : steps || []

    return (
      <div 
        ref={ref} 
        className={cn('space-y-4', className)}
        {...(provenanceSteps ? stampProvenance('HaloTimeline') : {})}
        {...props}
      >
        {timelineSteps.map((step, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className={cn(
              'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
              step.completed 
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-yellow-400/50 shadow-lg' 
                : 'bg-slate-700 text-slate-400 border border-slate-600'
            )}>
              {step.completed ? (
                provenanceSteps ? 
                  (step.title === 'Created' ? '✨' : step.title === 'Reviewed' ? '👁️' : '🛡️') 
                  : '✓'
              ) : (
                index + 1
              )}
            </div>
            <div className="flex-grow">
              <h3 className={cn(
                'font-semibold text-sm',
                step.completed ? 'text-yellow-200' : 'text-slate-400'
              )}>
                {step.title}
                {provenanceSteps && step.completed && step.title === currentStep && (
                  <span className="ml-2 text-xs text-yellow-400 animate-pulse">● Current</span>
                )}
              </h3>
              {step.description && (
                <p className={cn(
                  'text-xs mt-1',
                  step.completed ? 'text-slate-300' : 'text-slate-500'
                )}>
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }
)

HaloTimeline.displayName = 'HaloTimeline'