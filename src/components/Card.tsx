import { Card as HeroUICard, CardProps as HeroUICardProps } from '@heroui/react'
import { cn } from '@/utils'

interface CardComponentProps extends HeroUICardProps {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  isHoverable?: boolean
  shadow?: 'none' | 'sm' | 'md' | 'lg'
}

export function CardComponent({ 
  children, 
  header, 
  footer,
  className,
  isHoverable = false,
  shadow = 'md',
  ...props
}: CardComponentProps) {
  return (
    <HeroUICard 
      isHoverable={isHoverable} 
      shadow={shadow}
      className={cn('p-0', className)}
      {...props}
    >
      {header && (
        <div className="px-6 py-4 border-b border-border">{header}</div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-border bg-secondary/50">{footer}</div>
      )}
    </HeroUICard>
  )
}
