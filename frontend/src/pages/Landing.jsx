import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const FAQ = [
  {
    q: 'Is On-Track free?',
    a: 'Yes, completely free. No credit card, no trial period, no limits on the number of applications. It\'s a portfolio project — the goal is for it to be genuinely useful, not monetised.',
  },
  {
    q: 'Which job boards does the scraper support?',
    a: 'Any publicly accessible listing URL — LinkedIn, Greenhouse, Lever, Workday, Indeed, and company career pages. If the page is publicly readable, we can scrape it. Pages behind a login wall need manual entry instead.',
  },
  {
    q: 'Who can see my applications?',
    a: 'Only you. Every application is scoped to your account via row-level security in Supabase. Auth is email/password, Google, or GitHub OAuth — all token-verified server-side on every request.',
  },
  {
    q: 'Can I import from a spreadsheet?',
    a: 'Not yet — manual entry and URL scraping are the current options. CSV import is planned. If it\'s important to you, open an issue on GitHub and it\'ll move up the list.',
  },
  {
    q: "What's the tech stack?",
    a: 'React + plain CSS on the frontend (Vite, hosted on Vercel). Node.js + Express on the backend (hosted on Render). PostgreSQL via Supabase for the database and auth. It\'s a full-stack portfolio project built from scratch.',
  },
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="lp-nav">
        <a className="lp-nav-logo" href="#top">on<span className="lp-dot">·</span>track</a>
        <div className="lp-nav-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="lp-nav-ctas">
          <Link to="/login" className="lp-btn-ghost">Sign in</Link>
          <Link to="/signup" className="lp-btn-primary">Sign up free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section id="top" className="lp-hero">
        <div className="lp-hero-grid" />
        <div className="lp-hero-glow" />
        <div className="lp-hero-inner">
          <div>
            <div className="lp-eyebrow">Job application tracker</div>
            <h1 className="lp-h1">
              Paste a URL.<br />
              <em>We handle the rest.</em>
            </h1>
            <p className="lp-hero-sub">
              On-Track scrapes every job listing automatically — title, company, salary,
              location — and tracks your whole pipeline from first application to offer.
            </p>
            <div className="lp-hero-actions">
              <Link to="/signup" className="lp-btn-lg lp-btn-primary-lg">Sign up free →</Link>
              <a href="#how" className="lp-btn-lg lp-btn-ghost-lg">How it works</a>
            </div>
            <div className="lp-hero-note">Free. No credit card. No spreadsheet.</div>
          </div>

          {/* App mockup */}
          <div className="mock-wrap">
            <div className="mock-halo" />
            <div className="mock-app">
              <div className="mock-chrome">
                <div className="mock-chrome-dot" style={{ background: '#f87171' }} />
                <div className="mock-chrome-dot" style={{ background: '#fbbf24' }} />
                <div className="mock-chrome-dot" style={{ background: '#4ade80' }} />
                <div className="mock-chrome-url">on-track.app/app</div>
              </div>
              <div className="mock-body">
                <div className="mock-side">
                  <div className="mock-side-logo">on<span className="lp-dot">·</span>track</div>
                  <div className="mock-side-nav">
                    <span className="mock-nav-icon">
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <rect x="0" y="0" width="3.5" height="3.5" rx="0.5" fill="currentColor" />
                        <rect x="5.5" y="0" width="3.5" height="3.5" rx="0.5" fill="currentColor" />
                        <rect x="0" y="5.5" width="3.5" height="3.5" rx="0.5" fill="currentColor" />
                        <rect x="5.5" y="5.5" width="3.5" height="3.5" rx="0.5" fill="currentColor" />
                      </svg>
                    </span>
                    Overview
                  </div>
                </div>
                <div className="mock-main">
                  <div className="mock-header">
                    <div>
                      <div className="mock-title">Overview</div>
                      <div className="mock-sub">April 2026 · 10 tracked</div>
                    </div>
                    <div className="mock-add">+ Add</div>
                  </div>
                  <div className="mock-stats">
                    <div className="mock-stat"><div className="mock-stat-lbl">Total</div><div className="mock-stat-val">10</div></div>
                    <div className="mock-stat"><div className="mock-stat-lbl">Active</div><div className="mock-stat-val">7</div></div>
                    <div className="mock-stat"><div className="mock-stat-lbl">Offers</div><div className="mock-stat-val green">1</div></div>
                    <div className="mock-stat"><div className="mock-stat-lbl">Interviews</div><div className="mock-stat-val blue">3</div></div>
                  </div>
                  <div className="mock-tbl">
                    <div className="mock-tbl-head">
                      <span>Company</span><span>Role</span><span>Stage</span><span>Date</span><span />
                    </div>
                    <MockRow co="Stripe" role="Sr. Frontend Eng." stage="interview" stageLabel="Interview" date="Apr 15" />
                    <MockRow co="Notion" role="Frontend Engineer" stage="offer" stageLabel="Offer" date="Mar 20" />
                    <MockRow co="Vercel" role="Software Eng., DX" stage="screen" stageLabel="Screen" date="Apr 10" />
                    <MockRow co="Linear" role="Product Engineer" stage="applied" stageLabel="Applied" date="Apr 22" />
                    <MockRow co="Figma" role="Full Stack Eng." stage="rejected" stageLabel="Rejected" date="Mar 28" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="lp-ticker">
        <div className="lp-ticker-inner">
          <div className="lp-ticker-item">
            <div className="lp-ticker-val"><span className="accent">7</span></div>
            <div className="lp-ticker-desc">pipeline stages<br />from applied to offer</div>
          </div>
          <div className="lp-ticker-item">
            <div className="lp-ticker-val">~<span className="accent">2</span>s</div>
            <div className="lp-ticker-desc">to scrape a job<br />listing automatically</div>
          </div>
          <div className="lp-ticker-item">
            <div className="lp-ticker-val"><span className="accent">0</span></div>
            <div className="lp-ticker-desc">spreadsheets<br />required</div>
          </div>
          <div className="lp-ticker-item">
            <div className="lp-ticker-val"><span className="accent">∞</span></div>
            <div className="lp-ticker-desc">applications<br />tracked for free</div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <section id="how" className="lp-section">
        <div className="lp-section-inner">
          <div className="lp-section-label">How it works</div>
          <h2 className="lp-h2">From listing to tracked<br />in three steps.</h2>
          <p className="lp-section-sub">
            No manual data entry. Paste the URL, review what we found, and get back to applying.
          </p>

          <div className="lp-steps">
            <div className="lp-step">
              <div className="lp-step-num">01</div>
              <div className="lp-step-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="3" width="14" height="12" rx="2" stroke="var(--accent-txt)" strokeWidth="1.4" />
                  <path d="M6 3V2M12 3V2" stroke="var(--accent-txt)" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M2 7h14" stroke="var(--accent-txt)" strokeWidth="1.4" />
                  <path d="M6 11h6" stroke="var(--accent-txt)" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Paste a job URL</h3>
              <p>Drop in any listing from LinkedIn, Greenhouse, Lever, Workday, or a company careers page.</p>
              <div className="lp-step-arrow">→</div>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">02</div>
              <div className="lp-step-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="var(--accent-txt)" strokeWidth="1.4" />
                  <path d="M9 5v4l3 2" stroke="var(--accent-txt)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>We scrape the details</h3>
              <p>Company, role, location, salary, and posted date — extracted in about two seconds.</p>
              <div className="lp-step-arrow">→</div>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">03</div>
              <div className="lp-step-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9l4 4 8-8" stroke="var(--accent-txt)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>Track your pipeline</h3>
              <p>Move applications through stages, take notes, and watch your stats update in real time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="lp-section lp-features">
        <div className="lp-section-inner">
          <div className="lp-section-label">Features</div>
          <h2 className="lp-h2">Everything you need.<br />Nothing you don't.</h2>
          <p className="lp-section-sub">Stripped-down and fast. Built for developers who want signal, not noise.</p>
          <div className="lp-features-grid">
            <Feature
              title="Auto-scrape on paste"
              tag="URL → data in ~2s"
              icon={
                <svg viewBox="0 0 38 38" fill="none">
                  <rect width="38" height="38" rx="7" fill="var(--accent-dim)" />
                  <path d="M12 19h14M19 12v14" stroke="var(--accent-txt)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              }
            >
              Paste a listing URL and we pull title, company, location, salary, and posting date — automatically.
            </Feature>
            <Feature
              title="7-stage pipeline"
              tag="Color-coded by stage"
              icon={
                <svg viewBox="0 0 38 38" fill="none">
                  <rect width="38" height="38" rx="7" fill="var(--accent-dim)" />
                  <circle cx="12" cy="19" r="3" fill="var(--accent-txt)" />
                  <circle cx="26" cy="19" r="3" fill="var(--accent-txt)" />
                  <path d="M15 19h8" stroke="var(--accent-txt)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              }
            >
              Applied → Screen → Interview → Final → Offer → Rejected → Withdrawn. Update with one click.
            </Feature>
            <Feature
              title="Live dashboard & stats"
              tag="Live charts, no refresh"
              icon={
                <svg viewBox="0 0 38 38" fill="none">
                  <rect width="38" height="38" rx="7" fill="var(--accent-dim)" />
                  <rect x="9" y="24" width="5" height="6" rx="1" fill="var(--accent-txt)" opacity="0.4" />
                  <rect x="16.5" y="18" width="5" height="12" rx="1" fill="var(--accent-txt)" opacity="0.7" />
                  <rect x="24" y="12" width="5" height="18" rx="1" fill="var(--accent-txt)" />
                </svg>
              }
            >
              Weekly activity chart, donut by stage, offer rate, response rate — all from your real data.
            </Feature>
            <Feature
              title="Per-application notes"
              tag="Inline editing"
              icon={
                <svg viewBox="0 0 38 38" fill="none">
                  <rect width="38" height="38" rx="7" fill="var(--accent-dim)" />
                  <path d="M11 14h16M11 19h11M11 24h8" stroke="var(--accent-txt)" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              }
            >
              Attach interview notes, recruiter names, follow-up dates, and negotiation details to each application.
            </Feature>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta">
        <div className="lp-cta-glow" />
        <div className="lp-cta-grid" />
        <div className="lp-cta-inner">
          <div className="lp-cta-label">Get started</div>
          <h2 className="lp-h2">Stop losing track.<br />Start getting offers.</h2>
          <p>Sign up in under a minute. Paste your first job URL and we'll have it tracked before you can open a spreadsheet.</p>
          <div className="lp-cta-actions">
            <Link to="/signup" className="lp-btn-lg lp-btn-primary-lg">Sign up free →</Link>
            <a href="#how" className="lp-btn-lg lp-btn-ghost-lg">See how it works</a>
          </div>
          <div className="lp-cta-note">Free forever · No credit card · No spreadsheet</div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="lp-section lp-faq-section">
        <div className="lp-section-inner">
          <div className="lp-faq-grid">
            <div>
              <div className="lp-section-label">FAQ</div>
              <h2 className="lp-h2">Questions.</h2>
              <p className="lp-faq-aside">
                Something else on your mind? Open an issue on GitHub or reach out directly.
              </p>
            </div>
            <div className="lp-faq-list">
              {FAQ.map((item, i) => (
                <div key={i} className="lp-faq-item">
                  <button
                    className={`lp-faq-q${openFaq === i ? ' open' : ''}`}
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  >
                    {item.q}
                    <span className="lp-faq-icon">+</span>
                  </button>
                  <div className={`lp-faq-a${openFaq === i ? ' open' : ''}`}>
                    <p>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <div className="lp-footer-logo">on<span className="lp-dot">·</span>track</div>
            <p>A job application tracker built for developers who want their search under control.</p>
          </div>
          <div className="lp-footer-links">
            <div className="lp-footer-col">
              <h4>Product</h4>
              <a href="#how">How it works</a>
              <a href="#features">Features</a>
              <Link to="/signup">Sign up</Link>
            </div>
            <div className="lp-footer-col">
              <h4>Project</h4>
              <a href="#">GitHub</a>
              <a href="#faq">FAQ</a>
            </div>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© 2026 On-Track</span>
          <a href="#">Privacy</a>
        </div>
      </footer>
    </div>
  );
}

function Feature({ title, tag, icon, children }) {
  return (
    <div className="lp-feature">
      <div className="lp-feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{children}</p>
      <span className="lp-feature-tag">{tag}</span>
    </div>
  );
}

function MockRow({ co, role, stage, stageLabel, date }) {
  return (
    <div className="mock-tbl-row">
      <div className="mock-co">{co}</div>
      <div className="mock-role">{role}</div>
      <div><span className={`mock-pill p-${stage}`}>{stageLabel}</span></div>
      <div className="mock-date">{date}</div>
      <div className="mock-arrow">→</div>
    </div>
  );
}
