import { StrictMode, Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './features/Dashboard'
import Workspace from './features/Workspace'
import { modules } from './config/navigation'
import './styles.css'
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('WhitfieldOS rendering error', error, info.componentStack)
  }
  render() {
    return this.state.failed ? (
      <div className="fatal-error">
        <h1>Something interrupted the workspace.</h1>
        <p>Please reload to return to WhitfieldOS.</p>
        <button className="button" onClick={() => window.location.reload()}>
          Reload workspace
        </button>
      </div>
    ) : (
      this.props.children
    )
  }
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            {modules
              .filter((m) => m.id)
              .map((m) => (
                <Route
                  key={m.id}
                  path={m.id}
                  element={<Workspace key={m.id} module={m} />}
                />
              ))}
            <Route
              path="*"
              element={
                <section className="panel not-found">
                  <p className="eyebrow">404 · PAGE NOT FOUND</p>
                  <h1>This page is off the map.</h1>
                  <p>
                    Return to your Command Centre or use workspace search to
                    find your way.
                  </p>
                  <Link className="button" to="/">
                    Return to Command Centre
                  </Link>
                </section>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
