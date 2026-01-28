'use client'
import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => console.log('Service Worker registered with scope:', registration.scope))
        .catch((error) => console.error('Service Worker registration failed:', error))
    } else if ('serviceWorker' in navigator && window.location.hostname === 'localhost') {
        // Allow localhost to register service worker
        navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => console.log('Service Worker registered with scope (localhost):', registration.scope))
        .catch((error) => console.error('Service Worker registration failed:', error))
    }
  }, [])
  return null
}
