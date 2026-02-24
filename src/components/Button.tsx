import { Button as HeroUIButton, ButtonProps } from '@heroui/react'
import { cn } from '@/utils'

interface ButtonPropsExtended extends ButtonProps {
  variant?: 'solid' | 'bordered' | 'flat' | 'faded' | 'shadow' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  isLoading?: boolean
}

export function Button({ 
  children, 
  className, 
  variant = 'solid',
  size = 'md',
  color = 'primary',
  isLoading = false,
  ...props 
}: ButtonPropsExtended) {
  return (
    <HeroUIButton
      variant={variant}
      size={size}
      color={color}
      isLoading={isLoading}
      className={cn(className)}
      {...props}
    >
      {children}
    </HeroUIButton>
  )
}
