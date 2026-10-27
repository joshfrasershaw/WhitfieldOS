import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
test('core workspace layouts meet automated WCAG checks', async ({ page }) => {
  for (const path of [
    '/',
    '/dispatch',
    '/people',
    '/integrations',
    '/ask',
    '/sales-pipeline',
    '/inventory',
  ]) {
    await page.goto(path)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
      path,
    ).toEqual([])
  }
})
