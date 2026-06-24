# Contributing to vue-cmdk

Thanks for your interest in contributing.

## Prerequisites

- **Node.js** >= 22.13
- **pnpm** >= 11.x

## Setup

```bash
git clone https://github.com/yvng-jie/vue-cmdk.git
cd vue-cmdk
pnpm install
pnpm dev
```

## Scripts

| Command           | Description                               |
| ----------------- | ----------------------------------------- |
| `pnpm dev`        | Start demo dev server at `localhost:5173` |
| `pnpm build`      | Build the library + type declarations     |
| `pnpm typecheck`  | Run TypeScript type checking              |
| `pnpm test`       | Run unit tests (Vitest)                   |
| `pnpm test:watch` | Run tests in watch mode                   |
| `pnpm lint`       | ESLint + Prettier check                   |
| `pnpm lint:fix`   | Auto-fix lint and formatting issues       |
| `pnpm format`     | Format code with Prettier                 |
| `pnpm preview`    | Preview production build                  |
| `pnpm build:demo` | Build demo site to `dist-demo/`           |

## Project Structure

```
src/
├── __tests__/            # 9 test suites (117 tests)
├── useCommandMenu.ts     # Core composable (state, filter, shortcuts)
├── useCommandRoot.ts     # Shared composable (provide/inject wiring)
├── types.ts              # TypeScript type definitions
├── injectionKeys.ts      # provide/inject keys
├── utils/
│   ├── injectStrict.ts   # Type-safe inject helper
│   ├── shortcut.ts       # Shortcut parsing utilities
│   └── highlight.ts      # Search highlight utility
├── CommandMenu.vue       # Inline command menu
├── CommandDialog.vue     # Modal dialog command palette
├── CommandInput.vue      # Search input
├── CommandList.vue       # Scrollable filtered list
├── CommandGroup.vue      # Group with heading
├── CommandItem.vue       # Single selectable item
├── CommandEmpty.vue      # Empty state
├── CommandSeparator.vue  # Visual separator
├── CommandLoading.vue    # Loading indicator
├── index.ts              # Barrel exports
└── env.d.ts              # Type shims
demo/
├── App.vue               # Demo application
├── main.ts               # Demo entry
└── style.css             # Demo styles
```

## Pull Request Process

1. Fork the repo and create a feature branch from `main`.
2. Make your changes and run `pnpm typecheck && pnpm test && pnpm build`.
3. Test your changes with `pnpm dev` (demo app).
4. Update `CHANGELOG.md` with a description of your changes.
5. Submit a PR with a clear description of what and why.

## Questions?

Open a [GitHub Discussion](https://github.com/yvng-jie/vue-cmdk/discussions) or [Issue](https://github.com/yvng-jie/vue-cmdk/issues).
