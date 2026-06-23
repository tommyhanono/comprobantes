import React from 'react'
import { supabase } from '../lib/supabase.js'
import { Button } from '../components/core/Button.jsx'
import { Input } from '../components/core/Input.jsx'
import { DropZone } from '../components/upload/DropZone.jsx'

function Header({ onAdmin }) {
  return (
    <div style={{
      background: 'linear-gradient(140deg, #1B3A5C 0%, #243F6B 100%)',
      padding: '20px 22px 22px',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <rect x="3" y="2" width="16" height="22" rx="2" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" fill="none"/>
            <path d="M7 8h8M7 12h8M7 16h5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="20" cy="20" r="4.5" fill="#0D6E4D"/>
            <path d="M17.8 20l1.6 1.6 2.8-2.8" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
            Comprobantes
          </span>
        </div>
        <button onClick={onAdmin} style={{
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 6, padding: '4px 12px', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
          color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.07em',
        }}>
          Admin
        </button>
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.5)', paddingLeft: 36 }}>
        Asociación Escolar de Padres
      </div>
    </div>
  )
}

function InfoRow({ label, value, mono, small, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-text-subtle)' }}>{label}</span>
      <span style={{
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
        fontSize: small ? 12 : 14, fontWeight: 600,
        color: color || 'var(--color-text)',
      }}>{value}</span>
    </div>
  )
}

function SuccessView({ folio, ts, monto, nombre, previewUrl, onReset }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <DropZone state="success" previewUrl={previewUrl} folio={folio} />

      <div style={{ textAlign: 'center', padding: '0 4px' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 27, fontWeight: 700,
          color: 'var(--color-text)', margin: '0 0 6px',
          letterSpacing: '-0.02em', lineHeight: 1.22,
        }}>
          Tu comprobante<br />fue recibido
        </h2>
        {nombre && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-text-subtle)', margin: 0 }}>
            {nombre}
          </p>
        )}
      </div>

      <div style={{
        backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
        padding: '16px 20px', boxShadow: 'var(--shadow-sm)',
        display: 'flex', flexDirection: 'column', gap: 11,
      }}>
        <InfoRow label="Folio"    value={'#' + folio}                          mono color="var(--color-success)" />
        {monto && <InfoRow label="Monto"   value={'B/. ' + Number(monto).toFixed(2)} mono />}
        <InfoRow label="Recibido" value={ts}                                   mono small />
      </div>

      <Button variant="ghost" fullWidth onClick={onReset}>
        Subir otro comprobante
      </Button>
    </div>
  )
}

export function UploadScreen({ onAdmin }) {
  const [dropState, setDropState] = React.useState('empty')
  const [file, setFile]           = React.useState(null)
  const [previewUrl, setPreview]  = React.useState(null)
  const [progress, setProgress]   = React.useState(0)
  const [nombre, setNombre]       = React.useState('')
  const [folio, setFolio]         = React.useState('FOL-0001')
  const [montoOcr, setMontoOcr]   = React.useState(null)
  const [errors, setErrors]       = React.useState({})
  const [apiError, setApiError]   = React.useState(null)

  function handleFile(f) {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setErrors(prev => ({ ...prev, drop: undefined }))
  }

  async function handleSubmit() {
    const e = {}
    if (!nombre.trim()) e.nombre = 'Ingresa tu nombre completo'
    if (!file)          e.drop   = 'Selecciona la foto de tu comprobante'
    if (Object.keys(e).length) { setErrors(e); return }

    setErrors({})
    setApiError(null)
    setDropState('loading')
    setProgress(10)

    try {
      // 1. Upload to Supabase Storage
      const ext  = file.name.split('.').pop() || 'jpg'
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('comprobantes-images')
        .upload(path, file, { contentType: file.type })

      if (uploadErr) throw new Error('Error subiendo imagen: ' + uploadErr.message)
      setProgress(35)

      const { data: { publicUrl } } = supabase.storage
        .from('comprobantes-images')
        .getPublicUrl(path)

      // 2. Verify endpoint
      setProgress(50)
      const res  = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: publicUrl, nombrePadre: nombre.trim() }),
      })

      setProgress(90)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error verificando comprobante')

      setFolio(data.folio)
      setMontoOcr(data.monto)
      setProgress(100)
      setTimeout(() => setDropState('success'), 200)

    } catch (err) {
      setDropState('empty')
      setProgress(0)
      setApiError(err.message)
    }
  }

  function handleReset() {
    setDropState('empty')
    setFile(null)
    setPreview(null)
    setProgress(0)
    setNombre('')
    setMontoOcr(null)
    setErrors({})
    setApiError(null)
  }

  const d  = new Date()
  const ts = d.toLocaleDateString('es-PA', { day: 'numeric', month: 'short', year: 'numeric' })
    + ', ' + d.toLocaleTimeString('es-PA', { hour: 'numeric', minute: '2-digit', hour12: true })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <Header onAdmin={onAdmin} />

      <div style={{ flex: 1, padding: '24px 20px 36px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {dropState !== 'success' && (
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700,
              color: 'var(--color-text)', margin: '0 0 5px',
              letterSpacing: '-0.02em', lineHeight: 1.2,
            }}>
              Sube tu comprobante<br />de pago
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-text-subtle)', margin: 0 }}>
              Foto o captura de tu transferencia bancaria
            </p>
          </div>
        )}

        {dropState === 'success' ? (
          <SuccessView
            folio={folio} ts={ts} monto={montoOcr}
            nombre={nombre} previewUrl={previewUrl} onReset={handleReset}
          />
        ) : (
          <>
            <DropZone
              state={dropState} previewUrl={previewUrl}
              progress={progress} folio={folio} onChange={handleFile}
            />
            {errors.drop && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-warning)', fontFamily: 'var(--font-body)' }}>
                {errors.drop}
              </span>
            )}

            <Input
              id="nombre"
              label="Tu nombre completo"
              placeholder="Juan Pérez"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              error={errors.nombre}
              required
            />

            {apiError && (
              <div style={{
                backgroundColor: 'var(--color-warning-bg)',
                border: '1px solid var(--color-warning-border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-warning)',
              }}>
                {apiError}
              </div>
            )}

            <Button
              variant="primary" size="lg" fullWidth
              onClick={handleSubmit}
              disabled={dropState === 'loading'}
            >
              {dropState === 'loading' ? 'Verificando…' : 'Enviar comprobante'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
