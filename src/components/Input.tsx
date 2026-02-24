import { Input as HeroUIInput, InputProps } from '@heroui/react'
import { cn } from '@/utils'

interface InputPropsExtended extends InputProps {
  label?: string
  placeholder?: string
  errorMessage?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'flat' | 'bordered' | 'underlined' | 'faded'
}

export function Input({ 
  label,
  placeholder,
  errorMessage,
  size = 'md',
  variant = 'bordered',
  className,
  ...props 
}: InputPropsExtended) {
  return (
    <HeroUIInput
      label={label}
      placeholder={placeholder}
      errorMessage={errorMessage}
      size={size}
      variant={variant}
      className={cn('min-w-[200px]', className)}
      {...props}
    />
  )
}
