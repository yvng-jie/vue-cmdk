import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

async function openPalette(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Open command palette' }).click()
  await expect(page.locator('[data-cmdk-dialog]')).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Command menu' })).toBeFocused()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('opens the command palette from the demo button', async ({ page }) => {
  await openPalette(page)
  const combobox = page.getByRole('combobox', { name: 'Command menu' })
  const listbox = page.getByRole('listbox')
  await expect(combobox).toHaveAttribute('aria-expanded', 'true')
  await expect(combobox).toHaveAttribute('aria-controls', await listbox.getAttribute('id'))
})

test('opens the command palette with the global keyboard shortcut', async ({ page }) => {
  await page.keyboard.press('Control+k')
  await expect(page.locator('[data-cmdk-dialog]')).toBeVisible()
})

test('closes the command palette with Escape', async ({ page }) => {
  await openPalette(page)
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-cmdk-dialog]')).toBeHidden()
})

test('closes the command palette when the overlay is clicked', async ({ page }) => {
  await openPalette(page)
  await page.locator('[data-cmdk-dialog-mask]').click({ position: { x: 10, y: 10 } })
  await expect(page.locator('[data-cmdk-dialog]')).toBeHidden()
})

test('filters items by label text', async ({ page }) => {
  await openPalette(page)
  await page.getByRole('combobox', { name: 'Command menu' }).fill('search')
  await expect(page.locator('[data-cmdk-item][data-value="search"]')).toBeVisible()
  await expect(page.locator('[data-cmdk-item][data-value="home"]')).toBeHidden()
})

test('filters items by keywords', async ({ page }) => {
  await openPalette(page)
  await page.getByRole('combobox', { name: 'Command menu' }).fill('settings')
  await expect(page.locator('[data-cmdk-item][data-value="settings"]')).toBeVisible()
  await expect(page.locator('[data-cmdk-item]').filter({ hasText: 'Search files' })).toBeHidden()
})

test('shows the empty state when no items match', async ({ page }) => {
  await openPalette(page)
  await page.getByRole('combobox', { name: 'Command menu' }).fill('zzzz')
  await expect(page.locator('[data-cmdk-empty]')).toBeVisible()
  await expect(page.locator('[data-cmdk-list-announcement]')).toContainText('No results found')
  await expect(page.locator('[data-cmdk-item]')).toHaveCount(0)
})

test('updates aria-activedescendant and aria-selected during keyboard navigation', async ({
  page,
}) => {
  await openPalette(page)
  const combobox = page.getByRole('combobox', { name: 'Command menu' })
  const initialId = await combobox.getAttribute('aria-activedescendant')
  const initialSelectedItem = page.locator(`#${initialId}`)

  await expect(initialSelectedItem).toHaveAttribute('aria-selected', 'true')
  await expect(combobox).toHaveAttribute('aria-activedescendant', initialId)

  // Navigate forward and verify the active item changes
  await combobox.press('ArrowDown')
  const nextId = await combobox.getAttribute('aria-activedescendant')
  const nextItem = page.locator(`#${nextId}`)
  await expect(nextItem).toHaveAttribute('aria-selected', 'true')
  await expect(combobox).toHaveAttribute('aria-activedescendant', nextId)
  expect(nextId).not.toBe(initialId)

  // Navigate back and restore the initial selection
  await combobox.press('ArrowUp')
  await expect(initialSelectedItem).toHaveAttribute('aria-selected', 'true')
  await expect(combobox).toHaveAttribute('aria-activedescendant', initialId)
})

test('supports ArrowUp navigation back to the previous option', async ({ page }) => {
  await openPalette(page)
  const combobox = page.getByRole('combobox', { name: 'Command menu' })
  const initialId = await combobox.getAttribute('aria-activedescendant')
  const initialSelectedItem = page.locator(`#${initialId}`)

  // Navigate forward then back, verify we return to the initial item
  await combobox.press('ArrowDown')
  const afterDownId = await combobox.getAttribute('aria-activedescendant')
  expect(afterDownId).not.toBe(initialId)

  await combobox.press('ArrowUp')
  await expect(initialSelectedItem).toHaveAttribute('aria-selected', 'true')
  await expect(combobox).toHaveAttribute('aria-activedescendant', initialId)
})

test('the dialog has a correct accessibility structure', async ({ page }) => {
  await openPalette(page)
  const dialog = page.locator('[data-cmdk-dialog-wrapper]')

  // Combobox
  await expect(dialog.getByRole('combobox', { name: 'Command menu' })).toHaveAttribute(
    'aria-expanded',
    'true',
  )

  // Announcement region
  await expect(dialog.locator('[aria-live="polite"]')).toHaveText('5 items')

  // Listbox
  const listbox = dialog.getByRole('listbox')
  await expect(listbox).toHaveAttribute('aria-busy', 'false')

  // Groups
  await expect(dialog.locator('[data-cmdk-group]')).toHaveCount(1)

  // Options
  await expect(listbox.getByRole('option')).toHaveCount(5)

  // Disabled item
  await expect(listbox.locator('[data-cmdk-item][data-value="billing"]')).toHaveAttribute(
    'aria-disabled',
    'true',
  )

  // Exactly one item is selected at any time
  await expect(listbox.locator('[aria-selected="true"]')).toHaveCount(1)
})

test('supports enter selection for the active item', async ({ page }) => {
  await openPalette(page)
  const combobox = page.getByRole('combobox', { name: 'Command menu' })
  await combobox.press('ArrowDown')
  await combobox.press('Enter')
  await expect(page.locator('[data-cmdk-dialog]')).toBeHidden()
})

test('changes the theme from the theme picker buttons', async ({ page }) => {
  await page.getByRole('button', { name: /Midnight/ }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'midnight')
  await expect(page.locator('.theme-btn.active')).toContainText('Midnight')
})

test('changes the theme when the toggle theme command is selected', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await openPalette(page)
  const combobox = page.getByRole('combobox', { name: 'Command menu' })
  await combobox.fill('theme')
  await combobox.press('Enter')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('keeps focus trapped inside the dialog when tabbing', async ({ page }) => {
  await openPalette(page)
  const combobox = page.getByRole('combobox', { name: 'Command menu' })
  await combobox.press('Tab')
  await expect(combobox).toBeFocused()
})

test('announces loading state to assistive technology', async ({ page }) => {
  await page.getByRole('button', { name: 'Enable loading state' }).click()
  await openPalette(page)
  await expect(page.locator('[data-cmdk-loading]')).toBeVisible()
  await expect(page.getByRole('listbox')).toHaveAttribute('aria-busy', 'true')
  await expect(page.locator('[data-cmdk-list-announcement]')).toContainText('Loading')
})

test('does not select disabled items', async ({ page }) => {
  await openPalette(page)
  const combobox = page.getByRole('combobox', { name: 'Command menu' })
  await combobox.fill('billing')
  const disabledItem = page.locator('[data-cmdk-item][data-value="billing"]')
  await expect(disabledItem).toHaveAttribute('aria-disabled', 'true')
  await combobox.press('Enter')
  await expect(page.locator('[data-cmdk-dialog]')).toBeVisible()
})

test('has no critical accessibility violations in the dialog flow', async ({ page }) => {
  await openPalette(page)
  const accessibilityScanResults = await new AxeBuilder({ page })
    .include('[data-cmdk-dialog-wrapper]')
    .analyze()
  expect(
    accessibilityScanResults.violations.filter((violation) => violation.impact === 'critical'),
  ).toEqual([])
})
