import { test, expect } from '@playwright/test'

test('ServiceM8 integration starts unverified and requires a deliberate connection test', async ({ page }) => {
  await page.goto('/integrations')
  await expect(page.getByText('Connection not checked')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Test ServiceM8 connection' })).toBeVisible()
  await expect(page.getByText('Connected to ServiceM8')).toHaveCount(0)
})

test('integration reports a ServiceM8 account only after a successful authenticated API response', async ({ page }) => {
  await page.route('**/api/servicem8/status', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ connected: true, account: 'Example Test Account' }),
    }),
  )
  await page.goto('/integrations')
  await page.getByRole('button', { name: 'Test ServiceM8 connection' }).click()
  await expect(page.getByText('Connected to ServiceM8')).toBeVisible()
  await expect(page.getByText('Example Test Account')).toBeVisible()
})

test('customer search is blocked until verified and only sends exact-name queries', async ({ page }) => {
  const requests: string[] = []
  await page.route('**/api/servicem8/status', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"connected":true,"account":"Example Test Account"}' }),
  )
  await page.route('**/api/servicem8/customers?**', async (route) => {
    requests.push(route.request().url())
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ matches: [{ uuid: '01aba7f0-0000-4000-8000-000000000001', name: 'Example Client', address: 'Example street' }] }),
    })
  })
  await page.goto('/customers')
  const find = page.getByRole('button', { name: 'Find customer' })
  await expect(find).toBeDisabled()
  await page.getByRole('button', { name: 'Test ServiceM8 connection' }).click()
  await page.getByLabel('ServiceM8 customer name').fill('Example Client')
  await find.click()
  await expect(page.getByText('Example Client', { exact: true })).toBeVisible()
  await expect(page.getByText('Example street')).toBeVisible()
  expect(new URL(requests[0]).searchParams.get('name')).toBe('Example Client')
})

test('missing Cloudflare Access fails closed rather than pretending to be connected', async ({ page }) => {
  await page.route('**/api/servicem8/status', (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"staff_access_not_configured"}' }),
  )
  await page.goto('/integrations')
  await page.getByRole('button', { name: 'Test ServiceM8 connection' }).click()
  await expect(page.getByText('Connection not verified')).toBeVisible()
  await expect(page.getByText(/Protect WhitfieldOS with Cloudflare Access/)).toBeVisible()
  await expect(page.getByText('Connected to ServiceM8')).toHaveCount(0)
})
