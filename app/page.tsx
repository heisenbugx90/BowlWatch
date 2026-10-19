/**
 * Landing page, rebuilt from bowlwatch-design/screens/01-landing.html.
 * Sign-ups are closed until email sending is turned on, so the signup form is
 * replaced by a notice and there is no Sign in link.
 */
const PRACTICES: [question: string, answer: string][] = [
  ["Full-time qualified nutritionist on staff", "Yes"],
  ["Owns its manufacturing plants", "Partly"],
  ["Runs AAFCO feeding trials", "No"],
  ["Publishes complete nutrient analysis on request", "Yes"],
  ["Publishes peer-reviewed research", "Unknown"],
];

const LEVELS = [
  { cls: "headsup", label: "Heads-up", basis: "Matched on brand only", quote: "A recall at Harrow & Finch; your food isn’t listed. Check your bag." },
  { cls: "alert", label: "Alert", basis: "Matched on product line", quote: "Recall affects Everyday Adult Chicken. Check lot and best-by." },
  { cls: "stop", label: "Stop", basis: "Matched on lot or best-by date", quote: "Stop feeding Everyday Adult Chicken. Lot 24A17 recalled." },
];

const SOURCES = [
  { country: "United States", source: "FDA Enforcement Report and FDA recalls listing", gives: "Recall notices with lot codes and distribution", live: true, status: "Watching" },
  { country: "Canada", source: "Health Canada Recalls and Safety Alerts", gives: "Public notices, free text", live: false, status: "Coming soon" },
  { country: "United Kingdom", source: "FSA food and feed alerts", gives: "Data API", live: false, status: "Later" },
  { country: "European Union", source: "RASFF Window", gives: "Portal export, no clean API", live: false, status: "Later" },
];

export default function Home() {
  return (
    <div className="page">
      <header className="site-header">
        <nav aria-label="Primary" className="wrap site-nav">
          <a href="#top" className="wordmark">
            <span aria-hidden="true" className="wordmark-mark" />
            BowlWatch
          </a>
          <a href="#how">How it works</a>
          <a href="#sources">Data sources</a>
          <a href="#canada">For Canadians</a>
        </nav>
      </header>

      <main>
        <section id="top" className="wrap two-col hero">
          <div className="hero-copy">
            <div className="eyebrow">Free · email only · US and Canada</div>
            <h1>Know the night a food in your pet’s bowl is recalled.</h1>
            <p className="lede">
              Tell us what you feed. Every night we read the official recall notices, match them against your foods, and
              email you only when something matches: the brand, the product line, or the exact lot on your bag.
            </p>
            <div className="notice">
              <p>
                <strong>Sign-ups open soon.</strong> <span className="muted">We are checking our matching against ten years of past recalls before we send anyone an alert.</span>
              </p>
            </div>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              No app to install. No feed to scroll. One email when it matters, nothing when it doesn’t.
            </p>
          </div>

          <div className="card" role="img" aria-label="Example of a Stop email">
            <div className="card-bar">
              <strong>BowlWatch</strong>
              <span>to you</span>
              <span className="mono" style={{ marginLeft: "auto" }}>
                02:14
              </span>
            </div>
            <div className="card-body">
              <div className="badge stop">
                <span aria-hidden="true" className="dot" />
                Stop feeding
              </div>
              <div className="card-title">Harrow &amp; Finch · Everyday Adult Chicken, 12 kg</div>
              <div className="facts">
                <div className="fact">
                  <span>Your lot</span>
                  <span className="mono">24A17</span>
                </div>
                <div className="fact">
                  <span>Recalled lots</span>
                  <span className="mono">24A15–24A19</span>
                </div>
              </div>
              <p className="muted" style={{ margin: 0, fontSize: 15 }}>
                Reason given: possible Salmonella contamination. Stop feeding, keep the bag for the return, wash bowls and
                scoops.
              </p>
              <span style={{ color: "var(--pine)", fontWeight: 600 }}>Read the original FDA notice ↗</span>
            </div>
          </div>
        </section>

        <section id="how" className="band-white">
          <div className="wrap section stack" style={{ gap: 40 }}>
            <h2 className="h2">Three steps, one of them yours.</h2>
            <ol className="steps three-col">
              <li>
                <span className="mono muted" style={{ fontSize: 13, fontWeight: 400 }}>01 · You</span>
                <h3>Register what you feed</h3>
                <p className="muted">
                  Add each pet, then the brand and product line in their bowl. Add the lot number and best-by date from the
                  bag if you want the most precise match.
                </p>
              </li>
              <li>
                <span className="mono muted" style={{ fontSize: 13, fontWeight: 400 }}>02 · Nightly</span>
                <h3>We read the recall feeds</h3>
                <p className="muted">
                  Every night we pull new notices and map their free-text product descriptions onto a curated table of
                  brands and lines.
                </p>
              </li>
              <li>
                <span className="mono muted" style={{ fontSize: 13, fontWeight: 400 }}>03 · On a match</span>
                <h3>You get an email that says what to do</h3>
                <p className="muted">Three levels, so the subject line tells you how worried to be before you open it.</p>
              </li>
            </ol>
            <div className="three-col">
              {LEVELS.map((l) => (
                <div key={l.cls} className="level">
                  <div className={`badge badge-pill ${l.cls}`}>
                    <span aria-hidden="true" className="dot" />
                    {l.label}
                  </div>
                  <div className="muted" style={{ fontSize: 14 }}>{l.basis}</div>
                  <p>
                    <q>{l.quote}</q>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="wrap section two-col" style={{ alignItems: "start" }}>
          <div className="stack">
            <h2 className="h2">The record, not a grade.</h2>
            <p className="muted" style={{ margin: 0, fontSize: 17 }}>
              When you add a food you see what is on file for the brand: every recall in the last ten years with its stated
              reason and a link to the notice, and the answers a manufacturer gives to the five WSAVA nutrition questions,
              each with a source. We do not score brands and we do not rate them. You read the citations and decide.
            </p>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            <div className="eyebrow">Example</div>
            <dl className="practices card">
              {PRACTICES.map(([q, a]) => (
                <div key={q} style={{ display: "contents" }}>
                  <dt>{q}</dt>
                  <dd className={a === "Unknown" ? "muted" : undefined}>{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="canada" className="dark-band">
          <div className="wrap two-col" style={{ paddingTop: 64, paddingBottom: 64, gap: 40, alignItems: "start" }}>
            <h2 className="h2">If you’re in Canada, read this first.</h2>
            <div className="stack" style={{ gap: 14, fontSize: 17 }}>
              <p>
                Pet food is not federally regulated in Canada. There is no Canadian agency that requires a manufacturer to
                announce a recall.
              </p>
              <p>
                Most recalls that reach Canadian shelves are announced by the US FDA, because the same product is sold south
                of the border. That is why we watch the FDA feed for every user, not only Americans.
              </p>
              <p style={{ fontWeight: 600 }}>Silence does not mean safety. It means nobody was required to say anything.</p>
            </div>
          </div>
        </section>

        <section id="sources" className="wrap section stack" style={{ gap: 24 }}>
          <h2 className="h2">Where the notices come from</h2>
          <div className="table-scroll">
            <table className="sources">
              <thead>
                <tr>
                  <th scope="col">Country</th>
                  <th scope="col">Source</th>
                  <th scope="col">What it gives us</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {SOURCES.map((s) => (
                  <tr key={s.country}>
                    <td>{s.country}</td>
                    <td>{s.source}</td>
                    <td className="muted">{s.gives}</td>
                    <td>
                      {s.live ? (
                        <span className="status">
                          <span aria-hidden="true" className="dot" />
                          {s.status}
                        </span>
                      ) : (
                        <span className="muted">{s.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <span>bowlwatch.ca · free, run by one person</span>
          <span>Dogs and cats · US and Canada</span>
        </div>
      </footer>
    </div>
  );
}
