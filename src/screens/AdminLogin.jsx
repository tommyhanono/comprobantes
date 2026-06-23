import React from 'react'
import { Input } from '../components/core/Input.jsx'
import { Button } from '../components/core/Button.jsx'

const ADMIN_PASSWORD = '1234567890'

export function AdminLogin({ onSuccess }) {
  const [pwd, setPwd]     = React.useState('')
  const [error, setError] = React.useState('')
  const [shake, setShake] = React.useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (pwd === ADMIN_PASSWORD) {
      onSuccess()
    } else {
      setError('Contraseña incorrecta')
      setShake(true)
      setPwd('')
      setTimeout(() => setShake(false), 400)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(140deg, #1B3A5C 0%, #243F6B 100%)',
        padding: '20px 22px 22px',
      }}>
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
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.5)', paddingLeft: 36, marginTop: 3 }}>
          Acceso administrador
        </div>
      </div>

      {/* Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 20px 60px',
        gap: 24,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--color-text)',
            margin: '0 0 6px',
            letterSpacing: '-0.02em',
          }}>
            Área de admin
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-text-subtle)', margin: 0 }}>
            Ingresa la contraseña para continuar
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            transform: shake ? 'translateX(-6px)' : 'none',
            transition: shake ? 'transform 0.08s ease' : 'transform 0.1s ease',
          }}
        >
          <Input
            id="pwd"
            label="Contraseña"
            type="password"
            value={pwd}
            onChange={e => { setPwd(e.target.value); setError('') }}
            placeholder="··········"
            error={error}
            required
          />
          <Button variant="primary" size="lg" fullWidth type="submit">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}
