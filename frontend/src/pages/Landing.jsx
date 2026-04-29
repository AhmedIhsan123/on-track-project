import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  return (
    <div className="land-page">
      <header className="land-nav">
        <span className="land-logo">On-Track</span>
        <div className="land-nav-actions">
          <Link to="/login" className="land-btn-login">Log in</Link>
          <Link to="/signup" className="land-btn-cta">Get started free</Link>
        </div>
      </header>

      <section className="land-hero">
        <div className="land-hero-inner">
          <h1 className="land-hero-title">
            Stop losing track of<br />your applications.
          </h1>
          <p className="land-hero-sub">
            Paste a job listing URL. We scrape the details automatically — title, company,
            location, salary. You focus on the search, we handle the tracking.
          </p>
          <Link to="/signup" className="land-btn-hero">Get started — it's free</Link>
        </div>
      </section>

      <section className="land-features">
        <div className="land-features-inner">
          <div className="land-feature-card">
            <span className="land-feature-icon">⚡</span>
            <h3>Auto-fill from any URL</h3>
            <p>Paste a Greenhouse, Lever, or any job listing URL and we extract the title, company, location, and salary in seconds.</p>
          </div>
          <div className="land-feature-card">
            <span className="land-feature-icon">📊</span>
            <h3>Stats at a glance</h3>
            <p>See your response rate, interview rate, and active applications — right alongside your full list, no separate dashboard needed.</p>
          </div>
          <div className="land-feature-card">
            <span className="land-feature-icon">🎯</span>
            <h3>Track every stage</h3>
            <p>Move applications from Applied through Phone Screen, Interview, Final Round, and Offer with one click — right from the list.</p>
          </div>
        </div>
      </section>

      <section className="land-how">
        <h2 className="land-how-title">How it works</h2>
        <div className="land-steps">
          <div className="land-step">
            <span className="land-step-num">1</span>
            <h3>Paste a URL</h3>
            <p>Drop any job listing link into On-Track and we fill in the details.</p>
          </div>
          <span className="land-step-arrow">→</span>
          <div className="land-step">
            <span className="land-step-num">2</span>
            <h3>Review the details</h3>
            <p>We auto-fill title, company, location, and salary. Edit anything before saving.</p>
          </div>
          <span className="land-step-arrow">→</span>
          <div className="land-step">
            <span className="land-step-num">3</span>
            <h3>Track your progress</h3>
            <p>Update stages as you hear back. Watch your response rate grow.</p>
          </div>
        </div>
      </section>

      <section className="land-cta">
        <h2>Ready to get organized?</h2>
        <p>Free to use. No credit card required.</p>
        <Link to="/signup" className="land-btn-hero">Create your free account</Link>
      </section>

      <footer className="land-footer">
        <span className="land-footer-logo">On-Track</span>
        <span className="land-footer-copy">© {new Date().getFullYear()} On-Track</span>
      </footer>
    </div>
  );
}
