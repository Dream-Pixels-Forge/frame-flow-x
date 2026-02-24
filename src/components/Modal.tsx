import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full'
  isDismissable?: boolean
  isKeyboardDismissDisabled?: boolean
}

export function ModalComponent({ 
  isOpen, 
  onClose, 
  title,
  children, 
  footer,
  size = 'md',
  isDismissable = true,
  isKeyboardDismissDisabled = false
}: ModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
    >
      <ModalContent>
        <>
          {title && (
            <ModalHeader>{title}</ModalHeader>
          )}
          <ModalBody>{children}</ModalBody>
          {footer && (
            <ModalFooter>{footer}</ModalFooter>
          )}
        </>
      </ModalContent>
    </Modal>
  )
}
