import { Card, CardBody, CardHeader, CardFooter } from '@heroui/react'
import { cn } from '@/utils'

interface CardProps {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  isHoverable?: boolean
  shadow?: 'none' | 'sm' | 'md' | 'lg'
}

export function CardComponent({ 
  children, 
  header, 
  footer,
  className,
  isHoverable = false,
  shadow = 'md'
}: CardProps) {
  return (
    <Card 
      isHoverable={isHoverable} 
      shadow={shadow}
      className={cn('p-0', className)}
    >
      {header && (
        <CardHeader>{header}</CardHeader>
      )}
      <CardBody>{children}</CardBody>
      {footer && (
        <CardFooter>{footer}</CardFooter>
      )}
    </Card>
  )
}
