import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'

interface DropdownItem {
  key: string
  label: string
  shortcut?: string
  onClick?: () => void
}

interface DropdownComponentProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  label?: string
  className?: string
}

export function DropdownComponent({ trigger, items, label, className }: DropdownComponentProps) {
  return (
    <Dropdown className={className}>
      <DropdownTrigger>
        {trigger}
      </DropdownTrigger>
      <DropdownMenu aria-label={label} variant="flat">
        {items.map((item) => (
          <DropdownItem 
            key={item.key} 
            shortcut={item.shortcut}
            onClick={item.onClick}
          >
            {item.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}
