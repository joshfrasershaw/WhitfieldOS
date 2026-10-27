export interface Coordinate {
  id: string
  label: string
  postcode: string
  lat: number
  lon: number
}

export interface PostcodePoint {
  lat: number
  lon: number
}

export function normalisePostcode(value: string): string {
  return value.toUpperCase().replace(/\s+/g, '').trim()
}

function csvCells(line: string): string[] {
  const parts: string[] = []
  let current = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"'
        i++
      } else quoted = !quoted
    } else if (char === ',' && !quoted) {
      parts.push(current.trim())
      current = ''
    } else current += char
  }
  parts.push(current.trim())
  return parts
}

/**
 * Read an offline WGS84 UK postcode CSV, with postcode, latitude, longitude
 * headers (pcds/lat/long are also accepted). No network requests.
 */
export function parsePostcodeCsv(text: string): Map<string, PostcodePoint> {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean)
  if (!lines.length) throw new Error('The file is empty.')
  const headers = csvCells(lines[0]).map((s) => s.toLowerCase().replace(/[^a-z]/g, ''))
  const find = (options: string[]) => headers.findIndex((h) => options.includes(h))
  const postcodeColumn = find(['postcode', 'pcds', 'pcd'])
  const latColumn = find(['latitude', 'lat'])
  const lonColumn = find(['longitude', 'lon', 'long', 'lng'])
  if ([postcodeColumn, latColumn, lonColumn].some((n) => n < 0)) {
    throw new Error('CSV needs postcode, latitude and longitude columns (or pcds, lat, long).')
  }
  const index = new Map<string, PostcodePoint>()
  for (let i = 1; i < lines.length; i++) {
    const cells = csvCells(lines[i])
    const postcode = normalisePostcode(cells[postcodeColumn] || '')
    const lat = Number(cells[latColumn])
    const lon = Number(cells[lonColumn])
    if (postcode && Number.isFinite(lat) && Number.isFinite(lon) &&
        lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      index.set(postcode, { lat, lon })
    }
  }
  if (!index.size) throw new Error('No valid postcode coordinates were found.')
  return index
}

/** Great-circle distance in km; NOT road mileage or travel time. */
export function distanceKm(a: PostcodePoint, b: PostcodePoint): number {
  const radians = (n: number) => n * Math.PI / 180
  const dLat = radians(b.lat - a.lat)
  const dLon = radians(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)))
}

export function totalDistance(start: PostcodePoint, stops: Coordinate[], end: PostcodePoint): number {
  let previous: PostcodePoint = start
  let total = 0
  for (const stop of stops) {
    total += distanceKm(previous, stop)
    previous = stop
  }
  return total + distanceKm(previous, end)
}

/** Deterministic nearest-neighbour route, refined by 2-opt; fixed start/end. */
export function optimiseRoute(start: PostcodePoint, end: PostcodePoint, jobs: Coordinate[]): Coordinate[] {
  const remaining = [...jobs]
  const ordered: Coordinate[] = []
  let current = start
  while (remaining.length) {
    let closest = 0
    for (let i = 1; i < remaining.length; i++) {
      if (distanceKm(current, remaining[i]) < distanceKm(current, remaining[closest])) closest = i
    }
    const [next] = remaining.splice(closest, 1)
    ordered.push(next)
    current = next
  }
  if (ordered.length < 3) return ordered
  let improved = true
  let rounds = 0
  while (improved && rounds++ < 40) {
    improved = false
    for (let i = 0; i < ordered.length - 1; i++) {
      for (let j = i + 1; j < ordered.length; j++) {
        const a = i === 0 ? start : ordered[i - 1]
        const b = ordered[i]
        const c = ordered[j]
        const d = j === ordered.length - 1 ? end : ordered[j + 1]
        if (distanceKm(a, c) + distanceKm(b, d) + 0.000001 <
            distanceKm(a, b) + distanceKm(c, d)) {
          const reversed = ordered.slice(i, j + 1).reverse()
          ordered.splice(i, j - i + 1, ...reversed)
          improved = true
        }
      }
    }
  }
  return ordered
}

export function googleMapsRouteUrl(start: string, end: string, jobs: Coordinate[]): string {
  const url = new URL('https://www.google.com/maps/dir/')
  url.searchParams.set('api', '1')
  url.searchParams.set('origin', start)
  url.searchParams.set('destination', end)
  url.searchParams.set('travelmode', 'driving')
  if (jobs.length) url.searchParams.set('waypoints', jobs.map((job) => job.postcode).join('|'))
  return url.toString()
}
