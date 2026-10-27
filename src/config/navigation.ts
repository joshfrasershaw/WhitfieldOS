import {
  LayoutDashboard,
  CalendarDays,
  ScanLine,
  Wrench,
  Package,
  CalendarClock,
  Users,
  Target,
  Kanban,
  FileText,
  RefreshCw,
  ChartNoAxesCombined,
  MousePointer2,
  Globe,
  MapPin,
  MessagesSquare,
  Star,
  PenTool,
  Wallet,
  Contact,
  ShieldCheck,
  Truck,
  Files,
  Bell,
  ChartColumn,
  TrendingUp,
  Sparkles,
  Settings,
  Plug,
  Route,
  PhoneIncoming,
  ClipboardCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
export type Role =
  'owner' | 'operations' | 'administration' | 'engineer' | 'marketing'
export type Workspace =
  | 'schedule'
  | 'route'
  | 'registration'
  | 'calls'
  | 'triage'
  | 'table'
  | 'pipeline'
  | 'analytics'
  | 'calendar'
  | 'directory'
  | 'documents'
  | 'assistant'
  | 'settings'
  | 'integrations'
export interface Module {
  id: string
  title: string
  description: string
  icon: LucideIcon
  type: Workspace
  labels: string[]
  roles: Role[]
}
const all: Role[] = [
  'owner',
  'operations',
  'administration',
  'engineer',
  'marketing',
]
function m(
  id: string,
  title: string,
  description: string,
  icon: LucideIcon,
  type: Workspace,
  labels: string[],
): Module {
  return { id, title, description, icon, type, labels, roles: all }
}
export const groups = [
  {
    title: 'COMMAND CENTRE',
    items: [
      m(
        '',
        'Overview',
        'Your business. One clear picture.',
        LayoutDashboard,
        'analytics',
        [],
      ),
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      m(
        'dispatch',
        'Dispatch & Scheduling',
        'A clear view of the diary, your people and the work ahead.',
        CalendarDays,
        'schedule',
        ['Unallocated', 'Engineer allocation', 'Daily diary'],
      ),
      m(
        'route-planner',
        'Route Planner',
        'Optimise an engineer run using offline postcode coordinates, with no paid routing API.',
        Route,
        'route',
        ['Starting point', 'Job postcodes', 'Optimised run'],
      ),
      m(
        'triage',
        'Triage & Diagnostics',
        'Turn the first conversation into a clear plan of action.',
        ScanLine,
        'triage',
        ['Receive enquiry', 'Assess symptoms', 'Recommend next steps'],
      ),
      m(
        'jobs',
        'Jobs & Field Operations',
        'Keep every job moving, from allocation to completion.',
        Wrench,
        'table',
        ['Job reference', 'Customer / site', 'Engineer', 'Status', 'Scheduled'],
      ),
      m(
        'inventory',
        'Inventory & Purchasing',
        'Visibility of parts, stock levels and purchase requirements.',
        Package,
        'table',
        ['Part / item', 'Category', 'Stock level', 'Reorder point', 'Supplier'],
      ),
      m(
        'warranty-registration',
        'Product & Warranty Registration',
        'Open manufacturer registration websites for gas, oil, air conditioning and cylinders.',
        ClipboardCheck,
        'registration',
        [
          'Gas boilers',
          'Oil boilers',
          'Air conditioning',
          'Hot water cylinders',
        ],
      ),
      m(
        'service-planning',
        'Service Planning',
        'Plan preventative work and make room for what comes next.',
        CalendarClock,
        'schedule',
        ['Planned services', 'Team availability', 'Service diary'],
      ),
    ],
  },
  {
    title: 'CUSTOMERS & COMMERCIAL',
    items: [
      m(
        'call-desk',
        'Call Desk & Customer Handover',
        'Capture an enquiry and open the existing booking and communications systems.',
        PhoneIncoming,
        'calls',
        ['Caller', 'Enquiry', 'Handover'],
      ),
      m(
        'customers',
        'Customer Intelligence',
        'A joined-up view of relationships, properties and service history.',
        Users,
        'directory',
        ['Customers', 'Properties', 'Service history'],
      ),
      m(
        'opportunities',
        'Opportunities',
        'Give every new opportunity a clear next step.',
        Target,
        'pipeline',
        ['New opportunity', 'Qualifying', 'Ready to quote'],
      ),
      m(
        'sales-pipeline',
        'Sales Pipeline',
        'Understand the work in progress and the business ahead.',
        Kanban,
        'pipeline',
        ['Enquiry', 'Qualified', 'Quoted', 'Decision', 'Won'],
      ),
      m(
        'quotes',
        'Quotes & Follow-up',
        'Keep quotations visible and follow up at the right time.',
        FileText,
        'table',
        ['Quotation', 'Customer', 'Value', 'Sent', 'Next follow-up'],
      ),
      m(
        'renewals',
        'Service Plans & Renewals',
        'Build lasting relationships with proactive service and renewal planning.',
        RefreshCw,
        'table',
        [
          'Service plan',
          'Customer',
          'Renewal date',
          'Plan status',
          'Next action',
        ],
      ),
    ],
  },
  {
    title: 'GROWTH',
    items: [
      m(
        'marketing',
        'Marketing Performance',
        'See how your marketing contributes to business growth.',
        ChartNoAxesCombined,
        'analytics',
        ['Enquiries by channel', 'Acquisition cost', 'Channel performance'],
      ),
      m(
        'google-ads',
        'Google Ads',
        'A focused view of campaigns, spend and enquiry performance.',
        MousePointer2,
        'analytics',
        ['Campaign performance', 'Advertising spend', 'Conversions'],
      ),
      m(
        'seo',
        'SEO & Website',
        'Understand search visibility, website health and organic demand.',
        Globe,
        'analytics',
        ['Search performance', 'Technical health', 'Keyword visibility'],
      ),
      m(
        'google-business',
        'Google Business Profile',
        'Manage visibility where local customers look for you.',
        MapPin,
        'analytics',
        ['Local visibility', 'Profile interactions', 'Search discovery'],
      ),
      m(
        'social',
        'Social Media',
        'Bring your publishing schedule and social channels together.',
        MessagesSquare,
        'calendar',
        ['Content calendar', 'Channel performance', 'Publishing queue'],
      ),
      m(
        'reviews',
        'Reviews & Reputation',
        'Listen to feedback and protect the reputation you have earned.',
        Star,
        'table',
        ['Source', 'Customer', 'Rating', 'Review date', 'Response'],
      ),
      m(
        'content',
        'Content Studio',
        'A workspace for useful ideas, clear stories and consistent content.',
        PenTool,
        'pipeline',
        ['Ideas', 'Drafting', 'Review', 'Ready to publish'],
      ),
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      m(
        'finance',
        'Finance Overview',
        'A clear financial picture to support better business decisions.',
        Wallet,
        'analytics',
        ['Revenue overview', 'Cash flow', 'Receivables'],
      ),
      m(
        'people',
        'HR & People',
        'Your people, their details and the support they need.',
        Contact,
        'directory',
        ['People directory', 'Leave & availability', 'People documents'],
      ),
      m(
        'compliance',
        'Training & Compliance',
        'Keep qualifications, training and obligations in view.',
        ShieldCheck,
        'table',
        [
          'Qualification',
          'Team member',
          'Expiry date',
          'Compliance status',
          'Next review',
        ],
      ),
      m(
        'assets',
        'Assets & Vehicles',
        'Know where your assets are and when they need attention.',
        Truck,
        'table',
        [
          'Asset / vehicle',
          'Assigned to',
          'Condition',
          'Service due',
          'Status',
        ],
      ),
      m(
        'documents',
        'Documents & Procedures',
        'One organised home for the way Whitfield works.',
        Files,
        'documents',
        ['Procedures', 'Templates', 'Company documents'],
      ),
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      m(
        'alerts',
        'Management Alerts',
        'The matters that need your attention, in one considered view.',
        Bell,
        'table',
        ['Priority', 'Area', 'Detail', 'Raised', 'Status'],
      ),
      m(
        'reporting',
        'Reporting & Analytics',
        'Turn connected information into useful management insight.',
        ChartColumn,
        'analytics',
        ['Business performance', 'Operational reporting', 'Custom reports'],
      ),
      m(
        'forecasting',
        'Forecasting',
        'Look ahead at workload, capacity and commercial opportunity.',
        TrendingUp,
        'analytics',
        ['Workload forecast', 'Capacity outlook', 'Revenue outlook'],
      ),
      m(
        'ask',
        'Ask WhitfieldOS',
        'A future assistant with context across your business.',
        Sparkles,
        'assistant',
        ['Business questions', 'Operational insight', 'Decision support'],
      ),
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      m(
        'settings',
        'Settings',
        'The foundations of your WhitfieldOS workspace.',
        Settings,
        'settings',
        ['Organisation', 'Appearance', 'Roles & access'],
      ),
      m(
        'integrations',
        'Integrations',
        'Connect the systems you rely on, when you are ready.',
        Plug,
        'integrations',
        [],
      ),
    ],
  },
]
export const modules = groups.flatMap((group) => group.items)
