import { faCheck, faSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon as FontAwesomeIconLatest } from '@fortawesome/react-fontawesome'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { FontAwesomeIcon as FontAwesomeIconLegacy } from 'react-fontawesome-0.2.6'

const ITEMS = ['List icons can', 'be used to', 'replace bullets']

type Probe = { svgClass: string; inGutter: boolean; nestedFaLi: boolean }

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
    nestedFaLi: svg.classList.contains('fa-li') && svg.parentElement?.closest('.fa-li') != null,
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
      <h3>{title}</h3>
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
          <span className={probe.inGutter && !probe.nestedFaLi ? 'pass' : 'fail'}>
            {probe.nestedFaLi
              ? '❌ nested fa-li shifts the icon too far left'
              : probe.inGutter
                ? '✅ icon hangs in the list gutter'
                : '❌ icon is inline with the text'}
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

      <h2>Version comparison</h2>
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

      <section aria-labelledby="wrapper-compatibility">
        <h2 id="wrapper-compatibility">Wrapper workaround: before and after PR #669</h2>
        <p>
          If you added a <code>fa-li</code> wrapper but kept <code>listItem</code>,{' '}
          <a href="https://github.com/FortAwesome/react-fontawesome/pull/669">PR #669</a> would
          add <code>fa-li</code> to the SVG too. Both elements then apply absolute positioning:
          there is still one icon, but it moves an extra <code>2em</code> left with the default
          styles. The text stays in place. Remove <code>listItem</code> when using the wrapper to
          keep the layout shown above.
        </p>
        <p>
          The after case simulates the patch by adding <code>className="fa-li"</code> to the
          v{__VERSIONS__.latest} icon. This produces the same SVG class that the PR restores;
          the displayed workaround code is identical in both cases.
        </p>
        <div className="cases">
          <Case
            title={`Before · v${__VERSIONS__.latest} · wrapper + listItem`}
            code={`<span className="fa-li">\n  <FontAwesomeIcon icon={faCheck} listItem />\n</span>`}
            renderIcon={(i) => (
              <span className="fa-li">
                <FontAwesomeIconLatest icon={icon(i)} listItem />
              </span>
            )}
          />
          <Case
            title="After · PR #669 simulated · wrapper + listItem"
            code={`<span className="fa-li">\n  <FontAwesomeIcon icon={faCheck} listItem />\n</span>`}
            renderIcon={(i) => (
              <span className="fa-li">
                <FontAwesomeIconLatest icon={icon(i)} listItem className="fa-li" />
              </span>
            )}
          />
        </div>
      </section>
    </main>
  )
}
