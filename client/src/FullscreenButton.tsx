import React, { useState, useEffect, useCallback } from 'react'

interface Props {
  corner?: 'bottom-right' | 'top-right'
  inline?: boolean
}

export default function FullscreenButton({ corner = 'bottom-right', inline = false }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }, [])

  const sharedStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.12)',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    opacity: 0.5,
    touchAction: 'manipulation',
    transition: 'opacity 0.2s',
  }

  return (
    <button
      onClick={toggle}
      aria-label={isFullscreen ? 'Вийти з повноекранного режиму' : 'Повноекранний режим'}
      style={inline ? sharedStyle : {
        ...sharedStyle,
        position: 'fixed',
        ...(corner === 'top-right' ? { top: 16 } : { bottom: 16 }),
        right: 16,
        width: 44,
        height: 44,
        background: 'rgba(0,0,0,0.35)',
        opacity: 0.4,
        zIndex: 100,
      }}
      onPointerEnter={e => { e.currentTarget.style.opacity = '0.9' }}
      onPointerLeave={e => { e.currentTarget.style.opacity = inline ? '0.5' : '0.4' }}
    >
      {isFullscreen ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 14 10 14 10 20" />
          <polyline points="20 10 14 10 14 4" />
          <line x1="10" y1="14" x2="3" y2="21" />
          <line x1="21" y1="3" x2="14" y2="10" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      )}
    </button>
  )
}
