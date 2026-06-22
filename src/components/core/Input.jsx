import React from 'react'

export function Input({
  label,
  value,
  onChange,
  placeholder,
  error,
  hint,
  id,
  type = 'text',
  required = false,
  disabled = false,
  prefix,
  inputMode,
}) {
  const [focused, setFocused] = React.useState(false)

  const borderColor = error
    ? 'var(--color-warning)'
    : focused
    ? 'var(--color-primary)'
    : 'var(--color-border)'

  const boxShadow = focused
    ? error
      ? 'var(--ring-warning)'
      : 'var(--ring-focus)'
    : 'var(--shadow-inset)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: disabled ? 'var(--color-text-muted)' : 'var(--color-text)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
          }}
        >
          {label}
          {required && (
            <span style={{ color: 'var(--color-warning)', lineHeight: 1 }}>*</span>
          )}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <span style={{
            position: 'absolute',
            left: 'var(--space-4)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-subtle)',
            pointerEvents: 'none',
            userSelect: 'none',
          }}>
            {prefix}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          inputMode={inputMode}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: `var(--space-3) var(--space-4)`,
            paddingLeft: prefix ? 'calc(var(--space-4) + 2.5rem)' : 'var(--space-4)',
            fontFamily: type === 'number' || inputMode === 'decimal' ? 'var(--font-mono)' : 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: disabled ? 'var(--color-text-muted)' : 'var(--color-text)',
            backgroundColor: disabled ? 'var(--color-border-muted)' : 'var(--color-surface)',
            border: `1.5px solid ${borderColor}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
            boxShadow,
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
      </div>

      {(error || hint) && (
        <span style={{
          fontSize: 'var(--text-xs)',
          fontFamily: 'var(--font-body)',
          color: error ? 'var(--color-warning)' : 'var(--color-text-subtle)',
          lineHeight: 'var(--leading-snug)',
        }}>
          {error || hint}
        </span>
      )}
    </div>
  )
}
