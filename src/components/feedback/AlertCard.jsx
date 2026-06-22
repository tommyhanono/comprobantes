import React from 'react'
import { Badge } from '../core/Badge.jsx'
import { Button } from '../core/Button.jsx'

export function AlertCard({
  submitterA = 'Juan Pérez',
  submitterATime = '3:42 p.m.',
  submitterB = 'María Rodríguez',
  submitterBTime = '4:01 p.m.',
  reference = 'REF-0821',
  amount = 'B/. 120.00',
  date = '21 jun 2026',
  onReview,
  onDismiss,
}) {
  return (
    <div style={{
      backgroundColor: 'var(--color-warning-bg)',
      border: '1px solid var(--color-warning-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-5)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, color: 'var(--color-warning)' }}>
            <path d="M9 2L16.5 15H1.5L9 2Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" fill="none"/>
            <line x1="9" y1="7.5" x2="9" y2="10.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            <circle cx="9" cy="12.5" r="0.75" fill="currentColor"/>
          </svg>
          <Badge variant="warning" size="sm">Duplicado detectado</Badge>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)' }}>
          {date}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--font-bold)',
          color: 'var(--color-text)',
          letterSpacing: 'var(--tracking-tight)',
        }}>
          {amount}
        </span>
        {reference && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-warning)',
            fontWeight: 'var(--font-semibold)',
          }}>
            {reference}
          </span>
        )}
      </div>

      <div style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3) var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-2xs)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--tracking-widest)',
        }}>
          Recibido de
        </span>
        {[{ name: submitterA, time: submitterATime }, { name: submitterB, time: submitterBTime }].map((s, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text)' }}>
              {s.name}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)' }}>
              {s.time}
            </span>
          </div>
        ))}
      </div>

      {(onReview || onDismiss) && (
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {onReview  && <Button variant="danger" size="sm" onClick={onReview}>Revisar</Button>}
          {onDismiss && <Button variant="ghost"  size="sm" onClick={onDismiss}>Descartar</Button>}
        </div>
      )}
    </div>
  )
}
