'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useToast } from './use-toast'
import { X } from 'lucide-react'

const Toast = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const baseClasses = "fixed bottom-4 right-4 p-4 rounded-md shadow-md transition-all duration-300 flex items-center"
  const typeClasses = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  const visibilityClasses = isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'

  return (
    <div className={`${baseClasses} ${typeClasses} ${visibilityClasses}`}>
      <span className="text-white mr-2">{message}</span>
      <button onClick={() => setIsVisible(false)} className="text-white">
        <X size={18} />
      </button>
    </div>
  )
}

export const Toaster = () => {
  const { toasts } = useToast()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  if (!isMounted) return null

  return createPortal(
    <>
      {toasts && toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => {}} />
      ))}
    </>,
    document.body
  )
}

