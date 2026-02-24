import { Badge } from '@heroui/react'
import { cn } from '@/utils'

interface BadgeComponentProps {
  children: React.ReactNode
  content?: string | number
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  shape?: 'circle' | 'rectangle'
  className?: string
}

export function BadgeComponent({ 
  children,
  content,
  color = 'primary',
  size = 'md',
  shape = 'circle',
  className 
}: BadgeComponentProps) {
  return (
    <Badge 
      content={content} 
      color={color}
      size={size}
      shape={shape}
      className={cn(className)}
    >
      {children}
    </Badge>
  )
}
