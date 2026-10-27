import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Command,
  Menu,
  Search,
  X,
  ShieldCheck,
} from 'lucide-react'
import { groups, modules } from '../config/navigation'
export default function Layout() {
  const [collapsed, setCollapsed] = useState(false),
    [mobile, setMobile] = useState(false),
    [closed, setClosed] = useState<string[]>([])
  const [dialog, setDialog] = useState<
      'search' | 'notifications' | 'profile' | null
    >(null),
    [query, setQuery] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null),
    triggerRef = useRef<HTMLElement | null>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  useEffect(() => {
    const media = window.matchMedia('(max-width: 800px)')
    const onResize = () => {
      if (!media.matches) setMobile(false)
    }
    media.addEventListener('change', onResize)
    return () => media.removeEventListener('change', onResize)
  }, [])
  useEffect(() => {
    if (!mobile) return
    const menuButton = menuRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    sidebarRef.current?.querySelector<HTMLElement>('a,button')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobile(false)
        menuButton?.focus()
      }
      if (event.key !== 'Tab') return
      const items = Array.from(
        sidebarRef.current?.querySelectorAll<HTMLElement>('a,button') ?? [],
      ).filter((el) => el.offsetParent !== null)
      const first = items[0],
        last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
      menuButton?.focus()
    }
  }, [mobile])
  useEffect(() => {
    const title = modules.find(
      (m) => location.pathname === (m.id ? `/${m.id}` : '/'),
    )?.title
    document.title = `WhitfieldOS · ${title === 'Overview' ? 'Dashboard' : title || 'Page not found'}`
  }, [location.pathname])
  useEffect(() => {
    if (dialog) {
      triggerRef.current = document.activeElement as HTMLElement
      dialogRef.current?.showModal()
    } else if (dialogRef.current?.open) {
      dialogRef.current.close()
      triggerRef.current?.focus()
    }
  }, [dialog])
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setDialog((d) => (d ? null : 'search'))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
  function closeNav() {
    setMobile(false)
    setDialog(null)
  }
  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {mobile && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        ref={sidebarRef}
        className={`sidebar ${mobile ? 'mobile-open' : ''}`}
        aria-label="Main navigation"
        id="sidebar"
      >
        <Link
          to="/"
          className="brand"
          onClick={closeNav}
          aria-label="WhitfieldOS home"
        >
          <span className="brand-mark">
            W<span />
          </span>
          <span className="brand-name">
            Whitfield<span>OS</span>
            <small>PLUMBING · HEATING · COOLING</small>
          </span>
        </Link>
        <button
          className="mobile-nav-close icon-button"
          aria-label="Close menu"
          onClick={() => setMobile(false)}
        >
          <X size={18} />
        </button>
        <div className="workspace-label">
          <span className="workspace-avatar">W</span>
          <span>
            Whitfield workspace<small>Business operations</small>
          </span>
          <ShieldCheck size={15} />
        </div>
        <nav>
          {groups.map((group) => (
            <div className="nav-group" key={group.title}>
              <button
                className="nav-category"
                aria-expanded={!closed.includes(group.title)}
                title={group.title}
                onClick={() => {
                  if (collapsed) setCollapsed(false)
                  setClosed((c) =>
                    c.includes(group.title)
                      ? c.filter((t) => t !== group.title)
                      : [...c, group.title],
                  )
                }}
              >
                <span>{group.title}</span>
                <ChevronDown
                  size={12}
                  className={closed.includes(group.title) ? 'rotated' : ''}
                />
              </button>
              {!closed.includes(group.title) &&
                group.items.map((item) => (
                  <NavLink
                    key={item.id}
                    to={`/${item.id}`}
                    end={item.id === ''}
                    onClick={closeNav}
                    title={collapsed ? item.title : undefined}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? 'active' : ''}`
                    }
                  >
                    <item.icon size={17} strokeWidth={1.6} />
                    <span>{item.title}</span>
                    {item.id === '' && <span className="nav-dot" />}
                  </NavLink>
                ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="foundation-label">
            <span className="status-dot" />
            <span>V1 · Foundation</span>
          </div>
          <button
            className="collapse-button"
            onClick={() => {
              setCollapsed(!collapsed)
              setMobile(false)
            }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronsRight size={17} />
            ) : (
              <>
                <ChevronsLeft size={17} />
                <span>Collapse sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
      <div className="workspace" inert={mobile || undefined}>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              ref={menuRef}
              aria-label="Open navigation"
              aria-expanded={mobile}
              aria-controls="sidebar"
              onClick={() => setMobile(true)}
            >
              <Menu size={21} />
            </button>
            <span className="breadcrumb-brand">Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <span>
              {modules.find((m) => location.pathname === `/${m.id}`)?.title ||
                'Page not found'}
            </span>
          </div>
          <div className="topbar-actions">
            <button
              className="search-trigger"
              aria-label="Search workspace"
              onClick={() => setDialog('search')}
            >
              <Search size={16} />
              <span>Search workspace</span>
              <kbd>
                <Command size={10} /> K
              </kbd>
            </button>
            <span className="topbar-divider" />
            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() => setDialog('notifications')}
            >
              <Bell size={18} />
            </button>
            <button
              className="profile-avatar"
              aria-label="Workspace profile"
              onClick={() => setDialog('profile')}
            >
              W
            </button>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>
            WHITFIELD<span className="footer-os">OS</span>{' '}
            <span className="footer-separator">/</span> Built around your
            business.
          </span>
          <span>
            Foundation release <span className="status-dot" />
          </span>
        </footer>
      </div>
      <dialog
        ref={dialogRef}
        onCancel={() => setDialog(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setDialog(null)
        }}
        className="workspace-dialog"
        aria-labelledby="dialog-title"
      >
        <div className="dialog-header">
          <h2 id="dialog-title">
            {dialog === 'search'
              ? 'Find your workspace'
              : dialog === 'notifications'
                ? 'Notifications'
                : 'Whitfield workspace'}
          </h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={() => setDialog(null)}
          >
            <X size={20} />
          </button>
        </div>
        {dialog === 'search' ? (
          <>
            <label className="search-input">
              <Search size={19} />
              <input
                autoFocus
                placeholder="Search pages, departments, tools…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div className="search-results">
              {modules
                .filter((m) =>
                  `${m.title} ${m.description}`
                    .toLowerCase()
                    .includes(query.toLowerCase()),
                )
                .map((m) => (
                  <Link key={m.id} to={`/${m.id}`} onClick={closeNav}>
                    <m.icon size={18} />
                    <span>{m.title}</span>
                    <ArrowRight size={15} />
                  </Link>
                ))}
              {!modules.some((m) =>
                `${m.title} ${m.description}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              ) && (
                <p className="dialog-copy">
                  No pages found. Try “finance”, “jobs” or “marketing”.
                </p>
              )}
            </div>
          </>
        ) : dialog === 'notifications' ? (
          <div className="dialog-copy">
            <Bell size={28} />
            <h3>No notifications connected</h3>
            <p>
              Future alerts and activity will appear here once your systems are
              connected. There are no live alerts in this foundation release.
            </p>
            <Link to="/alerts" className="button secondary" onClick={closeNav}>
              View Alerts <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="dialog-copy">
            <span className="profile-avatar large">W</span>
            <h3>Whitfield Plumbing, Heating & Cooling</h3>
            <p>
              Foundation workspace · No user account connected. Authentication
              and role-based access will be introduced in a future release.
            </p>
            <Link
              className="button secondary"
              to="/settings"
              onClick={closeNav}
            >
              Workspace settings <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </dialog>
    </div>
  )
}
