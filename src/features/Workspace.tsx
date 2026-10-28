import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Search,
  SlidersHorizontal,
  Sparkles,
  Plug,
  LockKeyhole,
  Building2,
  Palette,
  ShieldCheck,
  Folder,
  Cable,
} from 'lucide-react'
import type { Module } from '../config/navigation'
import RoutePlanner from './RoutePlanner'
import WarrantyRegistration from './WarrantyRegistration'
import CallDesk from './CallDesk'
import TriageFlow from './TriageFlow'
import WordPressShortcut from './WordPressShortcut'
import { PageHeader, Panel, Empty, ConnectionNote } from '../components/ui'
const integrations = [
  {
    name: 'ServiceM8',
    category: 'Field operations',
    description: 'Jobs, scheduling, engineers and service history.',
  },
  {
    name: 'Xero',
    category: 'Finance',
    description: 'Invoices, revenue, receivables and financial reporting.',
  },
  {
    name: 'Google Ads',
    category: 'Marketing',
    description: 'Campaigns, advertising spend and conversions.',
  },
  {
    name: 'Google Analytics 4',
    category: 'Website analytics',
    description: 'Website traffic, engagement and enquiry journeys.',
  },
  {
    name: 'Google Search Console',
    category: 'Search visibility',
    description: 'Search queries, indexing and organic performance.',
  },
  {
    name: 'Google Business Profile',
    category: 'Local presence',
    description: 'Profile performance, local visibility and interactions.',
  },
  {
    name: 'Meta / Facebook / Instagram',
    category: 'Social media',
    description: 'Social publishing, channel insights and engagement.',
  },
  {
    name: 'WordPress',
    category: 'Website & content',
    description: 'Website content and publishing workflows.',
  },
  {
    name: 'WhatsApp & communications',
    category: 'Communications',
    description: 'Customer communication and conversation context.',
  },
]
function IntegrationWorkspace() {
  const [filter, setFilter] = useState('')
  return (
    <>
      <div className="workspace-intro">
        <Plug size={20} />
        <div>
          <h2>Your systems. Working together.</h2>
          <p>
            Integration architecture is planned. Live connections are not
            available in V1, and no credentials are required.
          </p>
        </div>
      </div>
      <label className="filter-input">
        <Search size={16} />
        <input
          placeholder="Find an integration…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </label>
      <div className="integration-grid">
        {integrations
          .filter((i) =>
            `${i.name} ${i.category}`
              .toLowerCase()
              .includes(filter.toLowerCase()),
          )
          .map((i, index) => (
            <section className="panel integration-card" key={i.name}>
              <div className="integration-top">
                <span className={`integration-logo logo-${index % 4}`}>
                  {i.name === 'ServiceM8'
                    ? 'M8'
                    : i.name === 'Xero'
                      ? 'xero'
                      : i.name.split(' ')[0].slice(0, 2)}
                </span>
                <span className="connection-badge">
                  <span className="hollow-dot" /> Not connected
                </span>
              </div>
              <p className="eyebrow">{i.category}</p>
              <h2>{i.name}</h2>
              <p>{i.description}</p>
              <details>
                <summary>
                  Planned connection <ArrowUpRight size={14} />
                </summary>
                <p>
                  This future integration will supply{' '}
                  {i.description.charAt(0).toLowerCase() +
                    i.description.slice(1)}{' '}
                  Connection setup, permissions and sync controls will be
                  introduced in a later release. No data is currently accessed.
                </p>
              </details>
            </section>
          ))}
      </div>
      {!integrations.some((i) =>
        `${i.name} ${i.category}`.toLowerCase().includes(filter.toLowerCase()),
      ) && (
        <Empty
          title="No integrations match"
          description="Try a system name or category such as finance or marketing."
        />
      )}
    </>
  )
}
function Schedule({ module }: { module: Module }) {
  const [offset, setOffset] = useState(0)
  const start = new Date()
  start.setHours(12, 0, 0, 0)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) + offset * 7)
  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })
  return (
    <div className="schedule-layout">
      <Panel title={module.labels[0]}>
        <Empty
          icon={module.icon}
          title="Work ready to be planned"
          description="Unscheduled work will appear here once your scheduling source is connected."
          compact
        />
      </Panel>
      <Panel title={module.labels[2]}>
        <div className="calendar-toolbar">
          <div>
            <CalendarDays size={16} />
            <strong>
              {new Intl.DateTimeFormat('en-GB', {
                month: 'long',
                year: 'numeric',
              }).format(start)}
            </strong>
          </div>
          <div>
            <button
              className="icon-button"
              aria-label="Previous week"
              onClick={() => setOffset(offset - 1)}
            >
              <ChevronLeft size={17} />
            </button>
            <button className="text-button" onClick={() => setOffset(0)}>
              This week
            </button>
            <button
              className="icon-button"
              aria-label="Next week"
              onClick={() => setOffset(offset + 1)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
        <div
          className="table-scroll"
          role="region"
          aria-label="Scrollable workspace"
          tabIndex={0}
        >
          <div className="diary-grid">
            {days.map((d) => (
              <div className="diary-day" key={d.toISOString()}>
                <div>
                  <span>
                    {new Intl.DateTimeFormat('en-GB', {
                      weekday: 'short',
                    }).format(d)}
                  </span>
                  <strong>{d.getDate()}</strong>
                </div>
                <div className="diary-slots">
                  <span>09:00</span>
                  <span>12:00</span>
                  <span>15:00</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <ConnectionNote />
      </Panel>
    </div>
  )
}
function TableWorkspace({ module }: { module: Module }) {
  const [query, setQuery] = useState(''),
    [filter, setFilter] = useState('All')
  return (
    <Panel title={module.title}>
      <div className="table-toolbar">
        <label className="filter-input">
          <Search size={16} />
          <input
            aria-label={`Search ${module.title}`}
            placeholder="Search records…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="select-label">
          <SlidersHorizontal size={15} />
          <select
            aria-label="Filter records"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All</option>
            <option>Needs attention</option>
            <option>Upcoming</option>
          </select>
        </label>
      </div>
      <div
        className="table-scroll"
        role="region"
        aria-label="Scrollable workspace"
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              {module.labels.map((l) => (
                <th key={l}>{l}</th>
              ))}
            </tr>
          </thead>
        </table>
      </div>
      <Empty
        icon={module.icon}
        title={
          query
            ? 'No matching records'
            : filter !== 'All'
              ? `No ${filter.toLowerCase()} records`
              : `A clear home for ${module.title.toLowerCase()}`
        }
        description="This workspace has no connected records yet. Your information will appear here when the relevant system is connected."
      />
      <ConnectionNote />
    </Panel>
  )
}
function Pipeline({ module }: { module: Module }) {
  return (
    <>
      <div className="board-toolbar">
        <span>
          <span className="hollow-dot" /> No records connected
        </span>
        <span>Board view</span>
      </div>
      <div
        className="pipeline-board"
        role="region"
        aria-label="Pipeline stages"
        tabIndex={0}
        style={{
          gridTemplateColumns: `repeat(${module.labels.length}, minmax(180px, 1fr))`,
        }}
      >
        {module.labels.map((label, i) => (
          <section className="pipeline-column" key={label}>
            <header>
              <span className={`stage-dot stage-${i % 4}`} />
              <h2>{label}</h2>
              <span>—</span>
            </header>
            <div className="pipeline-placeholder">
              <module.icon size={20} strokeWidth={1.3} />
              <p>No {label.toLowerCase()} items</p>
            </div>
          </section>
        ))}
      </div>
      <ConnectionNote />
    </>
  )
}
function Analytics({ module }: { module: Module }) {
  const [range, setRange] = useState('This month')
  return (
    <>
      <div className="board-toolbar">
        <span>Performance workspace</span>
        <label className="select-label">
          <CalendarDays size={14} />
          <select
            aria-label="Reporting period"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            <option>This month</option>
            <option>This quarter</option>
            <option>This year</option>
          </select>
        </label>
      </div>
      <div className="summary-grid">
        {module.labels.map((label) => (
          <div className="panel summary-card" key={label}>
            <h2>{label}</h2>
            <strong>—</strong>
            <span>No connected data · {range.toLowerCase()}</span>
          </div>
        ))}
      </div>
      <div className="analytics-grid">
        <Panel title={module.labels[0]}>
          <div className="large-chart">
            <div className="chart-grid-lines" />
            <Empty
              icon={module.icon}
              title="A picture built on your data"
              description="Your connected performance will appear here. No figures are simulated in this release."
            />
          </div>
          <ConnectionNote />
        </Panel>
        <Panel title={module.labels[1]}>
          <Empty
            icon={module.icon}
            title="Insight starts with a connection"
            description="Future reporting will bring the right information into focus."
          />
          <div className="panel-foot">
            <Link to="/integrations">
              Explore planned integrations <ArrowRight size={14} />
            </Link>
          </div>
        </Panel>
      </div>
    </>
  )
}
function CalendarWorkspace() {
  const [offset, setOffset] = useState(0)
  const date = new Date()
  date.setDate(1)
  date.setMonth(date.getMonth() + offset)
  const blanks = (date.getDay() + 6) % 7,
    count = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  return (
    <Panel title="Content calendar">
      <div className="calendar-toolbar">
        <strong>
          {date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </strong>
        <div>
          <button
            className="icon-button"
            aria-label="Previous month"
            onClick={() => setOffset(offset - 1)}
          >
            <ChevronLeft size={17} />
          </button>
          <button className="text-button" onClick={() => setOffset(0)}>
            This month
          </button>
          <button
            className="icon-button"
            aria-label="Next month"
            onClick={() => setOffset(offset + 1)}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      <div className="month-grid">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div className="month-day-name" key={d}>
            {d}
          </div>
        ))}
        {Array.from({ length: blanks + count }, (_, i) => (
          <div className={`month-cell ${i < blanks ? 'blank' : ''}`} key={i}>
            {i >= blanks && <span>{i - blanks + 1}</span>}
          </div>
        ))}
      </div>
      <ConnectionNote />
    </Panel>
  )
}
function Directory({ module }: { module: Module }) {
  const [tab, setTab] = useState(module.labels[0])
  return (
    <>
      <div
        className="workspace-tabs"
        role="tablist"
        aria-label="Workspace sections"
      >
        {module.labels.map((l) => (
          <button
            role="tab"
            tabIndex={tab === l ? 0 : -1}
            onKeyDown={(event) => {
              const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']
              if (!keys.includes(event.key)) return
              event.preventDefault()
              const index = module.labels.indexOf(l)
              const nextIndex =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? module.labels.length - 1
                    : (index +
                        (event.key === 'ArrowRight' ? 1 : -1) +
                        module.labels.length) %
                      module.labels.length
              const next = module.labels[nextIndex]
              setTab(next)
              document
                .getElementById(`tab-${next.replaceAll(' ', '-')}`)
                ?.focus()
            }}
            aria-selected={tab === l}
            aria-controls="directory-panel"
            id={`tab-${l.replaceAll(' ', '-')}`}
            key={l}
            onClick={() => setTab(l)}
          >
            {l}
          </button>
        ))}
      </div>
      <section
        className="panel"
        role="tabpanel"
        id="directory-panel"
        aria-labelledby={`tab-${tab.replaceAll(' ', '-')}`}
      >
        <Empty
          icon={module.icon}
          title={`Your ${tab.toLowerCase()}, organised`}
          description="A shared view for the details and relationships that matter. No records are connected or stored in this release."
        />
        <div className="directory-placeholders" aria-hidden="true">
          {[1, 2, 3].map((n) => (
            <div key={n}>
              <span />
              <div>
                <i />
                <i />
              </div>
            </div>
          ))}
        </div>
        <ConnectionNote />
      </section>
    </>
  )
}
function Documents({ module }: { module: Module }) {
  const [category, setCategory] = useState(module.labels[0])
  return (
    <div className="documents-layout">
      <div className="document-folders">
        {module.labels.map((l) => (
          <button
            key={l}
            className={category === l ? 'selected' : ''}
            onClick={() => setCategory(l)}
          >
            <Folder size={18} />
            {l}
            <ChevronRight size={14} />
          </button>
        ))}
      </div>
      <Panel title={category}>
        <Empty
          icon={Folder}
          title="The way we work, in one place"
          description={`Your ${category.toLowerCase()} will have a shared home here. Document storage and uploads will be added in a future release.`}
        />
        <ConnectionNote />
      </Panel>
    </div>
  )
}
function Assistant() {
  return (
    <section className="panel assistant-workspace">
      <span className="assistant-symbol">
        <Sparkles size={29} />
      </span>
      <span className="connection-badge">
        <span className="hollow-dot" /> Not connected
      </span>
      <h2>More context. Better questions.</h2>
      <p>
        A future assistant for understanding your operations, commercial
        performance and the decisions ahead.
      </p>
      <div className="assistant-input">
        <input
          aria-label="Ask WhitfieldOS (not connected)"
          placeholder="Ask a question about your business…"
          disabled
        />
        <LockKeyhole size={18} />
      </div>
      <div className="prompt-grid">
        {[
          'What does the workload ahead look like?',
          'Where might we need more capacity?',
          'What should management focus on?',
        ].map((q) => (
          <div key={q}>
            <CircleHelp size={16} />
            <span>{q}</span>
          </div>
        ))}
      </div>
      <p className="assistant-disclaimer">
        Illustrative prompts only. No AI model, business data or external
        service is connected.
      </p>
    </section>
  )
}
function Settings() {
  return (
    <div className="settings-grid">
      {[
        {
          icon: Building2,
          title: 'Organisation',
          description: 'Whitfield Plumbing, Heating & Cooling',
          body: 'Your organisation profile and workspace preferences will be configurable in a future release.',
        },
        {
          icon: Palette,
          title: 'Appearance',
          description: 'WhitfieldOS · Graphite & blue',
          body: 'A shared design system provides consistent typography, colours and components across every workspace.',
        },
        {
          icon: ShieldCheck,
          title: 'Roles & access',
          description: 'Designed for the whole business',
          body: 'Owner / Director, Operations Manager, Administration, Engineer and Marketing. Access controls and authentication are not enabled yet.',
        },
        {
          icon: Cable,
          title: 'Connected systems',
          description: 'No integrations connected',
          body: 'Explore the planned integration directory. No external accounts are accessed in this release.',
        },
      ].map((s) => (
        <Panel key={s.title} title={s.title}>
          <div className="settings-body">
            <s.icon size={23} />
            <h3>{s.description}</h3>
            <p>{s.body}</p>
            {s.title === 'Connected systems' && (
              <Link to="/integrations" className="text-link">
                View integrations <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </Panel>
      ))}
    </div>
  )
}
export default function Workspace({ module }: { module: Module }) {
  if (module.type === 'route') return <RoutePlanner />
  if (module.type === 'registration') return <WarrantyRegistration />
  if (module.type === 'calls') return <CallDesk />
  if (module.type === 'triage') return <TriageFlow />
  return (
    <>
      <PageHeader
        title={module.title}
        description={module.description}
        kicker="WHITFIELDOS WORKSPACE"
      >
        {module.type !== 'integrations' && (
          <Link className="button secondary" to="/integrations">
            <Plug size={15} /> Integration directory
          </Link>
        )}
      </PageHeader>
      <div className="foundation-notice">
        <span className="hollow-dot" />
        <span>Foundation workspace</span>
        <span className="notice-divider">/</span>
        <p>
          Ready for what comes next. Live functionality is not connected in V1.
        </p>
      </div>
      {module.id === 'seo' && <WordPressShortcut />}
      {module.type === 'integrations' ? (
        <IntegrationWorkspace />
      ) : module.type === 'schedule' ? (
        <Schedule module={module} />
      ) : module.type === 'table' ? (
        <TableWorkspace module={module} />
      ) : module.type === 'pipeline' ? (
        <Pipeline module={module} />
      ) : module.type === 'analytics' ? (
        <Analytics module={module} />
      ) : module.type === 'calendar' ? (
        <CalendarWorkspace />
      ) : module.type === 'directory' ? (
        <Directory module={module} />
      ) : module.type === 'documents' ? (
        <Documents module={module} />
      ) : module.type === 'assistant' ? (
        <Assistant />
      ) : (
        <Settings />
      )}
    </>
  )
}
