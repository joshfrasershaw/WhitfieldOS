import { useState } from 'react'
import {
  ClipboardCopy,
  ExternalLink,
  MessageCircle,
  PhoneIncoming,
  ShieldAlert,
} from 'lucide-react'
import { PageHeader, Panel } from '../components/ui'
const serviceTypes = [
  'Gas boiler service',
  'Oil boiler service',
  'Gas boiler fault / diagnostic',
  'Oil boiler fault / diagnostic',
  'Boiler installation',
  'Air conditioning',
  'Hot water cylinder',
  'Other enquiry',
]
function whatsappNumber(number: string) {
  let digits = number.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = '44' + digits.slice(1)
  return digits.length >= 10 && digits.length <= 15 ? digits : ''
}
export default function CallDesk() {
  const [number, setNumber] = useState('')
  const [name, setName] = useState('')
  const [postcode, setPostcode] = useState('')
  const [service, setService] = useState(serviceTypes[0])
  const [notes, setNotes] = useState('')
  const [profile, setProfile] = useState('')
  const [message, setMessage] = useState('')
  const waNumber = whatsappNumber(number)
  const profileValid = (() => {
    try {
      const url = new URL(profile)
      return (
        url.protocol === 'https:' &&
        (url.hostname === 'servicem8.com' ||
          url.hostname.endsWith('.servicem8.com')) &&
        !url.username &&
        !url.password
      )
    } catch {
      return false
    }
  })()
  const summary = [
    'WhitfieldOS enquiry brief (not booked)',
    'Name: ' + (name || 'Not supplied'),
    'Telephone: ' + (number || 'Not supplied'),
    'Postcode: ' + (postcode || 'Not supplied'),
    'Enquiry: ' + service,
    'Notes: ' + (notes || 'None'),
  ].join('\n')
  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(summary)
      setMessage('Brief copied. Create the booking in ServiceM8 as normal.')
    } catch {
      setMessage(
        'Clipboard unavailable. Select the brief below and copy it manually.',
      )
    }
  }
  return (
    <>
      <PageHeader
        title="Call Desk & Customer Handover"
        description="A single place to capture an enquiry, prepare a booking brief and open your existing communications channels."
        kicker="ADMINISTRATION & COMMERCIAL"
      />
      <div className="foundation-notice">
        <ShieldAlert size={15} />
        <span>Manual proof of concept</span>
        <span className="notice-divider">/</span>
        <p>
          Calls cannot appear automatically yet. No caller ID bridge, customer
          lookup, CRM sync or ServiceM8 access is connected.
        </p>
      </div>
      <div className="tool-grid">
        <div className="tool-stack">
          <Panel title="Incoming enquiry">
            <div className="tool-fields two">
              <label>
                Caller telephone number
                <input
                  type="tel"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="07..."
                />
              </label>
              <label>
                Customer name (if known)
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Customer name"
                />
              </label>
              <label>
                Customer postcode
                <input
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="Postcode"
                />
              </label>
              <label>
                Enquiry type
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                >
                  {serviceTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="tool-block-label">
              Notes
              <textarea
                value={notes}
                rows={4}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Brief details of the request..."
              />
            </label>
            <button
              type="button"
              className="button"
              onClick={() => void copyBrief()}
            >
              <ClipboardCopy size={15} /> Copy booking brief
            </button>
            {message && (
              <p className="tool-help" role="status">
                {message}
              </p>
            )}
          </Panel>
          <Panel title="Communication">
            <p className="tool-help">
              WhatsApp opens the customer's chat via an external link. Sending a
              message remains a human action. No paid messaging API is required.
            </p>
            {waNumber ? (
              <a
                className="button secondary"
                target="_blank"
                rel="noopener noreferrer"
                href={'https://wa.me/' + waNumber}
              >
                <MessageCircle size={15} /> Open WhatsApp chat{' '}
                <ExternalLink size={14} />
              </a>
            ) : (
              <p className="tool-meta">
                Enter a valid UK/international telephone number to open
                WhatsApp.
              </p>
            )}
          </Panel>
        </div>
        <div className="tool-stack">
          <Panel title="ServiceM8 handover">
            <div className="tool-explainer">
              <p>
                <strong>ServiceM8 remains the system of record.</strong> Job
                bookings, contact details, history, quotations and invoicing are
                managed there, not duplicated here.
              </p>
              <p>
                Once connected securely, an incoming number can be resolved
                against ServiceM8 and the matching customer record opened
                directly.
              </p>
            </div>
            <label className="tool-block-label">
              Known ServiceM8 customer profile URL (optional)
              <input
                type="url"
                value={profile}
                placeholder="Paste a ServiceM8 record link"
                onChange={(e) => setProfile(e.target.value)}
              />
            </label>
            {profileValid ? (
              <a
                className="button"
                href={profile}
                rel="noopener noreferrer"
                target="_blank"
              >
                Open ServiceM8 profile <ExternalLink size={15} />
              </a>
            ) : (
              <p className="tool-meta">
                Direct record link unavailable until supplied or retrieved from
                ServiceM8.
              </p>
            )}
            {profile && !profileValid && (
              <p className="tool-error">
                Only verified https://servicem8.com profile links are supported.
              </p>
            )}
          </Panel>
          <Panel title="Booking brief preview">
            <pre className="enquiry-preview">{summary}</pre>
            <p className="tool-help">
              All fields are held temporarily in this browser tab. Nothing is
              saved or uploaded. Do not use this publicly accessible,
              unauthenticated prototype as a permanent store for customer
              information.
            </p>
          </Panel>
          <Panel title="Future: who is calling?">
            <div className="tool-explainer">
              <p>
                <PhoneIncoming size={16} />{' '}
                <strong>
                  Inbound number → ServiceM8 match → customer screen.
                </strong>
              </p>
              <p>
                A compatible Android call-identification companion and
                authenticated backend are required. An ordinary website cannot
                read mobile call events or query private ServiceM8 records
                without permission.
              </p>
              <p>
                Only after securely connecting those systems will WhitfieldOS
                show existing customer details automatically.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
