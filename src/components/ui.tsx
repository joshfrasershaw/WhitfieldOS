import { ArrowUpRight, Cable, Inbox } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
export function Panel({
  title,
  eyebrow,
  action,
  children,
  className = '',
}: {
  title: string
  eyebrow?: string
  action?: { label: string; to: string }
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`panel ${className}`}>
      <header className="panel-head">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2>{title}</h2>
        </div>
        {action && (
          <Link className="text-link" to={action.to}>
            {action.label}
            <ArrowUpRight size={14} />
          </Link>
        )}
      </header>
      {children}
    </section>
  )
}
export function Empty({
  icon: Icon = Inbox,
  title,
  description,
  compact = false,
}: {
  icon?: LucideIcon
  title: string
  description: string
  compact?: boolean
}) {
  return (
    <div className={`empty ${compact ? 'compact' : ''}`}>
      <span className="empty-icon">
        <Icon size={21} strokeWidth={1.5} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}
export function ConnectionNote() {
  return (
    <div className="connection-note">
      <Cable size={14} />
      <span>
        Not connected · Your data will appear here when a source is connected.
      </span>
    </div>
  )
}
export function PageHeader({
  title,
  description,
  kicker = 'WORKSPACE',
  children,
}: {
  title: string
  description: string
  kicker?: string
  children?: ReactNode
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{kicker}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {children}
    </div>
  )
}
