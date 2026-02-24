import { Checkbox as HeroUICheckbox, CheckboxProps } from '@heroui/react'
import { cn } from '@/utils'

interface CheckboxComponentProps extends CheckboxProps {
  isSelected?: boolean
  className?: string
}

export function CheckboxComponent({ 
  isSelected,
  className,
  ...props 
}: CheckboxComponentProps) {
  return (
    <HeroUICheckbox
      isSelected={isSelected}
      className={cn(className)}
      {...props}
    />
  )
}
