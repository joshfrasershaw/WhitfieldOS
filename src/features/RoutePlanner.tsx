import { useState } from 'react'
import { ArrowDown, ArrowUp, ExternalLink, Map, Plus, Route, Trash2, UploadCloud } from 'lucide-react'
import {
  googleMapsRouteUrl, normalisePostcode, optimiseRoute, parsePostcodeCsv, totalDistance,
} from '../lib/routing'
import type { Coordinate, PostcodePoint } from '../lib/routing'
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
  const [baseline, setBaseline] = useState<number | null>(null)
  const startPoint = index.get(normalisePostcode(start))
  const endPoint = index.get(normalisePostcode(end || start))
  const mileage = ordered && startPoint && endPoint ? totalDistance(startPoint, ordered, endPoint) : null

  async function loadPostcodes(file?: File) {
    if (!file) return
    try {
      const points = parsePostcodeCsv(await file.text())
      setIndex(points)
      setFilename(file.name)
      setOrdered(null)
      setError('')
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to read this CSV.') }
  }
  function addJobs(newJobs: Array<{ label: string, postcode: string }>) {
    setJobs((current) => current.concat(newJobs.filter((j) => j.postcode.trim()).map((j) => ({
      id: crypto.randomUUID(), label: j.label.trim() || 'Job', postcode: j.postcode.trim().toUpperCase(),
    }))))
    setOrdered(null)
    setError('')
  }
  function calculate() {
    setOrdered(null)
    setError('')
    if (!index.size) { setError('First import an offline postcode-to-coordinate CSV.'); return }
    const origin = index.get(normalisePostcode(start))
    const destination = index.get(normalisePostcode(end || start))
    if (!origin || !destination) { setError('Start or end postcode is missing from your CSV.'); return }
    if (!jobs.length) { setError('Add at least one job.'); return }
    const missing = jobs.filter((job) => !index.has(normalisePostcode(job.postcode)))
    if (missing.length) {
      setError('Postcode not found in the imported file: ' + missing.map((j) => j.postcode).join(', '))
      return
    }
    const withCoordinates: Coordinate[] = jobs.map((j) => ({
      ...j, ...index.get(normalisePostcode(j.postcode))!,
    }))
    setBaseline(totalDistance(origin, withCoordinates, destination))
    setOrdered(optimiseRoute(origin, destination, withCoordinates))
  }
  function move(from: number, direction: number) {
    if (!ordered) return
    const to = from + direction
    if (to < 0 || to >= ordered.length) return
    const next = [...ordered]
    ;[next[from], next[to]] = [next[to], next[from]]
    setOrdered(next)
  }
  return (
    <>
      <PageHeader title="Route Planner" description="Plan the day's job order entirely in your browser. No route APIs, subscriptions or location tracking." kicker="OPERATIONS" />
      <div className="foundation-notice"><Route size={15} /><span>Offline proof of concept</span><span className="notice-divider">/</span><p>Optimises straight-line distances, not real roads or driving times. Nothing is sent to WhitfieldOS servers.</p></div>
      <div className="tool-grid">
        <div className="tool-stack">
          <Panel title="1 · Postcode coordinates">
            <p className="tool-help">Import a CSV with <strong>postcode, latitude, longitude</strong> columns. The file is read only in this browser session. Obtain an appropriately licensed UK WGS84 postcode dataset separately; no external service is queried.</p>
            <label className="file-drop"><UploadCloud size={20} /><span>{filename || 'Select postcode CSV'}</span><input type="file" accept=".csv,text/csv" aria-label="Import postcode CSV" onChange={(event) => void loadPostcodes(event.target.files?.[0])} /></label>
            <p className="tool-meta">{index.size ? index.size.toLocaleString('en-GB') + ' postcode coordinates loaded' : 'No postcode dataset loaded'}</p>
          </Panel>
          <Panel title="2 · Route boundaries">
            <div className="tool-fields two"><label>Start postcode<input value={start} placeholder="e.g. SY..." onChange={(e) => { setStart(e.target.value); setOrdered(null) }} /></label><label>End postcode (optional)<input value={end} placeholder="Same as start" onChange={(e) => { setEnd(e.target.value); setOrdered(null) }} /></label></div>
            <p className="tool-help">Start and finish wherever each engineer works. An empty end postcode returns to the start.</p>
          </Panel>
          <Panel title="3 · Today's jobs">
            <form className="tool-fields" onSubmit={(e) => { e.preventDefault(); addJobs([{ label, postcode }]); setLabel(''); setPostcode('') }}>
              <label>Job / customer label<input value={label} placeholder="e.g. Oil service" onChange={(e) => setLabel(e.target.value)} /></label>
              <label>Postcode<input value={postcode} required placeholder="Job postcode" onChange={(e) => setPostcode(e.target.value)} /></label>
              <button type="submit" className="button"><Plus size={15} /> Add job</button>
            </form>
            <label className="tool-block-label">Or paste multiple postcodes (one per line, optional label before comma)
              <textarea rows={3} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={'SY1 1AA\nBoiler service, CW3 0HY'} />
            </label>
            <button type="button" className="button secondary" onClick={() => { addJobs(bulk.split(/\r?\n/).map((line) => { const cells = line.split(','); return { label: cells.length > 1 ? cells.slice(0, -1).join(',') : 'Job', postcode: cells[cells.length - 1] } })); setBulk('') }}>Add pasted jobs</button>
            <div className="job-list">{jobs.map((job, i) => <div className="job-list-item" key={job.id}><span className="job-number">{i + 1}</span><div><strong>{job.label}</strong><small>{job.postcode}</small></div><button type="button" className="icon-button" aria-label={'Remove ' + job.label + ' ' + job.postcode} onClick={() => { setJobs(jobs.filter((j) => j.id !== job.id)); setOrdered(null) }}><Trash2 size={15} /></button></div>)}</div>
            <button type="button" className="button" onClick={calculate} disabled={!jobs.length}><Route size={15} /> Optimise job order</button>
            {error && <p className="tool-error" role="alert">{error}</p>}
          </Panel>
        </div>
        <div className="tool-stack">
          <Panel title="Optimised route">
            {!ordered ? <div className="tool-empty"><Map size={33} /><h3>Your run, in the best available order</h3><p>Load coordinates, set a start point and add your jobs. The route will appear here.</p></div> : <>
              <div className="route-summary"><div><span>STRAIGHT-LINE ROUTE</span><strong>{mileage?.toFixed(1)} km</strong></div><div><span>STOPS</span><strong>{ordered.length}</strong></div><div><span>REDUCTION VS ENTERED ORDER</span><strong>{baseline && mileage !== null ? Math.max(0, 100 * (baseline - mileage) / baseline).toFixed(0) + '%' : '—'}</strong></div></div>
              <div className="route-result"><div className="route-endpoint"><strong>START</strong><span>{start.toUpperCase()}</span></div>{ordered.map((job, i) => <div key={job.id} className="route-step"><span className="job-number">{i + 1}</span><div><strong>{job.label}</strong><small>{job.postcode} · {distanceFromPrevious(i, ordered, startPoint!).toFixed(1)} km straight-line leg</small></div><div className="reorder-controls"><button className="icon-button" aria-label={'Move ' + job.label + ' up'} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={14} /></button><button className="icon-button" aria-label={'Move ' + job.label + ' down'} disabled={i === ordered.length - 1} onClick={() => move(i, 1)}><ArrowDown size={14} /></button></div></div>)}<div className="route-endpoint"><strong>FINISH</strong><span>{(end || start).toUpperCase()}</span></div></div>
              {ordered.length <= 9 ? <a className="button" href={googleMapsRouteUrl(start, end || start, ordered)} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} /> Open route in Google Maps</a> : <p className="tool-help">The complete order is shown above. For reliable Google Maps hand-off, split this route into groups of nine stops or fewer.</p>}
              <p className="tool-help">Google Maps calculates its own road directions. It may reorder or limit waypoints depending on the device; verify before driving.</p>
            </>}
          </Panel>
          <Panel title="What this planner does — and doesn't">
            <div className="tool-explainer"><p><strong>Does:</strong> solve a fixed-start, fixed-finish multi-stop ordering problem locally with a nearest-neighbour and 2-opt algorithm.</p><p><strong>Does not:</strong> calculate road travel time, traffic, customer appointment windows, engineers' skills or job durations. These require a richer routing model later.</p><p><strong>Data:</strong> job details and imported postcodes are memory-only. Refreshing the page clears them.</p></div>
          </Panel>
        </div>
      </div>
    </>
  )
}
function distanceFromPrevious(index: number, jobs: Coordinate[], start: PostcodePoint) {
  const prior = index ? jobs[index - 1] : start
  const current = jobs[index]
  const radians = (v: number) => v * Math.PI / 180
  const a = Math.sin(radians(current.lat - prior.lat) / 2) ** 2 +
    Math.cos(radians(prior.lat)) * Math.cos(radians(current.lat)) *
    Math.sin(radians(current.lon - prior.lon) / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)))
}
