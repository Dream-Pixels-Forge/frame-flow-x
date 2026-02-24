import { Tooltip } from '@heroui/react'
import { cn } from '@/utils'

interface TooltipComponentProps {
  content: React.ReactNode
  children: React.ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  delay?: number
  className?: string
}

export function TooltipComponent({ 
  content,
  children,
  placement = 'top',
  color = 'default',
  delay = 0,
  className,
}: TooltipComponentProps) {
  return (
    <Tooltip 
      content={content}
      placement={placement}
      color={color}
      delay={delay}
      className={cn(className)}
    >
      {children}
    </Tooltip>
  )
}
