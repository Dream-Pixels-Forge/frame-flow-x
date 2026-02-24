import { Progress as HeroUIProgress } from '@heroui/react'
import { cn } from '@/utils'

interface ProgressProps {
  label?: string
  value?: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  className?: string
  maxValue?: number
  minValue?: number
}

export function Progress({
  label,
  value = 0,
  size = 'md',
  color = 'primary',
  className,
  maxValue = 100,
  minValue = 0,
}: ProgressProps) {
  return (
    <HeroUIProgress
      label={label}
      value={value}
      maxValue={maxValue}
      minValue={minValue}
      size={size}
      color={color}
      className={cn('w-full', className)}
    />
  )
}
