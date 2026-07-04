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
  await page.getByRole('combobox', { name: 'Command menu' }).fill('hotkeys')
  await expect(page.locator('[data-cmdk-item][data-value="keyboard"]')).toBeVisible()
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
  const homeItem = page.locator('[data-cmdk-item][data-value="home"]')
  const initialId = await combobox.getAttribute('aria-activedescendant')
  const initialSelectedItem = page.locator(`#${initialId}`)
  const homeId = await homeItem.getAttribute('id')

  await expect(initialSelectedItem).toHaveAttribute('aria-selected', 'true')
  await expect(combobox).toHaveAttribute('aria-activedescendant', initialId)
  await combobox.press('ArrowDown')
  await expect(initialSelectedItem).toHaveAttribute('aria-selected', 'false')
  await expect(homeItem).toHaveAttribute('aria-selected', 'true')
  await expect(combobox).toHaveAttribute('aria-activedescendant', homeId)
})

test('supports ArrowUp navigation back to the previous option', async ({ page }) => {
  await openPalette(page)
  const combobox = page.getByRole('combobox', { name: 'Command menu' })
  const searchItem = page.locator('[data-cmdk-item][data-value="search"]')
  const homeItem = page.locator('[data-cmdk-item][data-value="home"]')

  await combobox.press('ArrowDown')
  await expect(homeItem).toHaveAttribute('aria-selected', 'true')
  await combobox.press('ArrowUp')
  await expect(searchItem).toHaveAttribute('aria-selected', 'true')
  await expect(combobox).toHaveAttribute(
    'aria-activedescendant',
    await searchItem.getAttribute('id'),
  )
})

test('exposes a stable accessibility tree for the dialog', async ({ page }) => {
  await openPalette(page)
  await expect(page.locator('[data-cmdk-dialog-wrapper]')).toMatchAriaSnapshot(`
    - combobox "Command menu" [expanded]
    - text: 10 items
    - listbox:
      - group:
        - text: Actions
        - group:
          - option "Open settings ⌘,"
          - option "Toggle theme ⌘D"
          - option "Billing (coming soon)" [disabled]
          - option "Sign out"
      - group:
        - text: Navigation
        - group:
          - option "Search files ⌘S" [selected]
          - option "Go to home ⌘H"
          - option "Bookmarks ⌘B"
      - group:
        - text: System
        - group:
          - option "Notifications"
          - option "Change language"
          - option "Keyboard shortcuts"
  `)
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
