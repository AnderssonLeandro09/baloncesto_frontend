/**
 * Hook para manejo de modales
 */

import { useState, useCallback } from 'react'

const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState)
  const [modalData, setModalData] = useState(null)

  const open = useCallback((data = null) => {
    setModalData(data)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setModalData(null)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  return {
    isOpen,
    modalData,
    open,
    close,
    toggle,
  }
}

export default useModal
