import { test, expect } from '@playwright/test'

test('warranty hub saves an external manufacturer URL in this browser only', async ({page}) => {
  await page.goto('/warranty-registration')
  await expect(page.getByRole('heading', {name:'Gas Boilers'})).toBeVisible()
  await expect(page.getByRole('heading', {name:'Oil Boilers'})).toBeVisible()
  await expect(page.getByRole('heading', {name:'Air Conditioning'})).toBeVisible()
  await expect(page.getByRole('heading', {name:'Hot Water Cylinders'})).toBeVisible()
  await page.getByLabel('Product type').selectOption('oil')
  await page.getByLabel('Manufacturer').fill('Example Manufacturer')
  await page.getByLabel('Warranty registration URL').fill('https://example.com/register')
  await page.getByRole('button', {name:'Save link in this browser'}).click()
  await expect(page.getByRole('link', {name:/Example Manufacturer/})).toHaveAttribute('href','https://example.com/register')
})

test('route planner works offline with an uploaded coordinate file', async ({page}) => {
  await page.goto('/route-planner')
  await page.getByLabel('Import postcode CSV').setInputFiles({
    name: 'postcodes.csv', mimeType:'text/csv',
    buffer: Buffer.from('postcode,latitude,longitude\nSTART,52,-3\nFIRST,52.1,-3\nSECOND,53,-3'),
  })
  await expect(page.getByText('3 postcode coordinates loaded')).toBeVisible()
  await page.getByLabel('Start postcode').fill('START')
  await page.getByLabel('Job / customer label').fill('First')
  await page.getByLabel('Postcode', {exact:true}).fill('SECOND')
  await page.getByRole('button',{name:'Add job',exact:true}).click()
  await page.getByLabel('Job / customer label').fill('Second')
  await page.getByLabel('Postcode', {exact:true}).fill('FIRST')
  await page.getByRole('button',{name:'Add job',exact:true}).click()
  await page.getByRole('button',{name:'Optimise job order'}).click()
  await expect(page.getByText('STRAIGHT-LINE ROUTE')).toBeVisible()
  await expect(page.getByRole('link',{name:/Open route in Google Maps/})).toHaveAttribute('href',/google.com\/maps\/dir/)
})

test('call desk keeps manual enquiry distinct from a live caller match',async ({page})=>{
  await page.goto('/call-desk')
  await expect(page.getByText(/Calls cannot appear automatically yet/)).toBeVisible()
  await page.getByLabel('Caller telephone number').fill('07911123456')
  await page.getByLabel('Customer name (if known)').fill('Test Caller')
  await expect(page.getByRole('link',{name:/Open WhatsApp chat/})).toHaveAttribute('href','https://wa.me/447911123456')
  await expect(page.getByText('Name: Test Caller')).toBeVisible()
})
