import React from 'react'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
}) {
  const [hovered, setHovered] = React.useState(false)
  const [pressed, setPressed] = React.useState(false)

  const variants = {
    primary: {
      base:  { backgroundColor: 'var(--color-primary)',  color: 'var(--color-text-inverse)', border: 'none' },
      hover: { backgroundColor: 'var(--color-primary-hover)' },
      press: { backgroundColor: 'var(--color-primary-active)', transform: 'scale(0.98)' },
    },
    secondary: {
      base:  { backgroundColor: 'transparent', color: 'var(--color-primary)', border: '1.5px solid var(--color-primary)' },
      hover: { backgroundColor: 'var(--color-primary-subtle)' },
      press: { transform: 'scale(0.98)' },
    },
    ghost: {
      base:  { backgroundColor: 'transparent', color: 'var(--color-text-subtle)', border: 'none' },
      hover: { backgroundColor: 'var(--color-tinta-50)' },
      press: { transform: 'scale(0.98)' },
    },
    success: {
      base:  { backgroundColor: 'var(--color-success)',  color: 'var(--color-text-inverse)', border: 'none' },
      hover: { backgroundColor: 'var(--color-success-hover)' },
      press: { transform: 'scale(0.98)' },
    },
    danger: {
      base:  { backgroundColor: 'var(--color-warning)',  color: 'var(--color-text-inverse)', border: 'none' },
      hover: { backgroundColor: 'var(--color-warning-hover)' },
      press: { transform: 'scale(0.98)' },
    },
  }

  const sizes = {
    sm: { padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-xs)' },
    md: { padding: 'var(--space-3) var(--space-5)', fontSize: 'var(--text-sm)' },
    lg: { padding: 'var(--space-4) var(--space-8)', fontSize: 'var(--text-base)' },
  }

  const v = variants[variant] || variants.primary
  const s = sizes[size] || sizes.md

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--font-semibold)',
    letterSpacing: 'var(--tracking-wide)',
    textTransform: 'uppercase',
    borderRadius: 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.48 : 1,
    transition: 'background-color 120ms ease, transform 80ms ease',
    width: fullWidth ? '100%' : 'auto',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    outline: 'none',
    lineHeight: 'var(--leading-none)',
    ...v.base,
    ...s,
    ...(hovered && !disabled ? v.hover : {}),
    ...(pressed && !disabled ? v.press : {}),
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => { setHovered(false); setPressed(false) }}
      style={style}
    >
      {children}
    </button>
  )
}
