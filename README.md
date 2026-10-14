# react-fontawesome #668 repro: `listItem` no longer applies `fa-li`

Reproduction for [FortAwesome/react-fontawesome#668](https://github.com/FortAwesome/react-fontawesome/issues/668).

**Live demo:** https://kaelig.github.io/react-fontawesome-repro-668/

![Side-by-side comparison of v0.2.6 and v3.5.0](docs/screenshot.png)

## What it shows

`<FontAwesomeIcon icon={faCheck} listItem />` inside a `<ul className="fa-ul">`, rendered with:

| Case | `react-fontawesome` | `<svg>` class | Icon position |
| --- | --- | --- | --- |
| `listItem` | 0.2.6 | `svg-inline--fa fa-check fa-li` | ✅ hangs in the list gutter |
| `listItem` | 3.5.0 (latest) | `svg-inline--fa fa-check` | ❌ inline, pushes the text right |
| `<span className="fa-li">` wrapper, no `listItem` | 3.5.0 (latest) | `svg-inline--fa fa-check` | ✅ hangs in the list gutter |
| `<span className="fa-li">` wrapper + `listItem`, before the patch | 3.5.0 (latest) | `svg-inline--fa fa-check` | ✅ wrapper hangs the icon in the list gutter |
| Same wrapper + `listItem`, simulating PR #669 | 3.5.0 + explicit SVG `fa-li` class | `svg-inline--fa fa-check fa-li` | ❌ nested positioning moves the icon an extra 2em left |

All cases share the same `@fortawesome/fontawesome-svg-core@7.3.1` and `react@19`. v0.2.6 is installed alongside v3.5.0 through an npm alias (`react-fontawesome-0.2.6`), so only the React wrapper differs in the version comparison.

The workaround comparison shows what [PR #669](https://github.com/FortAwesome/react-fontawesome/pull/669) could cause for users who kept `listItem` after adding a `fa-li` wrapper. The after case uses `className="fa-li"` on the v3.5.0 icon to simulate the class restored by the patch. Both elements apply positioning, shifting the single icon a further 2em left while the text stays put. Removing `listItem` from the wrapped icon avoids the extra offset.

## Findings

- In 3.x, `listItem` is still accepted and still stripped from the DOM props, but it no longer maps to a class. `getClassListFromProps` doesn't read it.
- Its typings mark it `@deprecated` ("Simply wrap the icon instead, no need to pass this property"), but nothing warns at runtime and the 3.0.0 changelog doesn't mention it.
- Every 3.x release (3.0.0 through 3.5.0) behaves the same way. 0.2.6 maps `listItem` to `'fa-li'`.

## Run it

```sh
npm install
npm run dev     # side-by-side visual comparison with live DOM probes
npm run check   # headless: server-renders both versions, exits 1 if latest lacks fa-li
```

`npm run check` output with 3.5.0:

```
✅ react-fontawesome@0.2.6  listItem → class="svg-inline--fa fa-check fa-li "
❌ react-fontawesome@3.5.0  listItem → class="svg-inline--fa fa-check"
```

To test a fix, point `@fortawesome/react-fontawesome` at the patched build, then run `npm run check`.
