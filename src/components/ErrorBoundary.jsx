import { Component } from 'react'

// TIP: If any page crashes, React normally shows a blank screen. This catches it and prints the real error,
// which is the first thing you need when debugging.
export default class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 640, margin: '40px auto' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Something went wrong</h1>
        <pre style={{ background: '#fee', padding: 12, borderRadius: 8, whiteSpace: 'pre-wrap' }}>{String(this.state.error?.message || this.state.error)}</pre>
        <p>Press F12, open the Console tab and send the red error text to your developer.</p>
        <button onClick={() => location.reload()} style={{ padding: '8px 14px', fontWeight: 700 }}>Reload</button>
      </div>
    )
  }
}
