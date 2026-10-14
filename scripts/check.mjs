// Headless check: server-render <FontAwesomeIcon listItem /> with both versions
// and report whether the rendered <svg> carries the `fa-li` class.
// Exits 1 if the latest version does not, so it can double as a regression test.
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import * as latest from '@fortawesome/react-fontawesome'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as legacy from 'react-fontawesome-0.2.6'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const versionOf = (pkg) => require(`${pkg}/package.json`).version

const cases = [
  ['react-fontawesome-0.2.6', legacy.FontAwesomeIcon],
  ['@fortawesome/react-fontawesome', latest.FontAwesomeIcon],
]

let latestOk = false
for (const [pkg, FontAwesomeIcon] of cases) {
  const html = renderToStaticMarkup(createElement(FontAwesomeIcon, { icon: faCheck, listItem: true }))
  const svgClass = html.match(/<svg[^>]*\sclass="([^"]*)"/)?.[1] ?? ''
  const hasFaLi = svgClass.split(/\s+/).includes('fa-li')
  if (pkg === '@fortawesome/react-fontawesome') latestOk = hasFaLi

  console.log(`${hasFaLi ? '✅' : '❌'} react-fontawesome@${versionOf(pkg)}  listItem → class="${svgClass}"`)
}

process.exit(latestOk ? 0 : 1)
