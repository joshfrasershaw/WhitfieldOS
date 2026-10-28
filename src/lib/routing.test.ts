import { describe, it, expect } from 'vitest'
import {
  distanceKm,
  googleMapsRouteUrl,
  normalisePostcode,
  optimiseRoute,
  parsePostcodeCsv,
  totalDistance,
  resolvePostcode,
} from './routing'
describe('offline postcode routing', () => {
  it('resolves normal UK postcodes using bundled outward district coordinates', () => {
    const shrewsbury = resolvePostcode('SY1 1AA')
    const newport = resolvePostcode('TF10 7JF')
    expect(shrewsbury?.precision).toBe('district')
    expect(shrewsbury?.point.lat).toBeGreaterThan(52)
    expect(newport?.precision).toBe('district')
    expect(resolvePostcode('not a postcode')).toBeNull()
    const imported = new Map([['SY11AA', { lat: 52.8, lon: -2.8 }]])
    expect(resolvePostcode('SY1 1AA', imported)).toEqual({
      point: { lat: 52.8, lon: -2.8 },
      precision: 'full-postcode',
    })
  })
  it('finds an optimal straight-line route for a small job run', () => {
    const start = { lat: 52, lon: -3 }
    const end = { lat: 53, lon: -2 }
    const jobs = [
      { id: 'a', label: 'A', postcode: 'A', lat: 52.1, lon: -2.3 },
      { id: 'b', label: 'B', postcode: 'B', lat: 52.4, lon: -3.0 },
      { id: 'c', label: 'C', postcode: 'C', lat: 53.0, lon: -2.1 },
      { id: 'd', label: 'D', postcode: 'D', lat: 52.8, lon: -2.6 },
    ]
    const result = optimiseRoute(start, end, jobs)
    function permute(items: typeof jobs): (typeof jobs)[] {
      if (!items.length) return [[]]
      return items.flatMap((item, i) => permute(items.filter((_, j) => j !== i)).map((tail) => [item, ...tail]))
    }
    const best = Math.min(...permute(jobs).map((permutation) => totalDistance(start, permutation, end)))
    expect(totalDistance(start, result, end)).toBeCloseTo(best, 6)
  })
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
