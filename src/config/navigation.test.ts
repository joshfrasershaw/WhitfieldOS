import { describe, it, expect } from 'vitest'
import { groups, modules } from './navigation'
describe('application navigation contract', () => {
  it('defines every requested business workspace with unique routes', () => {
    expect(groups).toHaveLength(7)
    expect(modules).toHaveLength(29)
    expect(new Set(modules.map((m) => m.id)).size).toBe(modules.length)
    expect(modules[0].id).toBe('')
  })
  it('keeps module metadata usable by routing and future access control', () => {
    for (const m of modules) {
      expect(m.title.length).toBeGreaterThan(3)
      expect(m.description.length).toBeGreaterThan(15)
      expect(m.roles).toContain('owner')
      expect(m.icon).toBeDefined()
      if (m.id && m.type !== 'integrations')
        expect(m.labels.length).toBeGreaterThan(0)
    }
  })
})
