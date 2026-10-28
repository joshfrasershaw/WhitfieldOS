import { test, expect } from '@playwright/test'

test('warranty cards open their supplied manufacturer portals', async ({
  page,
}) => {
  await page.goto('/warranty-registration')
  const bosch = 'https://installer.worcester-bosch.co.uk/jobs/guarantees'
  const gledhill = 'https://installerconnect.com/app/dashboard'
  for (const category of ['Gas Boilers', 'Oil Boilers', 'Air Conditioning']) {
    const card = page.getByRole('link', {
      name: category + ' — open Worcester Bosch registration',
    })
    await expect(card).toHaveAttribute('href', bosch)
    await expect(card).toHaveAttribute('target', '_blank')
    await expect(card).toHaveAttribute('rel', 'noopener noreferrer')
  }
  const cylinderCard = page.getByRole('link', {
    name: 'Hot Water Cylinders — open Gledhill Installer Connect registration',
  })
  await expect(cylinderCard).toHaveAttribute('href', gledhill)
  await expect(cylinderCard).toHaveAttribute('target', '_blank')
  await expect(
    page.getByRole('heading', { name: 'Product & Warranty Registration' }),
  ).toBeVisible()
})

test('route planner works offline with an uploaded coordinate file', async ({
  page,
}) => {
  await page.goto('/route-planner')
  await page.getByText('Import more precise postcode coordinates').click()
  await page.getByLabel('Import postcode CSV').setInputFiles({
    name: 'postcodes.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(
      'postcode,latitude,longitude\nSTART,52,-3\nFIRST,52.1,-3\nSECOND,53,-3',
    ),
  })
  await expect(page.getByText('3 postcode coordinates loaded')).toBeVisible()
  await page.getByLabel('Start postcode').fill('START')
  await page.getByLabel('Job / customer label').fill('First')
  await page.getByLabel('Postcode', { exact: true }).fill('SECOND')
  await page.getByRole('button', { name: 'Add job', exact: true }).click()
  await page.getByLabel('Job / customer label').fill('Second')
  await page.getByLabel('Postcode', { exact: true }).fill('FIRST')
  await page.getByRole('button', { name: 'Add job', exact: true }).click()
  await page.getByRole('button', { name: 'Optimise job order' }).click()
  await expect(page.getByText('STRAIGHT-LINE TOTAL')).toBeVisible()
  await expect(
    page.getByRole('link', { name: /Check driving route in Google Maps/ }),
  ).toHaveAttribute('href', /google.com\/maps\/dir/)
})

test('call desk keeps manual enquiry distinct from a live caller match', async ({
  page,
}) => {
  await page.goto('/call-desk')
  await expect(
    page.getByText(/Calls cannot appear automatically yet/),
  ).toBeVisible()
  await page.getByLabel('Caller telephone number').fill('07911123456')
  await page.getByLabel('Customer name (if known)').fill('Test Caller')
  await expect(
    page.getByRole('link', { name: /Open WhatsApp chat/ }),
  ).toHaveAttribute('href', 'https://wa.me/447911123456')
  await expect(page.getByText('Name: Test Caller')).toBeVisible()
})

test('route planner runs with built-in postcode districts, no CSV and no external API', async ({
  page,
}) => {
  const external: string[] = []
  page.on('request', (request) => {
    if (
      !request.url().startsWith('http://127.0.0.1:') &&
      !request.url().startsWith('http://localhost:')
    )
      external.push(request.url())
  })
  await page.goto('/route-planner')
  await page.getByLabel('Start postcode').fill('SY4 3AB')
  await page.getByLabel('Job / customer label').fill('Oil service')
  await page.getByLabel('Postcode', { exact: true }).fill('CW3 0HY')
  await page.getByRole('button', { name: 'Add job', exact: true }).click()
  await page.getByLabel('Job / customer label').fill('Gas diagnostic')
  await page.getByLabel('Postcode', { exact: true }).fill('ST19 9QE')
  await page.getByRole('button', { name: 'Add job', exact: true }).click()
  await page.getByRole('button', { name: 'Optimise job order' }).click()
  await expect(page.getByText('STRAIGHT-LINE TOTAL')).toBeVisible()
  await expect(
    page.getByText(/location lookups use approximate district centres/),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: /Check driving route in Google Maps/ }),
  ).toHaveAttribute('href', /google.com\/maps\/dir/)
  expect(external).toEqual([])
})
