import { Tabs, Tab } from '@heroui/react'
import { cn } from '@/utils'

interface TabItem {
  key: string
  title: string
  icon?: React.ReactNode
  content?: React.ReactNode
}

interface TabsComponentProps {
  items: TabItem[]
  selectedKey?: string
  onSelectionChange?: (key: string) => void
  variant?: 'underlined' | 'bordered' | 'solid' | 'light'
  size?: 'sm' | 'md' | 'lg'
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  className?: string
  fullWidth?: boolean
}

export function TabsComponent({ 
  items,
  selectedKey,
  onSelectionChange,
  variant = 'underlined',
  size = 'md',
  color = 'primary',
  fullWidth = false,
  className 
}: TabsComponentProps) {
  return (
    <Tabs
      selectedKey={selectedKey}
      onSelectionChange={(key) => onSelectionChange?.(key as string)}
      variant={variant}
      size={size}
      color={color}
      fullWidth={fullWidth}
      className={cn(className)}
    >
      {items.map((item) => (
        <Tab 
          key={item.key} 
          title={
            <div className="flex items-center gap-2">
              {item.icon}
              <span>{item.title}</span>
            </div>
          }
        >
          {item.content}
        </Tab>
      ))}
    </Tabs>
  )
}
