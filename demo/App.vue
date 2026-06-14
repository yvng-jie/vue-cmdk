<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Command } from '../src/index'
import type { CommandItemData } from '../src/types'
import hljs from 'highlight.js'

/* ── Theme management (4 themes) ── */
const THEMES = [
  { id: 'dark', label: 'Dark', icon: '🌙' },
  { id: 'light', label: 'Light', icon: '☀️' },
  { id: 'midnight', label: 'Midnight', icon: '🌃' },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: '🌐' },
]
const currentTheme = ref('dark')

const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
if (mediaQuery.matches) currentTheme.value = 'light'

mediaQuery.addEventListener('change', (e) => {
  if (!manualTheme.value) currentTheme.value = e.matches ? 'light' : 'dark'
})
const manualTheme = ref(false)

watch(
  currentTheme,
  (v) => {
    document.documentElement.dataset.theme = v
    manualTheme.value = true
    nextTick(() => hljs.highlightAll())
  },
  { immediate: true },
)

function setTheme(id: string) {
  currentTheme.value = id
}

/* ── Command palette state ── */
const visible = ref(false)

const demoItems: CommandItemData[] = [
  {
    value: 'search',
    label: 'Search files',
    shortcut: '⌘S',
    group: 'Navigation',
    keywords: ['find', 'lookup'],
  },
  {
    value: 'home',
    label: 'Go to home',
    shortcut: '⌘H',
    group: 'Navigation',
    keywords: ['dashboard'],
  },
  {
    value: 'bookmarks',
    label: 'Bookmarks',
    shortcut: '⌘B',
    group: 'Navigation',
    keywords: ['favorites'],
  },
  { value: 'settings', label: 'Open settings', shortcut: '⌘,', group: 'Actions' },
  {
    value: 'theme',
    label: 'Toggle theme',
    shortcut: '⌘D',
    group: 'Actions',
    keywords: ['dark', 'light'],
  },
  { value: 'notifications', label: 'Notifications', group: 'System' },
  { value: 'language', label: 'Change language', group: 'System' },
  { value: 'keyboard', label: 'Keyboard shortcuts', group: 'System', keywords: ['hotkeys'] },
  { value: 'logout', label: 'Sign out', group: 'Actions' },
]

function onSelect(item: CommandItemData) {
  if (item.value === 'theme') {
    const idx = THEMES.findIndex((t) => t.id === currentTheme.value)
    setTheme(THEMES[(idx + 1) % THEMES.length].id)
  }
  console.log('Selected:', item.value)
}

/* ── Global ⌘K shortcut ── */
function onGlobalKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault()
    visible.value = !visible.value
  }
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown)
  hljs.highlightAll()
})
onUnmounted(() => window.removeEventListener('keydown', onGlobalKeydown))

/* ── Smooth scroll for anchor links ── */
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

/* ── Feature flags for vs-cmdk table ── */
const cmdkFeatures = [
  { feat: 'Command root value / onValueChange', react: true, vue: true, status: 'done' },
  { feat: 'Command root shouldFilter', react: true, vue: true, status: 'done' },
  { feat: 'Command root loop', react: true, vue: true, status: 'done' },
  { feat: 'Command root label (aria-label)', react: true, vue: true, status: 'done' },
  { feat: 'Command.Dialog open / onOpenChange', react: true, vue: true, status: 'done' },
  { feat: 'Command.Dialog container (portal)', react: true, vue: false, status: 'future' },
  { feat: 'Command.Input value / onValueChange', react: true, vue: true, status: 'done' },
  { feat: 'Command.Item forceMount', react: true, vue: false, status: 'planned' },
  { feat: 'Command.Item keywords', react: true, vue: true, status: 'done' },
  { feat: 'Command.Item onSelect', react: true, vue: true, status: 'done' },
  { feat: 'Command.Item auto value from textContent', react: true, vue: false, status: 'planned' },
  { feat: 'Command.Group forceMount', react: true, vue: false, status: 'planned' },
  { feat: 'Command.Separator alwaysRender', react: true, vue: false, status: 'future' },
  { feat: 'useCommandState() selector', react: true, vue: false, status: 'planned' },
  { feat: 'Nested items / Pages', react: true, vue: false, status: 'planned' },
  { feat: 'Built-in search / filtering', react: true, vue: true, status: 'done' },
  { feat: 'Custom filter function', react: true, vue: true, status: 'done' },
  { feat: 'Global shortcut listener', react: false, vue: true, status: 'bonus' },
  { feat: 'Keyboard navigation', react: true, vue: true, status: 'done' },
  { feat: 'Focus trap', react: true, vue: true, status: 'done' },
  { feat: 'Zero dependencies', react: false, vue: true, status: 'bonus' },
  { feat: 'TypeScript', react: true, vue: true, status: 'done' },
]

const statusLabels: Record<string, string> = {
  done: '✅',
  planned: '📋',
  future: '💡',
  bonus: '⭐',
}
</script>

<template>
  <div class="landing">
    <!-- ═══════════════ Navbar ═══════════════ -->
    <nav class="navbar">
      <div class="navbar-brand" @click="scrollTo('hero')">
        <span class="navbar-logo">⌘K</span>
        <span class="navbar-title">vue-cmdk</span>
      </div>
      <div class="navbar-links">
        <a href="#features" @click.prevent="scrollTo('features')"> Features </a>
        <a href="#demo" @click.prevent="scrollTo('demo')"> Demo </a>
        <a href="#quickstart" @click.prevent="scrollTo('quickstart')"> Quick Start </a>
        <a href="#comparison" @click.prevent="scrollTo('comparison')"> vs cmdk </a>
        <a href="#api" @click.prevent="scrollTo('api')"> API </a>
        <a
          href="https://github.com/yvng-jie/vue-cmdk"
          target="_blank"
          class="nav-gh-link"
          title="GitHub"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path
              d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
            />
          </svg>
        </a>
      </div>
    </nav>

    <!-- ═══════════════ Hero ═══════════════ -->
    <section id="hero" class="hero">
      <div class="hero-bg-gradient" />
      <div class="hero-orbs">
        <div class="hero-orb" />
        <div class="hero-orb" />
        <div class="hero-orb" />
      </div>
      <div class="hero-content">
        <div class="hero-badge">
          <span class="hero-badge-version">v0.1.0</span>
          <span class="hero-badge-dot">·</span>
          <span class="hero-badge-deps">Zero dependencies</span>
          <span class="hero-badge-dot">·</span>
          <span class="hero-badge-size">3.4 kB gzip</span>
        </div>
        <h1 class="hero-title">
          <span class="hero-cmd">⌘K</span>
          <span class="hero-name">vue-cmdk</span>
        </h1>
        <p class="hero-subtitle">
          A fast, composable, unstyled command palette for
          <strong>Vue 3</strong>
          .
          <br class="hero-break" />
          Press
          <kbd class="hero-kbd">⌘K</kbd>
          and take control.
        </p>
        <div class="hero-actions">
          <button class="btn btn-primary" @click="visible = true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Try live demo
            <kbd class="btn-kbd">⌘K</kbd>
          </button>
          <a href="https://github.com/yvng-jie/vue-cmdk" target="_blank" class="btn btn-outline">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path
                d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
              />
            </svg>
            View on GitHub
          </a>
        </div>
        <div class="hero-shortcuts">
          <span>
            <kbd>⌘K</kbd>
            Open
          </span>
          <span>
            <kbd>↓</kbd>
            <kbd>↑</kbd>
            Navigate
          </span>
          <span>
            <kbd>↵</kbd>
            Select
          </span>
          <span>
            <kbd>Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </section>

    <!-- ═══════════════ Live Demo ═══════════════ -->
    <section id="demo" class="section">
      <div class="section-header">
        <h2 class="section-title">Live Demo</h2>
        <p class="section-desc">
          Try it yourself. Press
          <kbd>⌘K</kbd>
          or click the button below.
        </p>
      </div>

      <div class="theme-picker">
        <span class="theme-picker-label">Theme:</span>
        <button
          v-for="t in THEMES"
          :key="t.id"
          class="theme-btn"
          :class="{ active: currentTheme === t.id }"
          @click="setTheme(t.id)"
        >
          <span class="theme-btn-icon">{{ t.icon }}</span>
          <span class="theme-btn-label">{{ t.label }}</span>
        </button>
      </div>

      <div class="demo-box">
        <div class="demo-box-preview">
          <button class="btn btn-primary" @click="visible = true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Open command palette
          </button>
        </div>
        <div class="demo-box-info">
          <p>Type to filter items, use arrow keys to navigate, press Enter to select.</p>
          <p class="demo-box-tip">
            Try searching for
            <strong>"theme"</strong>
            or typing
            <strong>"⌘D"</strong>
            !
          </p>
        </div>
      </div>
    </section>

    <!-- ═══════════════ Features ═══════════════ -->
    <section id="features" class="section">
      <div class="section-header">
        <h2 class="section-title">Why vue-cmdk?</h2>
        <p class="section-desc">Everything you need, nothing you don't.</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🧩</div>
          <h3>Compound API</h3>
          <p>
            <code>Command.Dialog</code>
            ,
            <code>Command.Input</code>
            ,
            <code>Command.Item</code>
            — composable and intuitive.
          </p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💄</div>
          <h3>Unstyled</h3>
          <p>
            Bring your own CSS. Zero opinions, full design control. Works with any design system.
          </p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔍</div>
          <h3>Built-in Search</h3>
          <p>
            Fast case-insensitive filtering with keyword matching. No extra dependencies needed.
          </p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">⌨️</div>
          <h3>Keyboard-first</h3>
          <p>Arrow keys, Enter, Escape — all built-in. Plus global shortcut listener for items.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📦</div>
          <h3>Tiny Bundle</h3>
          <p>3.4 kB gzipped. Zero runtime dependencies. Peer dependency only on Vue 3.4+.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎯</div>
          <h3>TypeScript</h3>
          <p>Full type inference and declaration files. Complete IDE support out of the box.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔄</div>
          <h3>Dynamic Items</h3>
          <p>Pass items as a reactive array, swap anytime. Perfect for async data fetching.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">♿</div>
          <h3>Accessible</h3>
          <p>
            ARIA attributes, focus trap,
            <code>aria-live</code>
            region. Keyboard navigable by default.
          </p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🛠</div>
          <h3>Custom Filter</h3>
          <p>Provide your own filter function for complete control over search behavior.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔒</div>
          <h3>Focus Trap</h3>
          <p>Tab cycling stays within the dialog. Escape closes. No focus leaks.</p>
        </div>
      </div>
    </section>

    <!-- ═══════════════ Quick Start ═══════════════ -->
    <section id="quickstart" class="section">
      <div class="section-header">
        <h2 class="section-title">Quick Start</h2>
        <p class="section-desc">Get started in under a minute.</p>
      </div>

      <div class="code-section">
        <h3 class="code-section-title">Install</h3>
        <pre
          class="code-block"
          data-language="bash"
        ><code class="language-bash">npm install vue-cmdk</code></pre>
      </div>

      <div class="code-section">
        <h3 class="code-section-title">Simple usage — items prop</h3>
        <pre
          class="code-block"
          data-language="vue"
        ><code class="language-html">&lt;script setup lang="ts"&gt;
import { ref } from 'vue'
import { Command } from 'vue-cmdk'
import type { CommandItemData } from 'vue-cmdk'

const visible = ref(false)

const items: CommandItemData[] = [
  { value: 'settings', label: 'Open settings', shortcut: '⌘,' },
  { value: 'home', label: 'Go to home', shortcut: '⌘H' },
]

function onSelect(item: CommandItemData) {
  console.log('selected:', item.value)
}
&lt;/script&gt;

&lt;template&gt;
  &lt;button @click="visible = true"&gt;Open (⌘K)&lt;/button&gt;

  &lt;Command.Dialog
    :visible="visible"
    :items="items"
    @update:visible="visible = $event"
    @select="onSelect"
  /&gt;
&lt;/template&gt;</code></pre>
      </div>

      <div class="code-section">
        <h3 class="code-section-title">Advanced — slots</h3>
        <pre
          class="code-block"
          data-language="vue"
        ><code class="language-html">&lt;Command.Dialog :visible="visible" @update:visible="visible = $event"&gt;
  &lt;template #header&gt;
    &lt;Command.Input placeholder="Search..." /&gt;
  &lt;/template&gt;
  &lt;template #body&gt;
    &lt;Command.List&gt;
      &lt;Command.Group heading="Favorites"&gt;
        &lt;Command.Item value="home" label="Home" /&gt;
      &lt;/Command.Group&gt;
    &lt;/Command.List&gt;
  &lt;/template&gt;
&lt;/Command.Dialog&gt;</code></pre>
      </div>
    </section>

    <!-- ═══════════════ vs cmdk ═══════════════ -->
    <section id="comparison" class="section">
      <div class="section-header">
        <h2 class="section-title">vs React cmdk</h2>
        <p class="section-desc">
          Feature parity with the original
          <a href="https://github.com/pacocoursey/cmdk" target="_blank"> cmdk </a>
          (React). Check the roadmap below.
        </p>
      </div>

      <div class="comparison-table-wrap">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th class="col-react">React cmdk</th>
              <th class="col-vue">vue-cmdk</th>
              <th class="col-status">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in cmdkFeatures" :key="f.feat">
              <td class="td-feat">{{ f.feat }}</td>
              <td class="td-react">{{ f.react ? '✅' : '❌' }}</td>
              <td class="td-vue">{{ f.vue ? '✅' : '❌' }}</td>
              <td class="td-status">
                <span :class="['status-badge', f.status]"
                  >{{ statusLabels[f.status] }} {{ f.status }}</span
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ═══════════════ API ═══════════════ -->
    <section id="api" class="section">
      <div class="section-header">
        <h2 class="section-title">API Reference</h2>
        <p class="section-desc">All components at a glance.</p>
      </div>

      <div class="api-table-wrap">
        <h3 class="api-section-title">Components</h3>
        <table class="api-table">
          <thead>
            <tr>
              <th>Component</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>Command.Dialog</code></td>
              <td>Modal dialog with mask, transition, focus trap</td>
            </tr>
            <tr>
              <td><code>Command.Menu</code></td>
              <td>Inline command menu (non-modal)</td>
            </tr>
            <tr>
              <td><code>Command.Input</code></td>
              <td>Search input with keyboard navigation</td>
            </tr>
            <tr>
              <td><code>Command.List</code></td>
              <td>Scrollable list rendering grouped items</td>
            </tr>
            <tr>
              <td><code>Command.Group</code></td>
              <td>Group of items with heading</td>
            </tr>
            <tr>
              <td><code>Command.Item</code></td>
              <td>Single selectable command item</td>
            </tr>
            <tr>
              <td><code>Command.Empty</code></td>
              <td>Shown when no results match</td>
            </tr>
            <tr>
              <td><code>Command.Separator</code></td>
              <td>Visual separator</td>
            </tr>
            <tr>
              <td><code>Command.Loading</code></td>
              <td>Loading indicator</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="api-table-wrap">
        <h3 class="api-section-title">Command.Dialog Props</h3>
        <table class="api-table">
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>visible</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>Controlled open state</td>
            </tr>
            <tr>
              <td><code>items</code></td>
              <td><code>CommandItemData[]</code></td>
              <td><code>[]</code></td>
              <td>Items to display</td>
            </tr>
            <tr>
              <td><code>placeholder</code></td>
              <td><code>string</code></td>
              <td><code>'Type a command...'</code></td>
              <td>Input placeholder</td>
            </tr>
            <tr>
              <td><code>filter</code></td>
              <td><code>FilterFn</code></td>
              <td>—</td>
              <td>Custom filter function</td>
            </tr>
            <tr>
              <td><code>loading</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>Show loading state</td>
            </tr>
            <tr>
              <td><code>autoFocus</code></td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
              <td>Auto-focus input on open</td>
            </tr>
            <tr>
              <td><code>closeOnSelect</code></td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
              <td>Close dialog after selection</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ═══════════════ Footer ═══════════════ -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <span class="footer-logo">⌘K</span>
          <span>vue-cmdk</span>
        </div>
        <p class="footer-text">
          Made with ❤️ for the Vue community. Inspired by
          <a href="https://github.com/pacocoursey/cmdk" target="_blank"> cmdk </a>
          by
          <a href="https://twitter.com/pacocoursey" target="_blank"> @pacocoursey </a>
          .
        </p>
        <div class="footer-links">
          <a href="https://github.com/yvng-jie/vue-cmdk" target="_blank"> GitHub </a>
          <span class="footer-dot">·</span>
          <a href="https://github.com/yvng-jie/vue-cmdk/issues" target="_blank"> Issues </a>
          <span class="footer-dot">·</span>
          <a href="https://www.npmjs.com/package/vue-cmdk" target="_blank"> npm </a>
          <span class="footer-dot">·</span>
          <span>MIT License</span>
        </div>
      </div>
    </footer>

    <!-- ═══════════════ Command Dialog ═══════════════ -->
    <Command.Dialog
      :visible="visible"
      :items="demoItems"
      placeholder="Type a command or search..."
      @update:visible="visible = $event"
      @select="onSelect"
    />
  </div>
</template>
