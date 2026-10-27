import { describe, it, expect } from 'vitest'
import {
  distanceKm,
  googleMapsRouteUrl,
  normalisePostcode,
  optimiseRoute,
  parsePostcodeCsv,
  totalDistance,
} from './routing'
describe('offline postcode routing', () => {
  it('normalises postcodes and accepts common UK coordinate CSV headers', () => {
    expect(normalisePostcode(' sy1  1aa ')).toBe('SY11AA')
    const result = parsePostcodeCsv(
      'pcds,lat,long\n"SY1 1AA",52.71,-2.75\n"SY2 1BB",52.70,-2.70',
    )
    expect(result.get('SY11AA')).toEqual({ lat: 52.71, lon: -2.75 })
    expect(result.size).toBe(2)
  })
  it('rejects missing headers and malformed records', () => {
    expect(() =>
      parsePostcodeCsv('postcode,easting,northing\nSY1 1AA,123,456'),
    ).toThrow('CSV needs')
    expect(() =>
      parsePostcodeCsv('postcode,latitude,longitude\nAB1,x,y'),
    ).toThrow('No valid')
  })
  it('keeps fixed endpoints and improves or preserves job ordering', () => {
    const start = { lat: 52, lon: -3 }
    const end = { lat: 52, lon: -3 }
    const jobs = [
      { id: 'far', label: 'A', postcode: 'A', lat: 53, lon: -3 },
      { id: 'near', label: 'B', postcode: 'B', lat: 52.1, lon: -3 },
      { id: 'middle', label: 'C', postcode: 'C', lat: 52.5, lon: -3 },
    ]
    const result = optimiseRoute(start, end, jobs)
    expect(result.map((j) => j.id).sort()).toEqual(['far', 'middle', 'near'])
    expect(totalDistance(start, result, end)).toBeLessThanOrEqual(
      totalDistance(start, jobs, end),
    )
    expect(distanceKm(start, start)).toBeCloseTo(0)
  })
  it('creates an external Google Maps directions URL without invoking an API', () => {
    const url = new URL(
      googleMapsRouteUrl('SY1 1AA', 'SY2 1BB', [
        { id: 'a', label: 'A', postcode: 'CW3 0HY', lat: 52.8, lon: -2.5 },
      ]),
    )
    expect(url.hostname).toBe('www.google.com')
    expect(url.searchParams.get('origin')).toBe('SY1 1AA')
    expect(url.searchParams.get('waypoints')).toBe('CW3 0HY')
  })
})
