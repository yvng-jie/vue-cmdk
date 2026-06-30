# E2E accessibility notes

This test suite is intentionally driven by issue `#6` and by primary guidance
for accessible combobox/listbox widgets instead of only checking that the demo
"looks fine" in a browser.

## Source anchors

- `yvng-jie/vue-cmdk#6`
- WAI-ARIA Authoring Practices: Combobox Pattern
  https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
- Playwright accessibility testing
  https://playwright.dev/docs/accessibility-testing
- Playwright best practices
  https://playwright.dev/docs/best-practices

## Contracts covered here

1. The input behaves like an editable combobox.
   It exposes a stable accessible name, popup relationship, expanded state, and
   active option linkage via `aria-controls` and `aria-activedescendant`.
2. The result popup behaves like a listbox.
   Options expose `aria-selected`, disabled items expose `aria-disabled`, and
   loading state is announced without breaking the listbox child-role structure.
3. Keyboard-first flows remain first-class behavior.
   Open, close, filtering, navigation, selection, and focus trapping are tested
   through real browser input instead of internal function calls.
4. Automated accessibility scanning is a verifier, not the designer.
   The suite blocks critical accessibility violations in the dialog flow and
   keeps structural assertions explicit in the test code.

## Verification

```bash
pnpm test:e2e
```
