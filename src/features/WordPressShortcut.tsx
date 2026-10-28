import { useState } from 'react'
import { ExternalLink, LockKeyhole, Save, Trash2 } from 'lucide-react'
import { Panel } from '../components/ui'

const key = 'whitfieldos-wordpress-login-url'

function isApprovedLoginUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'www.whitfieldplumbing.co.uk' ||
        url.hostname === 'whitfieldplumbing.co.uk') &&
      url.pathname === '/wp-login.php' &&
      !url.username &&
      !url.password &&
      !url.hash
    )
  } catch {
    return false
  }
}

function storedLogin(): string {
  try {
    const url = window.localStorage.getItem(key) || ''
    return isApprovedLoginUrl(url) ? url : ''
  } catch {
    return ''
  }
}

export default function WordPressShortcut() {
  const [url, setUrl] = useState(storedLogin)
  const [draft, setDraft] = useState('')
  const [message, setMessage] = useState('')

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const candidate = draft.trim()
    if (!isApprovedLoginUrl(candidate)) {
      setMessage('Use the full HTTPS WordPress login URL for whitfieldplumbing.co.uk.')
      return
    }
    try {
      window.localStorage.setItem(key, candidate)
      setUrl(candidate)
      setDraft('')
      setMessage('')
    } catch {
      setMessage('This browser could not save the shortcut.')
    }
  }

  function clear() {
    try {
      window.localStorage.removeItem(key)
      setUrl('')
      setMessage('')
    } catch {
      setMessage('This browser could not remove the shortcut.')
    }
  }

  return (
    <Panel title="WordPress website login">
      <div className="wordpress-shortcut">
        <div className="wordpress-shortcut-heading">
          <span className="warranty-icon">
            <LockKeyhole size={19} strokeWidth={1.7} />
          </span>
          <div>
            <h3>Whitfield Plumbing website</h3>
            <p>Open the WordPress administration login in a new tab.</p>
          </div>
        </div>
        {url ? (
          <div className="wordpress-shortcut-actions">
            <a href={url} target="_blank" rel="noopener noreferrer" className="button">
              Open WordPress Login <ExternalLink size={15} />
            </a>
            <button type="button" className="button secondary" onClick={clear}>
              <Trash2 size={14} /> Clear saved link
            </button>
          </div>
        ) : (
          <form onSubmit={save} className="wordpress-shortcut-form">
            <label>
              WordPress login URL
              <input
                type="password"
                autoComplete="off"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Paste your WordPress admin login URL"
                aria-label="WordPress login URL"
                required
              />
            </label>
            <button type="submit" className="button"><Save size={14} /> Save shortcut</button>
          </form>
        )}
        {message && <p className="tool-error" role="alert">{message}</p>}
        <p className="tool-help">
          Saved only in this browser, not in the public GitHub repository and not shared with other staff.
          This stores a shortcut, not a WordPress username or password.
        </p>
      </div>
    </Panel>
  )
}
