import React from 'react'

export function Badge({ children, variant = 'default', size = 'md' }) {
  const variants = {
    default: {
      backgroundColor: 'var(--color-tinta-50)',
      color: 'var(--color-text-subtle)',
      borderColor: 'var(--color-tinta-100)',
    },
    primary: {
      backgroundColor: 'var(--color-primary-subtle)',
      color: 'var(--color-primary)',
      borderColor: 'var(--color-azul-200)',
    },
    success: {
      backgroundColor: 'var(--color-success-bg)',
      color: 'var(--color-success)',
      borderColor: 'var(--color-success-border)',
    },
    warning: {
      backgroundColor: 'var(--color-warning-bg)',
      color: 'var(--color-warning)',
      borderColor: 'var(--color-warning-border)',
    },
    info: {
      backgroundColor: 'var(--color-azul-50)',
      color: 'var(--color-azul-600)',
      borderColor: 'var(--color-azul-200)',
    },
  }

  const sizes = {
    sm: { fontSize: 'var(--text-2xs)', padding: '2px var(--space-2)',  letterSpacing: 'var(--tracking-wider)' },
    md: { fontSize: 'var(--text-xs)',  padding: 'var(--space-1) var(--space-3)', letterSpacing: 'var(--tracking-widest)' },
    lg: { fontSize: 'var(--text-sm)',  padding: 'var(--space-1) var(--space-4)', letterSpacing: 'var(--tracking-wide)' },
  }

  const v = variants[variant] || variants.default
  const s = sizes[size] || sizes.md

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--font-semibold)',
      textTransform: 'uppercase',
      borderRadius: 'var(--radius-full)',
      border: '1px solid',
      whiteSpace: 'nowrap',
      lineHeight: '1.4',
      ...v,
      ...s,
    }}>
      {children}
    </span>
  )
}
