import { useState } from 'react'
import Modal from './Modal.jsx'
import Button from './Button.jsx'
import Input from './Input.jsx'

export default function ConfirmDialog({
  isOpen, onClose, onConfirm, title, message,
  confirmText = 'Confirm', variant = 'primary', typeToConfirm
}) {
  const [typed, setTyped] = useState('')
  const canConfirm = !typeToConfirm || typed === typeToConfirm

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm()
      setTyped('')
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 text-sm mb-4">{message}</p>
      {typeToConfirm && (
        <Input
          placeholder={`Type "${typeToConfirm}" to confirm`}
          value={typed}
          onChange={e => setTyped(e.target.value)}
          className="mb-4"
        />
      )}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant={variant} onClick={handleConfirm} disabled={!canConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}
