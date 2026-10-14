import { faCheck, faSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon as FontAwesomeIconLatest } from '@fortawesome/react-fontawesome'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { FontAwesomeIcon as FontAwesomeIconLegacy } from 'react-fontawesome-0.2.6'

const ITEMS = ['List icons can', 'be used to', 'replace bullets']

type Probe = { svgClass: string; inGutter: boolean }

// Reads the first rendered icon back out of the DOM: which classes it got, and
// whether it ended up inside an absolutely positioned `.fa-li` (i.e. hanging in
// the list gutter, as https://docs.fontawesome.com/web/style/lists describes).
function probeList(list: HTMLUListElement): Probe | null {
  const svg = list.querySelector('svg')
  if (!svg) return null
  const faLi = svg.closest('.fa-li')
  return {
    svgClass: svg.getAttribute('class') ?? '',
    inGutter: faLi !== null && getComputedStyle(faLi).position === 'absolute',
  }
}

function Case({
  title,
  code,
  renderIcon,
}: {
  title: string
  code: string
  renderIcon: (index: number) => ReactNode
}) {
  const listRef = useRef<HTMLUListElement>(null)
  const [probe, setProbe] = useState<Probe | null>(null)

  useEffect(() => {
    if (listRef.current) setProbe(probeList(listRef.current))
  }, [])

  return (
    <section className="case" data-testid={title}>
      <h2>{title}</h2>
      <pre>
        <code>{code}</code>
      </pre>
      <ul className="fa-ul" ref={listRef}>
        {ITEMS.map((text, i) => (
          <li key={text}>
            {renderIcon(i)}
            {text}
          </li>
        ))}
      </ul>
      {probe && (
        <p className="probe">
          <span className={probe.inGutter ? 'pass' : 'fail'}>
            {probe.inGutter ? '✅ icon hangs in the list gutter' : '❌ icon is inline with the text'}
          </span>
          <br />
          svg class: <code>{probe.svgClass}</code>
        </p>
      )}
    </section>
  )
}

const icon = (i: number) => (i === 2 ? faSquare : faCheck)

export default function App() {
  return (
    <main>
      <h1>
        <code>listItem</code> on <code>FontAwesomeIcon</code>
      </h1>
      <p>
        Repro for{' '}
        <a href="https://github.com/FortAwesome/react-fontawesome/issues/668">
          FortAwesome/react-fontawesome#668
        </a>
        . Same <code>@fortawesome/fontawesome-svg-core@{__VERSIONS__.core}</code> and{' '}
        <code>react@{__VERSIONS__.react}</code> for every case; only the{' '}
        <code>@fortawesome/react-fontawesome</code> version changes. The dashed red line marks the
        list's content edge: with working <code>fa-li</code> styling, icons sit to its left and text
        starts on it.
      </p>

      <div className="cases">
        <Case
          title={`v${__VERSIONS__.legacy} · listItem`}
          code={`<FontAwesomeIcon icon={faCheck} listItem />`}
          renderIcon={(i) => <FontAwesomeIconLegacy icon={icon(i)} listItem />}
        />
        <Case
          title={`v${__VERSIONS__.latest} · listItem`}
          code={`<FontAwesomeIcon icon={faCheck} listItem />`}
          renderIcon={(i) => <FontAwesomeIconLatest icon={icon(i)} listItem />}
        />
        <Case
          title={`v${__VERSIONS__.latest} · fa-li span`}
          code={`<span className="fa-li">\n  <FontAwesomeIcon icon={faCheck} />\n</span>`}
          renderIcon={(i) => (
            <span className="fa-li">
              <FontAwesomeIconLatest icon={icon(i)} />
            </span>
          )}
        />
      </div>
    </main>
  )
}
