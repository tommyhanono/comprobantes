import React from 'react'
import { supabase } from '../lib/supabase.js'
import { Badge } from '../components/core/Badge.jsx'
import { AlertCard } from '../components/feedback/AlertCard.jsx'

function Header({ count, onBack }) {
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
            Alertas
          </span>
          {count > 0 && <Badge variant="warning">{count}</Badge>}
        </div>
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 6,
          padding: '4px 12px',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.8)',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}>
          ← Portal
        </button>
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.5)', paddingLeft: 36 }}>
        Comprobantes duplicados
      </div>
    </div>
  )
}

function formatTime(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString('es-PA', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('es-PA', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function AdminScreen({ onBack }) {
  const [alerts, setAlerts]     = React.useState([])
  const [loading, setLoading]   = React.useState(true)
  const [dismissed, setDismiss] = React.useState(new Set())

  async function loadAlerts() {
    const { data, error } = await supabase
      .from('comprobantes')
      .select(`
        id, nombre_padre, monto, referencia, created_at,
        matched:matched_comprobante_id (
          nombre_padre, created_at
        )
      `)
      .eq('status', 'duplicado')
      .order('created_at', { ascending: false })

    if (!error) setAlerts(data || [])
    setLoading(false)
  }

  React.useEffect(() => {
    loadAlerts()

    // Realtime: new duplicates appear instantly
    const channel = supabase
      .channel('duplicados')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comprobantes', filter: 'status=eq.duplicado' },
        () => loadAlerts()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const visible = alerts.filter(a => !dismissed.has(a.id))

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
        <Header count={0} onBack={onBack} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-text-muted)' }}>
            Cargando alertas…
          </span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <Header count={visible.length} onBack={onBack} />

      <div style={{ flex: 1, padding: '16px 20px 36px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visible.length > 0 ? (
          visible.map(alert => {
            const original = alert.matched
            return (
              <AlertCard
                key={alert.id}
                submitterA={original?.nombre_padre || 'Padre original'}
                submitterATime={original ? formatTime(original.created_at) : '—'}
                submitterB={alert.nombre_padre}
                submitterBTime={formatTime(alert.created_at)}
                reference={alert.referencia || '—'}
                amount={`B/. ${Number(alert.monto).toFixed(2)}`}
                date={formatDate(alert.created_at)}
                onDismiss={() => setDismiss(prev => new Set([...prev, alert.id]))}
              />
            )
          })
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            textAlign: 'center',
            gap: 14,
          }}>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ color: 'var(--color-success)' }}>
              <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M18 28l8 8 12-12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6, letterSpacing: '-0.01em' }}>
                Todo en orden
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-text-subtle)' }}>
                No hay alertas pendientes.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
