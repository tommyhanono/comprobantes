import React from 'react'
import { Sello } from '../feedback/Sello.jsx'

export function DropZone({
  state = 'empty',
  previewUrl = null,
  progress = 0,
  folio = 'FOL-0042',
  onTap,
  onChange,
}) {
  const inputRef = React.useRef(null)
  const [selloVisible, setSelloVisible] = React.useState(false)

  React.useEffect(() => {
    if (state === 'success') {
      const t = setTimeout(() => setSelloVisible(true), 90)
      return () => clearTimeout(t)
    } else {
      setSelloVisible(false)
    }
  }, [state])

  const handleClick = () => {
    if (state === 'empty' && inputRef.current) inputRef.current.click()
    if (onTap) onTap()
  }

  const handleChange = (e) => {
    if (onChange) onChange(e.target.files[0])
  }

  const base = {
    position: 'relative',
    width: '100%',
    aspectRatio: '4/3',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }

  if (state === 'empty') {
    return (
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
        <div
          role="button"
          tabIndex={0}
          aria-label="Toca para seleccionar tu comprobante"
          onClick={handleClick}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
          style={{
            ...base,
            backgroundColor: 'var(--color-surface)',
            border: '2px dashed var(--color-border)',
            cursor: 'pointer',
            gap: 'var(--space-3)',
          }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" style={{ color: 'var(--color-tinta-400)' }}>
            <rect x="4" y="26" width="36" height="14" rx="4" stroke="currentColor" strokeWidth="2.2" fill="none"/>
            <path d="M22 6v20M22 6l-8 8M22 6l8 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={{ textAlign: 'center', padding: '0 var(--space-6)' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)', color: 'var(--color-text)', margin: 0, marginBottom: 'var(--space-1)' }}>
              Toca para seleccionar
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
              Foto o captura de tu comprobante
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'loading') {
    return (
      <div style={{ ...base, backgroundColor: 'var(--color-tinta-900)' }}>
        {previewUrl && (
          <img src={previewUrl} alt="Comprobante" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
        )}
        <div style={{ position: 'relative', zIndex: 1, width: '100%', padding: '0 var(--space-8)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ width: '100%', height: '3px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: progress + '%', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-full)', transition: 'width 250ms ease' }} />
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
            Verificando duplicados…
          </p>
        </div>
      </div>
    )
  }

  if (state === 'success') {
    return (
      <div style={{ ...base, backgroundColor: '#12202F' }}>
        {previewUrl && (
          <img src={previewUrl} alt="Comprobante" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
        )}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Sello folio={folio} size={160} visible={selloVisible} animated={true} />
        </div>
      </div>
    )
  }

  return null
}
