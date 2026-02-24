import { Slider } from '@heroui/react'
import { cn } from '@/utils'

interface SliderComponentProps {
  label?: string
  minValue?: number
  maxValue?: number
  step?: number
  showSteps?: boolean
  defaultValue?: number | number[]
  value?: number | number[]
  onChange?: (value: number | number[]) => void
  className?: string
  disabled?: boolean
}

export function SliderComponent({ 
  label,
  minValue = 0,
  maxValue = 100,
  step = 1,
  showSteps = false,
  defaultValue,
  value,
  onChange,
  className,
  disabled,
}: SliderComponentProps) {
  return (
    <Slider
      label={label}
      minValue={minValue}
      maxValue={maxValue}
      step={step}
      showSteps={showSteps}
      defaultValue={defaultValue}
      value={value}
      onChange={onChange}
      className={cn('w-full', className)}
      isDisabled={disabled}
    />
  )
}
