import { useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Check,
  ClipboardCopy,
  ExternalLink,
  Map as MapIcon,
  Plus,
  Route,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import {
  distanceKm,
  googleMapsRouteUrl,
  optimiseRoute,
  parsePostcodeCsv,
  resolvePostcode,
  totalDistance,
} from '../lib/routing'
import type { Coordinate, PostcodePoint } from '../lib/routing'
import { OUTCODE_COUNT } from '../data/outcodes'
import { PageHeader, Panel } from '../components/ui'

interface Job {
  id: string
  label: string
  postcode: string
}

export default function RoutePlanner() {
  const [index, setIndex] = useState<Map<string, PostcodePoint>>(new Map())
  const [filename, setFilename] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [label, setLabel] = useState('')
  const [postcode, setPostcode] = useState('')
  const [bulk, setBulk] = useState('')
  const [ordered, setOrdered] = useState<Coordinate[] | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [baseline, setBaseline] = useState<number | null>(null)
  const [approximateStops, setApproximateStops] = useState(0)
  const startPoint = resolvePostcode(start, index)?.point
  const endPoint = resolvePostcode(end || start, index)?.point
  const distance =
    ordered && startPoint && endPoint
      ? totalDistance(startPoint, ordered, endPoint)
      : null

  async function loadPostcodes(file?: File) {
    if (!file) return
    try {
      const points = parsePostcodeCsv(await file.text())
      setIndex(points)
      setFilename(file.name)
      setOrdered(null)
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to read this CSV.')
    }
  }

  function addJobs(newJobs: Array<{ label: string; postcode: string }>) {
    setJobs((current) => current.concat(
      newJobs.filter((job) => job.postcode.trim()).map((job) => ({
        id: crypto.randomUUID(),
        label: job.label.trim() || 'Job',
        postcode: job.postcode.trim().toUpperCase(),
      })),
    ))
    setOrdered(null)
    setCopied(false)
    setError('')
  }

  function calculate() {
    setOrdered(null)
    setCopied(false)
    setError('')
    const origin = resolvePostcode(start, index)?.point
    const destination = resolvePostcode(end || start, index)?.point
    if (!origin || !destination) {
      setError('Enter a recognised UK start and end postcode. An empty finish means return to the starting postcode.')
      return
    }
    if (!jobs.length) {
      setError('Add at least one job.')
      return
    }
    const missing = jobs.filter((job) => !resolvePostcode(job.postcode, index))
    if (missing.length) {
      setError('Unrecognised postcodes: ' + missing.map((job) => job.postcode).join(', ') + '. Check spelling or import more precise coordinates.')
      return
    }
    const points: Coordinate[] = jobs.map((job) => ({
      ...job,
      ...resolvePostcode(job.postcode, index)!.point,
    }))
    const approximate = [start, end || start, ...jobs.map((job) => job.postcode)]
      .filter((value) => resolvePostcode(value, index)?.precision === 'district')
      .length
    setApproximateStops(approximate)
    setBaseline(totalDistance(origin, points, destination))
    setOrdered(optimiseRoute(origin, destination, points))
  }

  function move(from: number, direction: number) {
    if (!ordered) return
    const to = from + direction
    if (to < 0 || to >= ordered.length) return
    const next = [...ordered]
    ;[next[from], next[to]] = [next[to], next[from]]
    setOrdered(next)
    setCopied(false)
  }

  async function copyRun() {
    if (!ordered) return
    const summary = [
      'WHITFIELD ENGINEER RUN — approximate route',
      'Start: ' + start.toUpperCase(),
      ...ordered.map((job, i) => (i + 1) + '. ' + job.label + ' — ' + job.postcode),
      'Finish: ' + (end || start).toUpperCase(),
      'Verify actual roads, driving times and appointments before dispatch.',
    ].join('\n')
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
    } catch {
      setError('Copy unavailable; use the ordered list displayed above.')
    }
  }

  return (
    <>
      <PageHeader
        title="Route Planner"
        description="Enter your start, finish and job postcodes. Get an ordered engineer run instantly — no API keys or subscriptions."
        kicker="OPERATIONS"
      />
      <div className="foundation-notice">
        <Route size={15} />
        <span>Local postcode routing ready</span>
        <span className="notice-divider">/</span>
        <p>Uses approximate postcode district positions, not road distances or driving times. No data is sent to an API.</p>
      </div>
      <div className="tool-grid">
        <div className="tool-stack">
          <Panel title="1 · Start and finish">
            <div className="tool-fields two">
              <label>
                Start postcode
                <input
                  aria-label="Start postcode"
                  value={start}
                  placeholder="e.g. SY4 3AB"
                  onChange={(event) => { setStart(event.target.value); setOrdered(null) }}
                />
              </label>
              <label>
                End postcode (optional)
                <input
                  aria-label="End postcode (optional)"
                  value={end}
                  placeholder="Same as start"
                  onChange={(event) => { setEnd(event.target.value); setOrdered(null) }}
                />
              </label>
            </div>
            <p className="tool-help">Choose where the engineer starts and ends. Leave the finish empty for a round trip.</p>
          </Panel>
          <Panel title="2 · Add jobs">
            <form className="tool-fields" onSubmit={(event) => {
              event.preventDefault()
              addJobs([{ label, postcode }])
              setLabel('')
              setPostcode('')
            }}>
              <label>
                Job / customer label
                <input aria-label="Job / customer label" value={label} placeholder="e.g. Oil service" onChange={(event) => setLabel(event.target.value)} />
              </label>
              <label>
                Postcode
                <input aria-label="Postcode" value={postcode} required placeholder="Full job postcode" onChange={(event) => setPostcode(event.target.value)} />
              </label>
              <button type="submit" className="button"><Plus size={15} /> Add job</button>
            </form>
            <label className="tool-block-label">
              Or paste several jobs (one per line, optionally "Description, postcode")
              <textarea rows={4} value={bulk} onChange={(event) => setBulk(event.target.value)} placeholder={'SY1 1AA\nOil service, CW3 0HY\nST19 9QE'} />
            </label>
            <button type="button" className="button secondary" onClick={() => {
              addJobs(bulk.split(/\r?\n/).map((line) => {
                const fields = line.split(',')
                return {
                  label: fields.length > 1 ? fields.slice(0, -1).join(',') : 'Job',
                  postcode: fields[fields.length - 1],
                }
              }))
              setBulk('')
            }}>Add pasted jobs</button>
            <div className="job-list">
              {jobs.map((job, i) => (
                <div className="job-list-item" key={job.id}>
                  <span className="job-number">{i + 1}</span>
                  <div><strong>{job.label}</strong><small>{job.postcode}</small></div>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={'Remove ' + job.label + ' ' + job.postcode}
                    onClick={() => { setJobs(jobs.filter((entry) => entry.id !== job.id)); setOrdered(null) }}
                  ><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
            <button type="button" className="button" onClick={calculate} disabled={!jobs.length}>
              <Route size={15} /> Optimise job order
            </button>
            {error && <p className="tool-error" role="alert">{error}</p>}
          </Panel>
          <Panel title="Postcode accuracy · optional">
            <p className="tool-help">
              <strong>{OUTCODE_COUNT.toLocaleString('en-GB')} postcode districts included.</strong>{' '}
              The planner works immediately with UK postcodes. They are resolved to their wider district centres, which can be several kilometres from the actual job.
            </p>
            <details className="route-accuracy-options">
              <summary>Import more precise postcode coordinates</summary>
              <p className="tool-help">For better positioning, optionally provide a local CSV with <strong>postcode, latitude, longitude</strong> columns. The file stays in this browser session.</p>
              <label className="file-drop">
                <UploadCloud size={18} />
                <span>{filename || 'Choose a postcode CSV'}</span>
                <input type="file" accept=".csv,text/csv" aria-label="Import postcode CSV" onChange={(event) => void loadPostcodes(event.target.files?.[0])} />
              </label>
              <p className="tool-meta">
                {index.size ? index.size.toLocaleString('en-GB') + ' postcode coordinates loaded' : 'Built-in district coordinates active'}
              </p>
            </details>
          </Panel>
        </div>
        <div className="tool-stack">
          <Panel title="Suggested engineer run">
            {!ordered ? (
              <div className="tool-empty">
                <MapIcon size={33} />
                <h3>Your jobs, in a sensible order</h3>
                <p>Enter your start postcode and jobs, then select Optimise. No postcode upload is needed.</p>
              </div>
            ) : (
              <>
                <div className="route-summary">
                  <div><span>STRAIGHT-LINE TOTAL</span><strong>{distance?.toFixed(1)} km</strong></div>
                  <div><span>JOBS</span><strong>{ordered.length}</strong></div>
                  <div>
                    <span>REDUCTION VS ENTERED ORDER</span>
                    <strong>{baseline && distance !== null ? Math.max(0, (100 * (baseline - distance)) / baseline).toFixed(0) + '%' : '—'}</strong>
                  </div>
                </div>
                <p className="tool-help" role="status">
                  {approximateStops
                    ? approximateStops + ' location lookups use approximate district centres. Verify the actual driving route before dispatch.'
                    : 'Using imported coordinates; distances still do not account for roads.'}
                </p>
                <div className="route-result">
                  <div className="route-endpoint"><strong>START</strong><span>{start.toUpperCase()}</span></div>
                  {ordered.map((job, i) => (
                    <div className="route-step" key={job.id}>
                      <span className="job-number">{i + 1}</span>
                      <div>
                        <strong>{job.label}</strong>
                        <small>{job.postcode} · {distanceKm(i ? ordered[i - 1] : startPoint!, job).toFixed(1)} km straight-line leg</small>
                      </div>
                      <div className="reorder-controls">
                        <button className="icon-button" aria-label={'Move ' + job.label + ' up'} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={14} /></button>
                        <button className="icon-button" aria-label={'Move ' + job.label + ' down'} disabled={i === ordered.length - 1} onClick={() => move(i, 1)}><ArrowDown size={14} /></button>
                      </div>
                    </div>
                  ))}
                  <div className="route-endpoint"><strong>FINISH</strong><span>{(end || start).toUpperCase()}</span></div>
                </div>
                <button type="button" className="button secondary" onClick={() => void copyRun()}>
                  {copied ? <Check size={15} /> : <ClipboardCopy size={15} />}
                  {copied ? 'Run copied' : 'Copy ordered run'}
                </button>
                {ordered.length <= 9 ? (
                  <a className="button" href={googleMapsRouteUrl(start, end || start, ordered)} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={15} /> Check driving route in Google Maps
                  </a>
                ) : (
                  <p className="tool-help">For reliable Google Maps hand-off, split the run into groups of nine stops or fewer. Your complete ordered list remains above.</p>
                )}
                <p className="tool-help">Google Maps is opened only when you choose the external link. It works out its own road directions and may have waypoint limits.</p>
              </>
            )}
          </Panel>
          <Panel title="How the optimiser works">
            <div className="tool-explainer">
              <p><strong>Pure code:</strong> for up to ten jobs, the shortest straight-line ordering is calculated exactly, with your chosen start and end. Larger runs use a fast routing heuristic.</p>
              <p><strong>No paid services:</strong> postcode district positions are bundled within WhitfieldOS. The calculations happen locally in your browser, with no mapping API requests.</p>
              <p><strong>Not a driving-time planner:</strong> road layouts, traffic, appointment windows, bridges and engineer availability are not considered. District coordinates are approximate.</p>
              <p><strong>Privacy:</strong> entered job details are not uploaded or saved; refreshing the page clears them.</p>
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
