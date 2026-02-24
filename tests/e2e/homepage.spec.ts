import { test, expect } from '@playwright/test'

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/')
  
  // Check title
  await expect(page).toHaveTitle(/Frame Flow X/)
  
  // Check main heading
  await expect(page.getByRole('heading', { name: /Frame Flow X/ })).toBeVisible()
  
  // Check feature cards
  await expect(page.getByText(/Frame Extraction/)).toBeVisible()
  await expect(page.getByText(/AI Upscaling/)).toBeVisible()
  await expect(page.getByText(/Cinematic Presets/)).toBeVisible()
})

test('theme toggle works', async ({ page }) => {
  await page.goto('/')
  
  // Find and click theme toggle
  const themeToggle = page.getByRole('button', { name: /Light|Dark/ })
  await expect(themeToggle).toBeVisible()
  
  const initialTheme = await themeToggle.textContent()
  await themeToggle.click()
  
  // Wait for theme to change
  await page.waitForTimeout(100)
  
  const newTheme = await themeToggle.textContent()
  expect(newTheme).not.toBe(initialTheme)
})

test('navigation to workspace works', async ({ page }) => {
  await page.goto('/')
  
  // Click Get Started button
  await page.getByRole('button', { name: /Get Started/ }).click()
  
  // Should navigate to workspace
  await expect(page).toHaveURL(/.*workspace/)
  await expect(page.getByRole('heading', { name: /Workspace/ })).toBeVisible()
})

test('navigation to settings works', async ({ page }) => {
  await page.goto('/')
  
  // Navigate to settings via header
  await page.getByRole('button', { name: /Settings/ }).click()
  
  // Should navigate to settings
  await expect(page).toHaveURL(/.*settings/)
  await expect(page.getByRole('heading', { name: /Settings/ })).toBeVisible()
})

test('404 page shows for invalid routes', async ({ page }) => {
  await page.goto('/invalid-route-12345')
  
  // Should show 404 page
  await expect(page.getByText(/404/)).toBeVisible()
  await expect(page.getByText(/Page Not Found/)).toBeVisible()
})

test('progress bars display correctly', async ({ page }) => {
  await page.goto('/')
  
  // Check progress bars on homepage
  const progressBars = page.getByRole('progressbar')
  await expect(progressBars).toHaveCount(2)
})
