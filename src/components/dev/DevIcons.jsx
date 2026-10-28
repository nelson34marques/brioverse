import PropTypes from 'prop-types'

const base = (size) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
})

export function HomeIcon({ size = 22 }) {
  return (
    <svg {...base(size)}>
      <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </svg>
  )
}

export function AppsIcon({ size = 22 }) {
  return (
    <svg {...base(size)}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

export function PlusIcon({ size = 22 }) {
  return (
    <svg {...base(size)} strokeWidth={2.4}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function ChartIcon({ size = 22 }) {
  return (
    <svg {...base(size)}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  )
}

export function BellIcon({ size = 22 }) {
  return (
    <svg {...base(size)}>
      <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  )
}

export function ExitIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M10 17l-5-5 5-5M5 12h11" />
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    </svg>
  )
}

export function SunIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

export function MoonIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}

const sizeProp = { size: PropTypes.number }
HomeIcon.propTypes = sizeProp
AppsIcon.propTypes = sizeProp
PlusIcon.propTypes = sizeProp
ChartIcon.propTypes = sizeProp
BellIcon.propTypes = sizeProp
ExitIcon.propTypes = sizeProp
SunIcon.propTypes = sizeProp
MoonIcon.propTypes = sizeProp
