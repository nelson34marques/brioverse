import { Component } from 'react'
import PropTypes from 'prop-types'

/** Evita ecrã preto: mostra uma mensagem e botão de recarregar se algo rebentar. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[brioverse] erro de render:', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div style={{ padding: 'var(--space-12) var(--space-4)', textAlign: 'center', fontFamily: 'var(--font)' }}>
        <h1 style={{ marginBottom: 'var(--space-3)' }}>Algo correu mal</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>{String(this.state.error?.message || this.state.error)}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            borderRadius: 999,
            background: 'var(--brand-500)',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          Recarregar
        </button>
      </div>
    )
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
}
