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

test('triage paths crosslink toilet leaks, present diagnostics and preserve no-booking state', async ({
  page,
}) => {
  await page.goto('/triage')
  await page.getByRole('button', { name: /Leaks Find the source/ }).click()
  await page.getByRole('button', { name: /^Toilet$/ }).click()
  await expect(
    page.getByText('Is the toilet cistern exposed or concealed?'),
  ).toHaveCount(0)
  for (const [label, value] of [
    ['What is the property postcode?', 'SY1 1AA'],
    ['May I take your name, please?', 'Customer Test'],
    ['What is the best contact number?', '07111111111'],
    [
      'Can you briefly describe what is happening?',
      'Toilet leaking from cistern',
    ],
  ]) {
    await expect(page.getByText(label)).toBeVisible()
    await page.getByRole('textbox', { name: 'Answer' }).fill(value)
    await page.getByRole('button', { name: /Continue/ }).click()
  }
  await expect(
    page.getByText('Is the toilet cistern exposed or concealed?'),
  ).toBeVisible()
  await page.getByRole('button', { name: /Concealed in cupboard/ }).click()
  await expect(page.getByText(/Concealed in cupboard/)).toHaveCount(0)
  await expect(page.getByText('What is the property postcode?')).toBeVisible()
})
test('triage can escalate gas smell immediately instead of creating a booking', async ({
  page,
}) => {
  await page.goto('/triage')
  await page.getByRole('button', { name: /Boilers & faults/ }).click()
  await page.getByRole('button', { name: 'Gas', exact: true }).click()
  await page.getByRole('button', { name: 'Fault or breakdown' }).click()
  await page.getByRole('button', { name: 'Yes', exact: true }).click()
  await expect(
    page.getByText('Possible gas escape — immediate safety action'),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: /Call 0800 111 999/ }),
  ).toHaveAttribute('href', 'tel:0800111999')
})
test('triage reaches a documented diagnostic outcome and never claims a booking', async ({
  page,
}) => {
  await page.goto('/triage')
  await page.getByRole('button', { name: /Boilers & faults/ }).click()
  await page.getByRole('button', { name: 'Oil', exact: true }).click()
  await page.getByRole('button', { name: 'Fault or breakdown' }).click()
  for (let count = 0; count < 24; count++) {
    if (
      await page
        .getByText('SCRIPT-GUIDED NEXT STEP')
        .isVisible()
        .catch(() => false)
    )
      break
    const option = page
      .locator('.triage-question .triage-options > button')
      .first()
    if (await option.isVisible()) {
      if (
        await page
          .getByText('Did Whitfield install this boiler?')
          .isVisible()
          .catch(() => false)
      ) {
        await page.getByRole('button', { name: 'No', exact: true }).click()
      } else {
        await option.click()
      }
      continue
    }
    const input = page.getByRole('textbox', { name: 'Answer' })
    if (await input.isVisible()) {
      await input.fill(count === 1 ? 'SY1 1AA' : 'Sample answer')
      await page.getByRole('button', { name: /Continue/ }).click()
    } else break
  }
  await expect(page.getByText('SCRIPT-GUIDED NEXT STEP')).toBeVisible()
  await expect(page.getByText('£199 + VAT', { exact: true })).toBeVisible()
  await expect(page.getByText(/NOT A CONFIRMED BOOKING/)).toBeVisible()
})

test('toilet leak asks cistern and leak timing once, then stops on a waste-pipe exclusion', async ({
  page,
}) => {
  await page.goto('/triage')
  await page.getByRole('button', { name: /Leaks Find the source/ }).click()
  await page.getByRole('button', { name: /^Toilet$/ }).click()
  for (const answer of [
    'SY1 1AA',
    'Sample Customer',
    '07123456789',
    'Water behind toilet',
  ]) {
    await page.getByRole('textbox', { name: 'Answer' }).fill(answer)
    await page.getByRole('button', { name: /Continue/ }).click()
  }
  await expect(
    page.getByText('Is the toilet cistern exposed or concealed?'),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Exposed ceramic cistern' }).click()
  await page.getByRole('button', { name: 'Waste pipe at back' }).click()
  await expect(
    page.getByRole('heading', { name: 'Outside current script scope' }),
  ).toBeVisible()
  const brief = page.locator('.triage-brief-preview pre')
  await expect(brief).toContainText(
    'Is the toilet cistern exposed or concealed? Exposed ceramic cistern',
  )
  await expect(brief).not.toContainText('Is the toilet exposed or concealed?')
  await expect(brief).not.toContainText(
    'Is the leak continuous or only when the fitting is used?',
  )
})

test('photo handover opens customer-addressed WhatsApp draft with the approved business message', async ({
  page,
}) => {
  await page.goto('/triage')
  await page.getByRole('button', { name: /Leaks Find the source/ }).click()
  await page.getByRole('button', { name: /^Toilet$/ }).click()
  for (const answer of [
    'SY1 1AA',
    'Sample Customer',
    '07123456789',
    'Toilet leak',
  ]) {
    await page.getByRole('textbox', { name: 'Answer' }).fill(answer)
    await page.getByRole('button', { name: /Continue/ }).click()
  }
  const request = page.getByRole('link', { name: 'Request WhatsApp photos' })
  await expect(request).toHaveAttribute('target', '_blank')
  const href = await request.getAttribute('href')
  const destination = new URL(href!)
  expect(destination.hostname).toBe('wa.me')
  expect(destination.pathname).toBe('/447123456789')
  expect(destination.searchParams.get('text')).toContain(
    'Thank you for your call.',
  )
  expect(destination.searchParams.get('text')).toContain(
    'Thank you, Josh, Whitfield Plumbing, Heating & Cooling, www.WhitfieldPlumbing.co.uk',
  )
  // The tool builds the correct link; clicking is intentionally not needed
  // because we do not want the test to contact WhatsApp.
})

test('photo request asks for customer number if none has been supplied', async ({
  page,
}) => {
  await page.goto('/triage')
  await page.getByRole('button', { name: /Toilets/ }).click()
  await page.getByRole('button', { name: 'Not flushing or filling' }).click()
  await page.getByRole('button', { name: 'Request WhatsApp photos' }).click()
  await expect(page.getByLabel('Customer WhatsApp number')).toBeVisible()
  await page.getByLabel('Customer WhatsApp number').fill('07123456789')
  await expect(
    page.getByRole('link', { name: 'Open WhatsApp draft to customer' }),
  ).toHaveAttribute('href', /wa.me\/447123456789/)
})

test('confirmed electric shower fault is assessed, not automatically priced as replacement', async ({
  page,
}) => {
  await page.goto('/triage')
  await page.getByRole('button', { name: /Showers/ }).click()
  await page.getByRole('button', { name: 'Electric shower', exact: true }).click()
  for (const answer of [
    'SY13 2JA',
    'Example Customer',
    '07123456789',
    'Shower flashing hot then cold, not holding temperature',
  ]) {
    await page.getByRole('textbox', { name: 'Answer' }).fill(answer)
    await page.getByRole('button', { name: /Continue/ }).click()
  }
  await expect(page.getByText('What does the customer want us to do?')).toBeVisible()
  await expect(page.getByText('Is the existing shower electric or mixer?')).toHaveCount(0)
  await expect(page.getByText('Is it a white box mounted on the wall?')).toHaveCount(0)
  await expect(page.getByText('Is the shower concealed behind tiles?')).toHaveCount(0)
  await expect(page.getByText('Is there a large rainfall head?')).toHaveCount(0)
  await page.getByRole('button', { name: 'Repair a fault / temperature problem' }).click()
  for (const answer of ['Electric shower brand', 'Around five years', 'Can send photos']) {
    await page.getByRole('textbox', { name: 'Answer' }).fill(answer)
    await page.getByRole('button', { name: /Continue/ }).click()
  }
  await page.getByRole('button', { name: 'Within a week' }).click()
  await expect(page.getByRole('heading', { name: 'Shower fault — refer for assessment' })).toBeVisible()
  await expect(page.locator('.triage-price')).toHaveCount(0)
  await expect(page.locator('.triage-brief-preview pre')).toContainText(
    'Repair a fault / temperature problem',
  )
})

test('confirmed electric shower like-for-like replacement alone gets an indicative installation price', async ({
  page,
}) => {
  await page.goto('/triage')
  await page.getByRole('button', { name: /Showers/ }).click()
  await page.getByRole('button', { name: 'Electric shower', exact: true }).click()
  for (const answer of ['SY1 1AA', 'Example Customer', '07123456789', 'Replace existing unit']) {
    await page.getByRole('textbox', { name: 'Answer' }).fill(answer)
    await page.getByRole('button', { name: /Continue/ }).click()
  }
  await page.getByRole('button', { name: 'Replace the existing shower' }).click()
  for (const answer of ['Shower brand', 'Eight years old', 'Yes']) {
    await page.getByRole('textbox', { name: 'Answer' }).fill(answer)
    await page.getByRole('button', { name: /Continue/ }).click()
  }
  await page.getByRole('button', { name: 'Flexible' }).click()
  await expect(page.getByRole('heading', { name: 'Electric shower replacement enquiry' })).toBeVisible()
  await expect(page.locator('.triage-price')).toContainText('£290 + VAT')
})

test('unknown shower classification uses visual clues and asks for confirmation', async ({
  page,
}) => {
  await page.goto('/triage')
  await page.getByRole('button', { name: /Showers/ }).click()
  await page.getByRole('button', { name: 'Not sure what type of shower' }).click()
  for (const answer of ['SY1 1AA', 'Example Customer', '07123456789', 'Unclear shower type']) {
    await page.getByRole('textbox', { name: 'Answer' }).fill(answer)
    await page.getByRole('button', { name: /Continue/ }).click()
  }
  await expect(page.getByText('How would the customer describe the shower?')).toBeVisible()
  await page.getByRole('button', { name: 'White electric-looking box on the wall' }).click()
  for (const answer of ['SY1 1AA', 'Example Customer', '07123456789', 'Unknown shower']) {
    await page.getByRole('textbox', { name: 'Answer' }).fill(answer)
    await page.getByRole('button', { name: /Continue/ }).click()
  }
  await expect(page.getByText('That appearance is only a clue. Can the customer confirm which type of shower they have?')).toBeVisible()
  await page.getByRole('button', { name: 'No / still unsure — request photos' }).click()
  await expect(page.getByRole('heading', { name: 'Request photographs before progressing' })).toBeVisible()
  await expect(page.locator('.triage-price')).toHaveCount(0)
})
