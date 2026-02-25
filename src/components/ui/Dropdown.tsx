import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from '@/components'

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent className={className}>
        {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
        {items.map((item) => (
          <DropdownMenuItem key={item.key} onClick={item.onClick}>
            {item.label}
            {item.shortcut && (
              <span className="ml-auto text-xs text-muted-foreground">{item.shortcut}</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
