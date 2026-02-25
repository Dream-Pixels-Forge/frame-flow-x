import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, 'value' | 'defaultValue'> & {
    minValue?: number
    maxValue?: number
    step?: number
    value?: number
    defaultValue?: number
    onValueChange?: (value: number) => void
  }
>(({ className, minValue, maxValue, step, value, defaultValue, onValueChange, ...props }, ref) => {
  // Convert single value to array for Radix UI (which requires array)
  const getValueArray = (val?: number, defVal?: number) => {
    if (val !== undefined) return [val]
    if (defVal !== undefined) return [defVal]
    return [minValue || 0]
  }

  const arrayValue = getValueArray(value, defaultValue)
  const [internalValue, setInternalValue] = React.useState(arrayValue)
  
  const currentValue = value !== undefined ? getValueArray(value) : internalValue

  const handleValueChange = (newValue: number[]) => {
    setInternalValue(newValue)
    onValueChange?.(newValue[0])
  }

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      value={currentValue}
      onValueChange={handleValueChange}
      min={minValue}
      max={maxValue}
      step={step}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  )
})
Slider.displayName = "Slider"

export { Slider }
