import { useState } from 'react'
import { CheckCircle2, DatabaseZap, ExternalLink, LockKeyhole, Search, ShieldAlert } from 'lucide-react'

type Status = 'idle' | 'checking' | 'connected' | 'error'
type Client = { uuid: string; name: string; address: string }
type ErrorCode =
  | 'staff_access_not_configured'
  | 'staff_sign_in_required'
  | 'api_key_not_configured'
  | 'servicem8_key_rejected'
  | 'servicem8_rate_limited'
  | 'servicem8_unavailable'
  | 'invalid_servicem8_response'
  | 'invalid_customer_name'

function explanation(error: ErrorCode | string): string {
  switch (error) {
    case 'staff_access_not_configured':
      return 'Staff access is not configured. Protect WhitfieldOS with Cloudflare Access, then set ACCESS_TEAM_DOMAIN and ACCESS_AUD on the Worker.'
    case 'staff_sign_in_required':
      return 'A verified Cloudflare Access staff sign-in is required before WhitfieldOS can contact ServiceM8.'
    case 'api_key_not_configured':
      return 'Cloudflare has not supplied the SERVICEM8_API_KEY runtime secret to this Worker deployment.'
    case 'servicem8_key_rejected':
      return 'ServiceM8 rejected the API key or its permissions. Check the key in ServiceM8 and the Cloudflare secret.'
    case 'servicem8_rate_limited':
      return 'ServiceM8 is rate-limiting requests. Try again later.'
    case 'invalid_customer_name':
      return 'Enter at least three characters of a customer name, up to 100 characters.'
    case 'servicem8_unavailable':
    case 'invalid_servicem8_response':
      return 'ServiceM8 could not complete the request. Check the connection and try again.'
    default:
      return 'WhitfieldOS could not verify the ServiceM8 connection. Check the Worker deployment and Cloudflare Access sign-in.'
  }
}

async function readResponse(response: Response): Promise<Record<string, unknown>> {
  const value: unknown = await response.json()
  if (value && typeof value === 'object' && !Array.isArray(value))
    return value as Record<string, unknown>
  throw new Error('Unexpected API response')
}

/** Read-only; never sends API keys from the browser. */
export default function ServiceM8Connection({ showSearch = false }: { showSearch?: boolean }) {
  const [status, setStatus] = useState<Status>('idle')
  const [account, setAccount] = useState('')
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [searching, setSearching] = useState(false)
  const [clients, setClients] = useState<Client[] | null>(null)
  const [searchMessage, setSearchMessage] = useState('')

  async function checkConnection() {
    setStatus('checking')
    setMessage('')
    setAccount('')
    setClients(null)
    try {
      const response = await fetch('/api/servicem8/status', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
      })
      const result = await readResponse(response)
      if (!response.ok || result.connected !== true) {
        setStatus('error')
        setMessage(explanation(typeof result.error === 'string' ? result.error : 'unknown'))
        return
      }
      setStatus('connected')
      setAccount(typeof result.account === 'string' ? result.account : 'ServiceM8')
    } catch {
      setStatus('error')
      setMessage('Connection test unavailable. Check that WhitfieldOS is deployed as a Worker (not just a static website).')
    }
  }

  async function searchCustomers(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status !== 'connected') return
    const term = name.trim()
    if (term.length < 3 || term.length > 100) {
      setSearchMessage(explanation('invalid_customer_name'))
      return
    }
    setSearching(true)
    setSearchMessage('')
    setClients(null)
    try {
      const response = await fetch('/api/servicem8/customers?' + new URLSearchParams({ name: term }), {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
      })
      const result = await readResponse(response)
      if (!response.ok || !Array.isArray(result.matches)) {
        setSearchMessage(explanation(typeof result.error === 'string' ? result.error : 'unknown'))
        return
      }
      const matches: Client[] = result.matches
        .filter((item): item is Client => !!item && typeof item === 'object' &&
          typeof item.uuid === 'string' && typeof item.name === 'string' &&
          typeof item.address === 'string')
        .slice(0, 20)
      setClients(matches)
    } catch {
      setSearchMessage('Could not search ServiceM8. The customer data has not been saved.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="sm8-connection">
      <div className="sm8-status">
        {status === 'connected'
          ? <CheckCircle2 size={19} color="#286b45" />
          : status === 'error'
            ? <ShieldAlert size={19} color="#94552a" />
            : <DatabaseZap size={19} />}
        <div>
          <strong>
            {status === 'connected' ? 'Connected to ServiceM8' :
              status === 'checking' ? 'Checking ServiceM8…' :
                status === 'error' ? 'Connection not verified' : 'Connection not checked'}
          </strong>
          <p>{status === 'connected' ? account :
            'A secure, read-only connection using a Cloudflare Worker runtime secret.'}</p>
        </div>
      </div>
      <button type="button" className="button" disabled={status === 'checking'}
        onClick={() => void checkConnection()}>
        <DatabaseZap size={15} />
        {status === 'checking' ? 'Checking…' : 'Test ServiceM8 connection'}
      </button>
      {message && <p className="tool-error" role="alert">{message}</p>}
      {status === 'connected' && (
        <p className="tool-help">Account verified through ServiceM8. This does not mean the diary,
          job KPIs or automatic caller matching have been connected.</p>
      )}
      {showSearch && <>
        <div className="sm8-section">
          <h3>Find a customer</h3>
          <p className="tool-help">Exact customer name only. WhitfieldOS does not create,
            edit or store customers. Results are visible only after verified staff sign-in.</p>
          <form className="sm8-search" onSubmit={(event) => void searchCustomers(event)}>
            <label>
              Customer name
              <input aria-label="ServiceM8 customer name" autoComplete="off"
                value={name} maxLength={100} placeholder="Exact name in ServiceM8"
                disabled={status !== 'connected'}
                onChange={(event) => { setName(event.target.value); setClients(null) }} />
            </label>
            <button type="submit" className="button secondary"
              disabled={status !== 'connected' || searching || name.trim().length < 3}>
              <Search size={15} /> {searching ? 'Searching…' : 'Find customer'}
            </button>
          </form>
          {status !== 'connected' && (
            <p className="tool-meta"><LockKeyhole size={14} /> Check the secure connection first.</p>
          )}
          {searchMessage && <p className="tool-error" role="alert">{searchMessage}</p>}
          {clients && (clients.length ? (
            <div className="sm8-results" aria-label="ServiceM8 customer matches">
              {clients.map((client) => (
                <div key={client.uuid} className="sm8-result">
                  <strong>{client.name}</strong>
                  <span>{client.address || 'Address not supplied'}</span>
                </div>
              ))}
              <p className="tool-help">Showing up to 20 exact-name matches. Jobs and contact
                histories are not included in this first read-only release.</p>
            </div>
          ) : <p className="tool-meta">No matching customers were returned by ServiceM8.</p>)}
        </div>
      </>}
      <p className="sm8-footer">
        <LockKeyhole size={13} /> The API key remains on Cloudflare. No public API proxy.
        <a href="https://go.servicem8.com/" target="_blank" rel="noopener noreferrer">
          Open ServiceM8 <ExternalLink size={12} />
        </a>
      </p>
    </div>
  )
}
