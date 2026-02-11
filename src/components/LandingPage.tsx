import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, Wallet, PieChart, TrendingUp, Menu, X } from 'lucide-react';
import { ScrollProgress } from './ScrollProgress';
import './LandingPage.css';

export interface LandingPageProps {
  onViewDemo: () => void;
}

const TECH_STACK = ['React', 'TypeScript', 'Recharts', 'GraphQL', 'Apollo'];

/** Update these to match the filenames in public/assets/ (e.g. after renaming/cropping) */
const IMG_DASHBOARD = 'financeDashboardSS.png';
const IMG_ANALYTICS = 'newAnalyticsSS.png';
const asset = (name: string) => `${process.env.PUBLIC_URL || ''}/assets/${name}`;

/**
 * Professional landing page: glass nav, gradient hero, feature cards, tech pills, dark footer.
 * Self-contained; customize accent in LandingPage.css (--accent), logo and links below.
 */
export default function LandingPage({ onViewDemo }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  /* refs: 0=hero, 1=stats, 2=feature-full, 3=analytics, 4=features, 5=tech, 6=footer */

  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        navRef.current.classList.toggle('scrolled', window.scrollY > 20);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      <ScrollProgress />
      <nav ref={navRef} className="landing-nav" aria-label="Main">
        <div className="nav-inner">
          <a href="#hero" className="nav-logo">
            <img src="/pie-chart.png" alt="Clarity Finance" className="nav-logo-img nav-logo-img--green" />
            <span className="nav-logo-text">Clarity Finance</span>
          </a>
          <button
            type="button"
            className="nav-toggle"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <ul className={`nav-links ${mobileMenuOpen ? 'nav-links-open' : ''}`}>
            <li><a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a></li>
            <li><a href="#tech" onClick={() => setMobileMenuOpen(false)}>Tech</a></li>
            <li>
              <button type="button" className="btn btn-primary btn-nav" onClick={() => { setMobileMenuOpen(false); onViewDemo(); }}>
                View Demo
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <header id="hero" className="landing-hero" ref={(el) => { if (el) sectionRefs.current[0] = el; }}>
        <div className="hero-bg" aria-hidden />
        <div className="hero-content">
          <span className="landing-hero-title-wrap">
            <h1 className="landing-hero-title">Clarity Finance</h1>
          </span>
          <p className="landing-hero-subtitle">
            See your money clearly
          </p>
          <p className="landing-hero-description">
            Track your income, expenses, and savings in one place.
          </p>
          <div className="landing-cta">
            <button type="button" className="btn btn-primary" onClick={onViewDemo}>
              View Demo
            </button>
            <a
              href="https://github.com/UlissesMolina/FinanceDashBoard"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Stats bar (Linear-style social proof) */}
      <section className="landing-stats" ref={(el) => { if (el) sectionRefs.current[1] = el; }}>
        <div className="stats-inner">
          <div className="stat">
            <span className="stat-value">10K+</span>
            <span className="stat-label">Transactions</span>
          </div>
          <div className="stat">
            <span className="stat-value">8</span>
            <span className="stat-label">Categories</span>
          </div>
          <div className="stat">
            <span className="stat-value">6</span>
            <span className="stat-label">Months data</span>
          </div>
          <div className="stat">
            <span className="stat-value">100%</span>
            <span className="stat-label">Client-side</span>
          </div>
        </div>
      </section>

      {/* Full-screen feature: one story (Linear-style) */}
      <section className="feature-full" ref={(el) => { if (el) sectionRefs.current[2] = el; }}>
        <div className="feature-full-inner">
          <div className="feature-full-content">
            <h2 className="feature-full-title">Visual analytics at a glance</h2>
            <p className="feature-full-lead">
              See income, expenses, and net balance in one place. Overview cards with sparklines show daily trends without opening a single report.
            </p>
            <p className="feature-full-body">
              Filter by month, compare with the previous period, and drill into spending by category. Built for clarity—no clutter, no hidden menus.
            </p>
            <button type="button" className="btn btn-primary" onClick={onViewDemo}>
              View Demo
            </button>
          </div>
          <div className="feature-full-visual">
            <div className="landing-screenshot-wrap landing-screenshot-wrap--dashboard">
              <img
                src={asset(IMG_DASHBOARD)}
                alt="Clarity Finance dashboard showing overview cards, balance chart, and transactions"
                className="landing-screenshot"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Analytics screenshot section */}
      <section className="feature-full feature-full--alt" ref={(el) => { if (el) sectionRefs.current[3] = el; }}>
        <div className="feature-full-inner feature-full-inner--reverse">
          <div className="feature-full-visual">
            <div className="landing-screenshot-wrap landing-screenshot-wrap--analytics">
              <img
                src={asset(IMG_ANALYTICS)}
                alt="Spending analytics and category breakdown"
                className="landing-screenshot"
              />
            </div>
          </div>
          <div className="feature-full-content">
            <h2 className="feature-full-title">Spending analytics</h2>
            <p className="feature-full-lead">
              Understand where your money goes. Category breakdowns, trends, and detailed insights—all in one view.
            </p>
            <button type="button" className="btn btn-primary" onClick={onViewDemo}>
              View Demo
            </button>
          </div>
        </div>
      </section>

      <section id="features" className="landing-features" ref={(el) => { if (el) sectionRefs.current[4] = el; }}>
        <h2 className="landing-section-title">More features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrap">
              <BarChart3 size={24} className="feature-icon" aria-hidden />
            </div>
            <h3>Visual Analytics</h3>
            <p>Charts and sparklines to understand your money at a glance.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrap">
              <Wallet size={24} className="feature-icon" aria-hidden />
            </div>
            <h3>Income & Expense Tracking</h3>
            <p>See totals, net balance, and transaction counts per month.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrap">
              <PieChart size={24} className="feature-icon" aria-hidden />
            </div>
            <h3>Category Breakdown</h3>
            <p>Spending by category with clear, color-coded charts.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrap">
              <TrendingUp size={24} className="feature-icon" aria-hidden />
            </div>
            <h3>Monthly Trends</h3>
            <p>Balance over time and month-over-month comparison.</p>
          </div>
        </div>
      </section>

      <section id="tech" className="landing-tech" ref={(el) => { if (el) sectionRefs.current[5] = el; }}>
        <h2 className="landing-section-title">Tech Stack</h2>
        <div className="tech-pills">
          {TECH_STACK.map((tech) => (
            <span key={tech} className="tech-badge"><span>{tech}</span></span>
          ))}
        </div>
      </section>

      <footer className="landing-footer" ref={(el) => { if (el) sectionRefs.current[6] = el; }}>
        <div className="footer-grid">
          <div className="footer-section">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#tech">Tech Stack</a>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://react.dev" target="_blank" rel="noopener noreferrer">React</a>
          </div>
          <div className="footer-section">
            <h4>Built with</h4>
            <p>React · TypeScript · Recharts · GraphQL · Apollo</p>
          </div>
          <div className="footer-section footer-cta">
            <h4>Get started</h4>
            <button type="button" className="btn btn-primary" onClick={onViewDemo}>View Demo</button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Clarity</span>
          <span>See your money clearly</span>
        </div>
      </footer>
    </div>
  );
}
