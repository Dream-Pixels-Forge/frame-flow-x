import { Progress as HeroUIProgress, ProgressProps } from '@heroui/react'
import { cn } from '@/utils'

interface ProgressPropsExtended extends ProgressProps {
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
}

export function Progress({
  label,
  showValue = true,
  size = 'md',
  color = 'primary',
  className,
  ...props
}: ProgressPropsExtended) {
  return (
    <HeroUIProgress
      label={label}
      showValue={showValue}
      size={size}
      color={color}
      className={cn('w-full', className)}
      {...props}
      // HeroUI v2 expects show-value as boolean, not string
      aria-valuetext={showValue ? `${props.value || 0}%` : undefined}
    />
  )
}
