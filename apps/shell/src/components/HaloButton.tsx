import { ReactNode, HTMLAttributes } from 'react'
import { cn } from '../utils/cn'

interface HaloButtonProps extends HTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  asChild?: boolean
}

const buttonVariants = {
  primary: 'bg-gradient-to-r from-eco-orange to-orange-400 text-black hover:from-orange-500 hover:to-orange-600 shadow-lg shadow-orange-500/25',
  secondary: 'bg-gradient-to-r from-eco-purple to-purple-400 text-white hover:from-purple-500 hover:to-purple-600 shadow-lg shadow-purple-500/25',
  ghost: 'text-eco-cyan hover:bg-eco-cyan/10 hover:text-eco-cyan border border-transparent hover:border-eco-cyan/30',
  outline: 'border border-eco-cyan text-eco-cyan hover:bg-eco-cyan hover:text-black'
}

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-base rounded-lg',
  lg: 'px-6 py-3 text-lg rounded-xl'
}

export const HaloButton = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className, 
  asChild,
  ...props 
}: HaloButtonProps) => {
  const buttonClasses = cn(
    'inline-flex items-center justify-center font-medium transition-all duration-200 backdrop-blur-sm',
    buttonVariants[variant],
    buttonSizes[size],
    'hover:scale-105 active:scale-95',
    className
  )

  if (asChild && typeof children === 'object' && children !== null) {
    // Clone the child element and add our classes
    const child = children as React.ReactElement
    return {
      ...child,
      props: {
        ...child.props,
        className: cn(buttonClasses, child.props.className)
      }
    }
  }

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  )
}