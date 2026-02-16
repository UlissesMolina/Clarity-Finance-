import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { BarChart3, Wallet, PieChart, TrendingUp, Menu, X, MousePointer2, Receipt, Layers, Calendar, Cpu } from 'lucide-react';
import { ScrollProgress } from '../components/layout/ScrollProgress';
import { useCountUp } from '../hooks/useCountUp';
import './LandingPage.css';

const LandingAnalyticsChart = lazy(() =>
  import('../components/landing/LandingAnalyticsChart').then((m) => ({ default: m.LandingAnalyticsChart }))
);

const BalanceLineAnimation = lazy(() =>
  import('../components/landing/BalanceLineAnimation').then((m) => ({ default: m.default }))
);

/** Matches BalanceLineAnimation data: first month vs last month */
const INTERACTIVE_STATS = {
  startingBalance: 2840,
  currentBalance: 5910,
  growthPercent: 108,
};

export interface LandingPageProps {
  onViewDemo: () => void;
}

const TECH_ICONS: { name: string; icon: string }[] = [
  { name: 'React', icon: '/assets/react.svg' },
  { name: 'TypeScript', icon: '/assets/typescript.svg' },
  { name: 'GraphQL', icon: '/assets/graphql.svg' },
  { name: 'Apollo', icon: '/assets/apollographql.svg' },
  { name: 'Node.js', icon: '/assets/nodedotjs.svg' },
  { name: 'Radix UI', icon: '/assets/radixui.svg' },
  { name: 'Faker', icon: '/assets/faker.svg' },
  { name: 'Vite', icon: '/assets/vite.svg' },
].filter((t) => t.icon);

/** Update these to match the filenames in public/assets/ (e.g. after renaming/cropping) */
const IMG_DASHBOARD = '/assets/financeDashboardSS.png';
const IMG_ANALYTICS = '/assets/newAnalyticsSS.png';

/**
 * Professional landing page: glass nav, gradient hero, feature cards, tech pills, dark footer.
 * Self-contained; customize accent in LandingPage.css (--accent), logo and links below.
 */
export default function LandingPage({ onViewDemo }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statsInView, setStatsInView] = useState(false);
  const [interactiveInView, setInteractiveInView] = useState(false);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const statsSectionRef = useRef<HTMLElement | null>(null);
  const interactiveSectionRef = useRef<HTMLElement | null>(null);
  /* refs: 0=hero, 1=stats, 2=interactive, 3=feature-full, 4=analytics, 5=features, 6=tech-strip, 7=footer */

  const navRef = useRef<HTMLElement>(null);

  /* Count-up when scrolled into view */
  const statTransactions = useCountUp(10, { enabled: statsInView, runOnce: true, duration: 1400 });
  const statCategories = useCountUp(8, { enabled: statsInView, runOnce: true, duration: 1200 });
  const statMonths = useCountUp(6, { enabled: statsInView, runOnce: true, duration: 1000 });
  const statClient = useCountUp(100, { enabled: statsInView, runOnce: true, duration: 1600 });
  const interactiveStart = useCountUp(INTERACTIVE_STATS.startingBalance, { enabled: interactiveInView, runOnce: true, duration: 1200 });
  const interactiveCurrent = useCountUp(INTERACTIVE_STATS.currentBalance, { enabled: interactiveInView, runOnce: true, duration: 1400 });
  const interactiveGrowth = useCountUp(INTERACTIVE_STATS.growthPercent, { enabled: interactiveInView, runOnce: true, duration: 1000 });

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
    const statsEl = statsSectionRef.current;
    const interactiveEl = interactiveSectionRef.current;
    if (!statsEl && !interactiveEl) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === statsEl) setStatsInView(entry.isIntersecting);
          if (entry.target === interactiveEl) setInteractiveInView(entry.isIntersecting);
        });
      },
      { threshold: 0.25, rootMargin: '0px 0px -60px 0px' }
    );
    if (statsEl) io.observe(statsEl);
    if (interactiveEl) io.observe(interactiveEl);
    return () => io.disconnect();
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

      {/* Stats bar: big numbers, icons, count-up when in view */}
      <section
        className="landing-stats"
        ref={(el) => {
          if (el) {
            sectionRefs.current[1] = el;
            statsSectionRef.current = el;
          }
        }}
      >
        <div className="stats-inner">
          <div className="stat stat--transactions">
            <Receipt size={22} className="stat-icon" aria-hidden />
            <span className="stat-value">{statTransactions}K+</span>
            <span className="stat-label">Transactions</span>
          </div>
          <div className="stat stat--categories">
            <Layers size={22} className="stat-icon" aria-hidden />
            <span className="stat-value">{statCategories}</span>
            <span className="stat-label">Categories</span>
          </div>
          <div className="stat stat--months">
            <Calendar size={22} className="stat-icon" aria-hidden />
            <span className="stat-value">{statMonths}</span>
            <span className="stat-label">Months data</span>
          </div>
          <div className="stat stat--client">
            <Cpu size={22} className="stat-icon" aria-hidden />
            <span className="stat-value">{statClient}%</span>
            <span className="stat-label">Client-side</span>
          </div>
        </div>
      </section>

      {/* Interactive section: balance-over-time line (split layout) */}
      <section
        id="interactive"
        className="landing-interactive"
        ref={(el) => {
          if (el) {
            sectionRefs.current[2] = el;
            interactiveSectionRef.current = el;
          }
        }}
        aria-label="Balance over time"
      >
        <div className="landing-interactive-inner">
          <div className="landing-interactive-copy">
            <h2 className="landing-interactive-title">Your financial journey, visualized</h2>
            <p className="landing-interactive-lead">
              One clear line—no clutter. See where you started and where you are now.
            </p>
            <div className="landing-interactive-stats">
              <div className="landing-interactive-stat">
                <span className="landing-interactive-stat-label">Starting balance</span>
                <span className="landing-interactive-stat-value">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(interactiveStart)}
                </span>
              </div>
              <div className="landing-interactive-stat">
                <span className="landing-interactive-stat-label">Current balance</span>
                <span className="landing-interactive-stat-value landing-interactive-stat-value--accent">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(interactiveCurrent)}
                </span>
              </div>
              <div className="landing-interactive-stat">
                <span className="landing-interactive-stat-label">Growth</span>
                <span
                  className={`landing-interactive-stat-value landing-interactive-stat-value--growth-pill${interactiveInView ? ' landing-interactive-stat-value--growth-pill-visible' : ''}`}
                >
                  <TrendingUp size={16} aria-hidden />
                  +{interactiveGrowth}%
                </span>
              </div>
            </div>
            <p className="landing-interactive-insight" role="status">
              <TrendingUp size={18} className="landing-interactive-insight-icon" aria-hidden />
              Your balance grew {INTERACTIVE_STATS.growthPercent}% this year — great work!
            </p>
          </div>
          <div className="landing-interactive-chart-wrap">
            <p className="landing-interactive-hint" aria-hidden>
              <MousePointer2 size={14} />
              Interactive — hover to explore
            </p>
            <div className="landing-interactive-canvas">
              <Suspense
                fallback={
                  <div className="landing-interactive-fallback" aria-hidden />
                }
              >
                <BalanceLineAnimation />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* Full-screen feature: one story (Linear-style) */}
      <section className="feature-full" ref={(el) => { if (el) sectionRefs.current[3] = el; }}>
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
                src={IMG_DASHBOARD}
                alt="Clarity Finance dashboard showing overview cards, balance chart, and transactions"
                className="landing-screenshot"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="tech-strip" ref={(el) => { if (el) sectionRefs.current[6] = el; }} aria-label="Built with">
        <h2 className="tech-strip-heading">Built with</h2>
        <div className="tech-icons-row">
          {TECH_ICONS.map((item) => (
            <div key={item.name} className="tech-icon-item">
              <img src={item.icon} alt={item.name} className="tech-icons-row-icon" />
              <span className="tech-icon-label">{item.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Analytics section: interactive chart (lazy-loaded) */}
      <section className="feature-full feature-full--alt" ref={(el) => { if (el) sectionRefs.current[4] = el; }}>
        <div className="feature-full-inner feature-full-inner--reverse">
          <div className="feature-full-visual">
            <div className="landing-screenshot-wrap landing-screenshot-wrap--analytics landing-chart-fallback-wrap">
              <Suspense
                fallback={
                  <img
                    src={IMG_ANALYTICS}
                    alt="Spending analytics and category breakdown"
                    className="landing-screenshot"
                  />
                }
              >
                <LandingAnalyticsChart />
              </Suspense>
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

      <section id="features" className="landing-features" ref={(el) => { if (el) sectionRefs.current[5] = el; }}>
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

      <footer className="landing-footer" ref={(el) => { if (el) sectionRefs.current[7] = el; }}>
        <div className="footer-grid">
          <div className="footer-section">
            <h4>Product</h4>
            <a href="#features">Features</a>
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
