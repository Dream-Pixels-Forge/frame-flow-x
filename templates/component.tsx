import { FC } from 'react'
import { Card, CardBody, CardHeader } from '@heroui/react'
import { motion } from 'framer-motion'

export interface MyComponentProps {
  /** Component title */
  title?: string
  /** Optional children */
  children?: React.ReactNode
  /** Callback for user action */
  onAction?: () => void
}

/**
 * MyComponent - Brief description of what this component does
 *
 * @example
 * ```tsx
 * <MyComponent title="Example" onAction={() => console.log('clicked')} />
 * ```
 */
export const MyComponent: FC<MyComponentProps> = ({
  title = 'Default Title',
  children,
  onAction,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <h3 className="text-lg font-semibold">{title}</h3>
        </CardHeader>
        <CardBody>
          {children}
          {onAction && (
            <button
              onClick={onAction}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Action
            </button>
          )}
        </CardBody>
      </Card>
    </motion.div>
  )
}
