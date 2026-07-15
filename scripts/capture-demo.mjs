import { chromium } from '@playwright/test'
import { execSync, spawn } from 'child_process'
import { existsSync, mkdirSync, statSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT = resolve(ROOT, 'assets/demo-capture')
const GIF = resolve(ROOT, 'assets/demo.gif')

async function main() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

  const server = spawn('pnpm', ['dev'], { cwd: ROOT, stdio: 'pipe', shell: true })

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server start timeout')), 15000)
    const handler = (data) => {
      if (data.toString().includes('Local:')) {
        clearTimeout(timeout)
        resolve()
      }
    }
    server.stdout.on('data', handler)
    server.stderr.on('data', handler)
  })

  let idx = 0
  async function shot(name) {
    const file = resolve(OUT, `frame-${String(idx++).toString().padStart(3, '0')}.png`)
    await page.screenshot({ path: file })
    console.log(`  📸 ${name}`)
  }

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    // 1. Initial page (light mode)
    await shot('01-initial')

    // 2. Switch to Midnight theme
    await page.getByRole('button', { name: /Midnight/ }).click()
    await page.waitForTimeout(600)
    await shot('02-midnight-theme')

    // 3. Open palette via button
    await page.getByRole('button', { name: 'Open command palette' }).click()
    await page.waitForTimeout(600)
    await shot('03-palette-opened')

    // 4. Navigate using arrow keys to Settings
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(300)
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(300)
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(400)
    await shot('04-navigated-to-settings')

    // 5. Select Settings → enter sub-page
    await page.keyboard.press('Enter')
    await page.waitForTimeout(700)
    await shot('05-sub-page-settings')

    // 6. Browse sub-page
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(400)
    await shot('06-settings-browsing')

    // 7. Click back button
    const backBtn = page.locator('[data-cmdk-back]')
    if (await backBtn.isVisible()) {
      await backBtn.click()
      await page.waitForTimeout(600)
    }
    await shot('07-back-to-root')

    // 8. Search
    await page.locator('[data-cmdk-input]').waitFor({ state: 'visible', timeout: 2000 })
    await page.locator('[data-cmdk-input]').fill('theme')
    await page.waitForTimeout(600)
    await shot('08-searching')

    // 9. Clear search
    await page.locator('[data-cmdk-input]').fill('')
    await page.waitForTimeout(400)
    await shot('09-cleared')

    // 10. Select first item
    await page.keyboard.press('Enter')
    await page.waitForTimeout(600)
    await shot('10-item-selected')

    // 11. Reopen and show disabled item
    await page.getByRole('button', { name: 'Open command palette' }).click()
    await page.waitForTimeout(400)
    await page.locator('[data-cmdk-input]').fill('billing')
    await page.waitForTimeout(600)
    await shot('11-disabled-item')

    // 12. Close
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)
    await shot('12-closed')

    console.log(`\n🎬 Generating GIF from ${idx} frames...`)

    const inputGlob = `${OUT}/frame-*.png`
    const cmd = `ffmpeg -y -framerate 1 -pattern_type glob -i '${inputGlob}' -vf "fps=3,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" -loop 0 "${GIF}"`

    execSync(cmd, { stdio: 'inherit' })
    const size = statSync(GIF).size
    console.log(`\n✅ GIF saved (${(size / 1024).toFixed(0)} KB)`)
  } finally {
    await browser.close()
    server.kill()
  }
}

main().catch(console.error)
