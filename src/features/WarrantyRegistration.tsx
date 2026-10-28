import {
  AirVent,
  ArrowUpRight,
  Droplets,
  ExternalLink,
  Flame,
  HardDrive,
} from 'lucide-react'
import { PageHeader } from '../components/ui'

const registrationOptions = [
  {
    id: 'gas',
    title: 'Gas Boilers',
    platform: 'Worcester Bosch',
    description: 'Register a new gas boiler guarantee.',
    url: 'https://installer.worcester-bosch.co.uk/jobs/guarantees',
    icon: Flame,
  },
  {
    id: 'oil',
    title: 'Oil Boilers',
    platform: 'Worcester Bosch',
    description: 'Register a new oil boiler guarantee.',
    url: 'https://installer.worcester-bosch.co.uk/jobs/guarantees',
    icon: Droplets,
  },
  {
    id: 'aircon',
    title: 'Air Conditioning',
    platform: 'Worcester Bosch',
    description: 'Register a new air conditioning guarantee.',
    url: 'https://installer.worcester-bosch.co.uk/jobs/guarantees',
    icon: AirVent,
  },
  {
    id: 'cylinder',
    title: 'Hot Water Cylinders',
    platform: 'Gledhill Installer Connect',
    description: 'Register a new cylinder guarantee.',
    url: 'https://installerconnect.com/app/dashboard',
    icon: HardDrive,
  },
]

export default function WarrantyRegistration() {
  return (
    <>
      <PageHeader
        title="Product & Warranty Registration"
        description="Choose the installed equipment to open the relevant manufacturer registration portal."
        kicker="OPERATIONS"
      />
      <div className="foundation-notice">
        <ExternalLink size={15} />
        <span>Manufacturer portals</span>
        <span className="notice-divider">/</span>
        <p>Registration happens on the manufacturer's website, in a new tab. No forms, tracking or API connection in WhitfieldOS.</p>
      </div>

      <div className="warranty-grid">
        {registrationOptions.map((item) => (
          <a
            key={item.id}
            className="panel warranty-card warranty-card-link"
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${item.title} — open ${item.platform} registration`}
          >
            <span className="warranty-card-top">
              <span className="warranty-icon">
                <item.icon size={23} strokeWidth={1.7} />
              </span>
              <ArrowUpRight size={19} aria-hidden="true" />
            </span>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <span className="warranty-card-platform">
              {item.platform}
              <ExternalLink size={13} aria-hidden="true" />
            </span>
          </a>
        ))}
      </div>
      <p className="tool-help">
        Use the correct manufacturer's portal for the product being installed.
        The links above cover Worcester Bosch gas, oil and air conditioning, plus Gledhill cylinders.
        Other brands can be added when you supply their registration pages.
      </p>
    </>
  )
}
