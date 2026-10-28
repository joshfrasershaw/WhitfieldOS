import { test, expect } from '@playwright/test'
import { modules } from '../src/config/navigation'
test('every departmental route renders without console errors or page overflow', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  for (const m of modules) {
    await page.goto(`/${m.id}`)
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: m.id ? m.title : 'Dashboard',
        exact: true,
      }),
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
  expect(errors).toEqual([])
})
test('navigation, mobile drawer, categories and search work', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  if (testInfo.project.name !== 'desktop')
    await page.getByRole('button', { name: 'Open navigation' }).click()
  await page
    .getByRole('link', { name: 'Dispatch & Scheduling', exact: true })
    .click()
  await expect(page).toHaveURL(/\/dispatch$/)
  if (testInfo.project.name !== 'desktop')
    await page.getByRole('button', { name: 'Open navigation' }).click()
  await page.getByRole('button', { name: 'GROWTH', exact: true }).click()
  await expect(
    page.getByRole('link', { name: 'Marketing Performance', exact: true }),
  ).toBeHidden()
  await page.getByRole('button', { name: 'GROWTH', exact: true }).click()
  if (testInfo.project.name !== 'desktop')
    await page.getByRole('button', { name: 'Close navigation' }).click()
  await page.getByRole('button', { name: 'Search workspace' }).click()
  await page
    .getByPlaceholder('Search pages, departments, tools…')
    .fill('Finance')
  await page
    .getByRole('dialog')
    .getByRole('link', { name: 'Finance Overview' })
    .click()
  await expect(page).toHaveURL(/\/finance$/)
  await page.getByRole('button', { name: 'Notifications', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'No notifications connected' }),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  if (testInfo.project.name === 'desktop') {
    await page.getByRole('button', { name: 'Collapse sidebar' }).click()
    await expect(
      page.getByRole('button', { name: 'Expand sidebar' }),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Expand sidebar' }).click()
  }
})
test('purpose-specific controls work while unconnected state stays honest', async ({
  page,
}) => {
  await page.goto('/integrations')
  await page.getByPlaceholder('Find an integration…').fill('Xero')
  await expect(
    page.getByRole('heading', { name: 'Xero', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'ServiceM8', exact: true }),
  ).toHaveCount(0)
  await page.getByText('Planned connection', { exact: true }).click()
  await expect(page.getByText(/No data is currently accessed/)).toBeVisible()
  await page.goto('/dispatch')
  const before = await page.locator('.diary-day').first().textContent()
  await page.getByRole('button', { name: 'Next week', exact: true }).click()
  expect(await page.locator('.diary-day').first().textContent()).not.toBe(
    before,
  )
  await page.getByRole('button', { name: 'This week', exact: true }).click()
  expect(await page.locator('.diary-day').first().textContent()).toBe(before)
  await page.goto('/people')
  await page.getByRole('tab', { name: 'Leave & availability' }).click()
  await expect(page.getByRole('tabpanel')).toContainText(
    'Your leave & availability, organised',
  )
  await page.goto('/ask')
  await expect(page.getByRole('textbox')).toBeDisabled()
  await expect(page.getByText(/No AI model/)).toBeVisible()
  await page.goto('/not-a-page')
  await expect(
    page.getByRole('heading', { name: 'This page is off the map.' }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Return to Dashboard' }).click()
  await expect(page).toHaveURL('/')
})
test('dashboard is an honest complete empty shell', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.kpi')).toHaveCount(7)
  await expect(page.locator('.kpi-value')).toHaveText(
    Array(7).fill('—Not connected'),
  )
  for (const name of [
    'Today’s Jobs',
    'Engineer Locations',
    'Management Attention',
    'Forward Diary & Capacity',
    'Sales Pipeline',
    'Marketing Performance',
    'Upcoming Service Renewals',
    'Recent Activity',
    'Quick Actions',
  ])
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
  await page.screenshot({
    path: `test-results/dashboard-${test.info().project.name}.png`,
    fullPage: true,
  })
})

test('WordPress shortcut is private to this browser and opens its configured login', async ({ page }) => {
  await page.goto('/seo')
  await expect(page.getByRole('heading', { name: 'WordPress website login' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Open WordPress Login/ })).toHaveCount(0)
  const loginUrl = 'https://www.whitfieldplumbing.co.uk/wp-login.php?itsec-hb-token=example'
  await page.getByLabel('WordPress login URL').fill(loginUrl)
  await page.getByRole('button', { name: 'Save shortcut' }).click()
  await expect(page.getByRole('link', { name: /Open WordPress Login/ })).toHaveAttribute('href', loginUrl)
  await page.reload()
  await expect(page.getByRole('link', { name: /Open WordPress Login/ })).toHaveAttribute('href', loginUrl)
  await page.getByRole('button', { name: 'Clear saved link' }).click()
  await expect(page.getByRole('link', { name: /Open WordPress Login/ })).toHaveCount(0)
})
