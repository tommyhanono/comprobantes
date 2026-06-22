import React from 'react'

export function Sello({
  folio = 'FOL-0042',
  size = 140,
  ink = 'var(--color-success)',
  visible = true,
  animated = true,
}) {
  const cx = size / 2
  const cy = size / 2
  const r1 = size * 0.471
  const r2 = size * 0.421
  const rOrbit = size * 0.385
  const uid = 'orbit-' + folio.replace(/\W/g, '') + '-' + size
  const orbitPath = [
    'M', cx, ',', cy,
    ' m -', rOrbit, ',0',
    ' a ', rOrbit, ',', rOrbit, ' 0 1,1 ', rOrbit * 2, ',0',
    ' a ', rOrbit, ',', rOrbit, ' 0 1,1 -', rOrbit * 2, ',0',
  ].join('')

  const svgStyle = {
    display: 'block',
    opacity: visible ? 0.85 : 0,
    transform: 'rotate(-5deg) scale(' + (visible ? 1 : 0.5) + ')',
    transition: animated
      ? 'opacity 0.2s ease, transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)'
      : 'none',
    transformOrigin: 'center',
  }

  const dividerY1 = cy - size * 0.086
  const dividerY2 = cy + size * 0.088
  const dividerX1 = cx - size * 0.275
  const dividerX2 = cx + size * 0.275
  const sw = size * 0.007

  return (
    <svg
      width={size}
      height={size}
      viewBox={'0 0 ' + size + ' ' + size}
      style={svgStyle}
      aria-label={'Sello verificado folio ' + folio}
      role="img"
    >
      <defs>
        <path id={uid} d={orbitPath} />
      </defs>
      <circle cx={cx} cy={cy} r={r1} fill="none" stroke={ink} strokeWidth={size * 0.019} />
      <circle cx={cx} cy={cy} r={r2} fill="none" stroke={ink} strokeWidth={size * 0.011} />
      <text fontFamily="'IBM Plex Mono', monospace" fontSize={size * 0.071} fill={ink}>
        <textPath href={'#' + uid} startOffset="0%">
          {'· COMPROBANTES · ASOC. ESCOLAR · PANAMÁ    '}
        </textPath>
      </text>
      <line x1={dividerX1} y1={dividerY1} x2={dividerX2} y2={dividerY1} stroke={ink} strokeWidth={sw} />
      <text
        x={cx} y={cy + size * 0.058}
        textAnchor="middle"
        fontFamily="'Space Grotesk', sans-serif"
        fontSize={size * 0.152}
        fontWeight="700"
        fill={ink}
        letterSpacing={size * 0.004}
      >
        VERIFICADO
      </text>
      <line x1={dividerX1} y1={dividerY2} x2={dividerX2} y2={dividerY2} stroke={ink} strokeWidth={sw} />
      <text
        x={cx} y={cy + size * 0.195}
        textAnchor="middle"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize={size * 0.087}
        fontWeight="500"
        fill={ink}
        letterSpacing={size * 0.01}
      >
        {'#' + folio}
      </text>
    </svg>
  )
}
