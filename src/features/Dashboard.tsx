import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Wrench,
  Users,
  Wallet,
  PhoneIncoming,
  FileText,
  RefreshCw,
  MapPin,
  ShieldCheck,
  ChartNoAxesCombined,
  Clock3,
  Sparkles,
  Plus,
  Plug,
  Check,
  Route,
  ClipboardCheck,
} from 'lucide-react'
import { Panel, Empty, PageHeader } from '../components/ui'
const kpis = [
  {
    title: 'Active Jobs Today',
    detail: 'Jobs scheduled for today',
    icon: Wrench,
    to: 'jobs',
  },
  {
    title: 'Expected Revenue Today',
    detail: 'Value of jobs scheduled for today',
    icon: Wallet,
    to: 'jobs',
  },
  {
    title: 'Engineer Utilisation',
    detail: 'Available capacity in view',
    icon: Users,
    to: 'dispatch',
  },
  {
    title: 'Revenue — Month to Date',
    detail: 'A connected financial picture',
    icon: Wallet,
    to: 'finance',
  },
  {
    title: 'New Enquiries',
    detail: 'New opportunities to help',
    icon: PhoneIncoming,
    to: 'opportunities',
  },
  {
    title: 'Outstanding Quotations',
    detail: 'Work awaiting a decision',
    icon: FileText,
    to: 'quotes',
  },
  {
    title: 'Upcoming Service Renewals',
    detail: 'Relationships worth keeping',
    icon: RefreshCw,
    to: 'renewals',
  },
]
export default function Dashboard() {
  const now = new Date()
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your business. One clear picture."
        kicker="THE WHITFIELD WORKSPACE"
      >
        <div className="date-block">
          <CalendarDays size={17} />
          <span>
            {new Intl.DateTimeFormat('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              timeZone: 'Europe/London',
            }).format(now)}
          </span>
        </div>
      </PageHeader>
      <section className="welcome-banner">
        <div>
          <h2>A clear view starts here.</h2>
          <p>
            Your workspace is ready to grow with you. Connect your systems when
            you’re ready to bring the picture to life.
          </p>
        </div>
        <Link to="/integrations">
          Explore integrations <ArrowRight size={16} />
        </Link>
        <img
          className="welcome-van"
          src="/brand/whitfield-van.jpg"
          alt="Whitfield branded service van illustration"
          width={250}
          height={125}
        />
      </section>
      <div className="section-label">
        <h2>Business at a glance</h2>
        <span>
          <span className="hollow-dot" /> Awaiting connected data
        </span>
      </div>
      <div className="kpi-grid">
        {kpis.map((k) => (
          <Link to={`/${k.to}`} className="kpi" key={k.title}>
            <div className="kpi-top">
              <span>{k.title}</span>
              <k.icon size={16} strokeWidth={1.6} />
            </div>
            <div className="kpi-value">
              —<span>Not connected</span>
            </div>
            <p>{k.detail}</p>
            <ArrowUpRight className="kpi-arrow" size={14} />
          </Link>
        ))}
      </div>
      <div className="section-label">
        <h2>Operations</h2>
        <span>Keep the day moving</span>
      </div>
      <div className="operations-grid">
        <Panel
          title="Today’s Jobs"
          eyebrow="THE DAILY PICTURE"
          action={{ label: 'View diary', to: '/dispatch' }}
          className="jobs-panel"
        >
          <div
            className="table-scroll"
            role="region"
            aria-label="Scrollable workspace"
            tabIndex={0}
          >
            <table>
              <thead>
                <tr>
                  <th>Job / customer</th>
                  <th>Engineer</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
            </table>
          </div>
          <Empty
            icon={Wrench}
            title="Ready for the day’s work"
            description="Your scheduled jobs will appear here when your field operations system is connected."
          />
          <div className="panel-foot">
            <span className="hollow-dot" /> ServiceM8 not connected{' '}
            <Link to="/jobs">
              Explore jobs <ArrowRight size={13} />
            </Link>
          </div>
        </Panel>
        <Panel
          title="Engineer Locations"
          action={{ label: 'Open dispatch', to: '/dispatch' }}
        >
          <div className="location-frame">
            <div className="map-grid" />
            <div className="map-road road-one" />
            <div className="map-road road-two" />
            <div className="map-road road-three" />
            <div className="location-empty">
              <span className="map-pin">
                <MapPin size={22} />
              </span>
              <h3>Your team, in view</h3>
              <p>
                Location visibility will be available
                <br />
                when field data is connected.
              </p>
              <span className="map-caption">
                LOCATION PREVIEW · NO LIVE DATA
              </span>
            </div>
          </div>
        </Panel>
        <Panel
          title="Management Attention"
          action={{ label: 'View all', to: '/alerts' }}
        >
          <Empty
            icon={ShieldCheck}
            title="Space for what matters"
            description="Priority issues, upcoming deadlines and exceptions will be brought together here."
            compact
          />
          <div className="attention-foot">
            <Check size={14} />
            <span>No alert sources configured</span>
          </div>
        </Panel>
      </div>
      <Panel
        title="Forward Diary & Capacity"
        eyebrow="AHEAD OF THE CURVE"
        action={{ label: 'Service planning', to: '/service-planning' }}
        className="capacity-panel"
      >
        <div className="capacity-body">
          <div className="capacity-copy">
            <CalendarDays size={22} />
            <h3>Make room for what’s next.</h3>
            <p>
              See upcoming workload alongside available engineering capacity.
            </p>
            <span className="subtle-label">AWAITING SCHEDULING DATA</span>
          </div>
          <div
            className="capacity-chart"
            aria-label="Empty capacity chart, no scheduling data"
          >
            <div className="capacity-axis">
              <span>Capacity</span>
              <span>—</span>
              <span>—</span>
            </div>
            <div className="chart-weeks">
              {[
                'This week',
                'Week 2',
                'Week 3',
                'Week 4',
                'Week 5',
                'Week 6',
              ].map((w, i) => (
                <div className="chart-week" key={w}>
                  <div className="chart-space">
                    {i === 0 && (
                      <span className="chart-today">Current week</span>
                    )}
                  </div>
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>
      <div className="section-label">
        <h2>Commercial & growth</h2>
        <span>The business ahead</span>
      </div>
      <div className="commercial-grid">
        <Panel
          title="Sales Pipeline"
          action={{ label: 'View pipeline', to: '/sales-pipeline' }}
        >
          <div className="mini-pipeline">
            {['Enquiry', 'Qualified', 'Quoted', 'Decision'].map((s, i) => (
              <div key={s}>
                <span className={`stage-line stage-${i}`} />
                <span>{s}</span>
                <strong>—</strong>
              </div>
            ))}
          </div>
          <div className="inline-empty">
            Your next opportunities will take shape here.
          </div>
        </Panel>
        <Panel
          title="Marketing Performance"
          action={{ label: 'Explore', to: '/marketing' }}
        >
          <div className="marketing-frame">
            <div className="empty-trend">
              <span />
              <span />
              <span />
            </div>
            <div className="chart-overlay">
              <ChartNoAxesCombined size={21} />
              <span>A clearer view of what drives demand.</span>
            </div>
          </div>
          <div className="channel-labels">
            <span>Organic search</span>
            <span>Paid search</span>
            <span>Social</span>
          </div>
        </Panel>
        <Panel
          title="Upcoming Service Renewals"
          action={{ label: 'View plans', to: '/renewals' }}
        >
          <Empty
            icon={RefreshCw}
            title="Keep the relationship going"
            description="Upcoming renewals will appear here once service plans are available."
            compact
          />
        </Panel>
        <Panel
          title="Recent Activity"
          action={{ label: 'Reporting', to: '/reporting' }}
        >
          <Empty
            icon={Clock3}
            title="A record of progress"
            description="Connected activity across your business will be brought into one timeline."
            compact
          />
        </Panel>
      </div>
      <div className="bottom-grid">
        <Panel title="Quick Actions" eyebrow="A GOOD PLACE TO START">
          <div className="quick-actions">
            {[
              {
                label: 'Open the diary',
                detail: 'Dispatch & scheduling',
                to: 'dispatch',
                icon: CalendarDays,
              },
              {
                label: 'Explore opportunities',
                detail: 'Commercial workspace',
                to: 'opportunities',
                icon: Plus,
              },
              {
                label: 'Plan an engineer route',
                detail: 'Offline route planner',
                to: 'route-planner',
                icon: Route,
              },
              {
                label: 'Register an installation',
                detail: 'Manufacturer warranty links',
                to: 'warranty-registration',
                icon: ClipboardCheck,
              },
              {
                label: 'Open call desk',
                detail: 'Customer enquiry handover',
                to: 'call-desk',
                icon: PhoneIncoming,
              },
              {
                label: 'Connect your systems',
                detail: 'Integration directory',
                to: 'integrations',
                icon: Plug,
              },
            ].map((a) => (
              <Link key={a.to} to={`/${a.to}`}>
                <span className="quick-icon">
                  <a.icon size={19} />
                </span>
                <span>
                  <strong>{a.label}</strong>
                  <small>{a.detail}</small>
                </span>
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </div>
        </Panel>
        <section className="intelligence-panel">
          <div className="intelligence-heading">
            <span>
              <Sparkles size={18} /> BUSINESS INSIGHTS
            </span>
            <span className="not-connected">Not connected</span>
          </div>
          <h2>Ask WhitfieldOS</h2>
          <p>
            A future assistant to help you ask better questions, see connections
            and decide what comes next.
          </p>
          <Link to="/ask" className="assistant-link">
            <span>What would you like to understand?</span>
            <ArrowRight size={17} />
          </Link>
          <small>AI functionality is not enabled in this release.</small>
        </section>
      </div>
    </>
  )
}
