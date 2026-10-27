import { useState } from 'react'
import {
  AirVent,
  ExternalLink,
  Flame,
  HardDrive,
  Plus,
  Save,
  Trash2,
  Droplets,
} from 'lucide-react'
import { PageHeader, Panel } from '../components/ui'
type Category = 'gas' | 'oil' | 'aircon' | 'cylinder'
type WarrantyLink = {
  id: string
  category: Category
  manufacturer: string
  url: string
}
const categories: Array<{
  id: Category
  title: string
  description: string
  icon: typeof Flame
}> = [
  {
    id: 'gas',
    title: 'Gas Boilers',
    description:
      'Manufacturer warranty registration for new gas boiler installations.',
    icon: Flame,
  },
  {
    id: 'oil',
    title: 'Oil Boilers',
    description:
      'Manufacturer warranty registration for new oil boiler installations.',
    icon: Droplets,
  },
  {
    id: 'aircon',
    title: 'Air Conditioning',
    description: 'Register newly installed air conditioning equipment.',
    icon: AirVent,
  },
  {
    id: 'cylinder',
    title: 'Hot Water Cylinders',
    description:
      'Register the warranty for a newly installed hot water cylinder.',
    icon: HardDrive,
  },
]
const storageKey = 'whitfieldos-warranty-links-v1'
function savedLinks(): WarrantyLink[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x): x is WarrantyLink =>
        !!x &&
        typeof x === 'object' &&
        typeof x.manufacturer === 'string' &&
        typeof x.url === 'string' &&
        typeof x.id === 'string' &&
        categories.some((c) => c.id === x.category) &&
        allowedUrl(x.url),
    )
  } catch {
    return []
  }
}
function allowedUrl(raw: string): boolean {
  try {
    const url = new URL(raw)
    return (
      url.protocol === 'https:' &&
      !!url.hostname &&
      !url.username &&
      !url.password
    )
  } catch {
    return false
  }
}
export default function WarrantyRegistration() {
  const [links, setLinks] = useState<WarrantyLink[]>(savedLinks)
  const [category, setCategory] = useState<Category>('gas')
  const [manufacturer, setManufacturer] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  function update(next: WarrantyLink[]) {
    setLinks(next)
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      setError(
        'Could not save links in this browser. Please check storage settings.',
      )
    }
  }
  function addLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!manufacturer.trim() || !allowedUrl(url)) {
      setError('Enter the manufacturer and a valid https:// registration URL.')
      return
    }
    update([
      ...links,
      {
        id: crypto.randomUUID(),
        category,
        manufacturer: manufacturer.trim(),
        url: url.trim(),
      },
    ])
    setManufacturer('')
    setUrl('')
    setError('')
  }
  return (
    <>
      <PageHeader
        title="Product & Warranty Registration"
        description="One place to open manufacturer registration websites after installations. Registration itself always happens with the manufacturer."
        kicker="OPERATIONS"
      />
      <div className="foundation-notice">
        <ExternalLink size={15} />
        <span>External registration only</span>
        <span className="notice-divider">/</span>
        <p>
          No warranty tracking, customer records or in-app registration forms.
        </p>
      </div>
      <div className="warranty-grid">
        {categories.map((item) => (
          <section className="panel warranty-card" key={item.id}>
            <div className="warranty-icon">
              <item.icon size={23} strokeWidth={1.7} />
            </div>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            {links.filter((link) => link.category === item.id).length ? (
              <div className="warranty-links">
                {links
                  .filter((link) => link.category === item.id)
                  .map((link) => (
                    <div className="warranty-link-row" key={link.id}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="warranty-external"
                      >
                        {link.manufacturer} <ExternalLink size={14} />
                      </a>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={'Remove ' + link.manufacturer + ' link'}
                        onClick={() =>
                          update(links.filter((x) => x.id !== link.id))
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="warranty-empty">No manufacturer links added yet.</p>
            )}
            <button
              type="button"
              className="text-link warranty-add"
              onClick={() => {
                setCategory(item.id)
                document
                  .getElementById('registration-link-form')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
            >
              <Plus size={14} /> Add manufacturer
            </button>
          </section>
        ))}
      </div>
      <Panel title="Configure a registration link">
        <form
          id="registration-link-form"
          className="tool-fields"
          onSubmit={addLink}
        >
          <div className="tool-fields three">
            <label>
              Product type
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Manufacturer
              <input
                value={manufacturer}
                placeholder="Manufacturer name"
                maxLength={80}
                onChange={(e) => setManufacturer(e.target.value)}
              />
            </label>
            <label>
              Warranty registration URL
              <input
                type="url"
                value={url}
                placeholder="https://..."
                onChange={(e) => setUrl(e.target.value)}
              />
            </label>
          </div>
          <button type="submit" className="button">
            <Save size={15} /> Save link in this browser
          </button>
          {error && (
            <p className="tool-error" role="alert">
              {error}
            </p>
          )}
        </form>
        <p className="tool-help">
          This is a no-cost prototype. Links are saved only in this browser, not
          shared between staff or devices. When you supply verified manufacturer
          URLs, we can move them into central configuration.
        </p>
      </Panel>
    </>
  )
}
