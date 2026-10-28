import PropTypes from 'prop-types'

/** Selo "Verificado" (estrela com visto), na cor do texto onde está. */
export default function VerifiedIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2 9.5 4.3 6.2 4l-.3 3.3L3 9.5l1.9 2.7L3 15l2.9 1.7.3 3.3 3.3-.3L12 22l2.5-2.3 3.3.3.3-3.3L21 15l-1.9-2.8L21 9.5l-2.9-2.2-.3-3.3-3.3.3z" />
      <path d="m8.5 12 2.3 2.3 4.7-4.8" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

VerifiedIcon.propTypes = {
  size: PropTypes.number,
}
