import { Avatar } from '@heroui/react'
import { cn } from '@/utils'

interface AvatarComponentProps {
  src?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}

export function AvatarComponent({ 
  src, 
  name, 
  size = 'md',
  className,
  onClick,
}: AvatarComponentProps) {
  return (
    <Avatar 
      src={src} 
      name={name} 
      size={size}
      className={cn(className)}
      onClick={onClick}
    >
      {name?.charAt(0)}
    </Avatar>
  )
}
