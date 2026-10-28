import { test, expect } from '@playwright/test'

test('Whitfield branding uses supplied images and exact company colour tokens', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  const logo = page.locator('.brand-image')
  const van = page.locator('.welcome-van')
  if (testInfo.project.name !== 'desktop') {
    await page.getByRole('button', { name: 'Open navigation' }).click()
  }
  await expect(logo).toBeVisible()
  if (testInfo.project.name !== 'desktop') {
    await page.getByRole('button', { name: 'Close menu' }).click()
  }
  await expect(van).toBeVisible()
  expect(
    await logo.evaluate(
      (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
    ),
  ).toBe(true)
  expect(
    await van.evaluate(
      (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
    ),
  ).toBe(true)
  await expect(logo).toHaveAttribute('src', '/brand/whitfield-logo.png')
  await expect(van).toHaveAttribute('src', '/brand/whitfield-van.jpg')
  const palette = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement)
    return {
      grey: root.getPropertyValue('--color-graphite').trim(),
      blue: root.getPropertyValue('--color-accent').trim(),
    }
  })
  expect(palette).toEqual({ grey: '#565c5d', blue: '#71b0ff' })
})
