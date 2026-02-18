import React, { useState, useRef, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { CATEGORY_COLORS } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { MousePointer2, Hand } from 'lucide-react';
import './LandingAnalyticsChart.css';

const DEMO_DATA = [
  { name: 'Food & Dining', value: 1240, color: CATEGORY_COLORS['Food & Dining'] ?? '#059669' },
  { name: 'Transportation', value: 680, color: CATEGORY_COLORS['Transportation'] ?? '#06b6d4' },
  { name: 'Shopping', value: 420, color: CATEGORY_COLORS['Shopping'] ?? '#8b5cf6' },
  { name: 'Bills & Utilities', value: 890, color: CATEGORY_COLORS['Bills & Utilities'] ?? '#0d9488' },
  { name: 'Entertainment', value: 310, color: CATEGORY_COLORS['Entertainment'] ?? '#7c3aed' },
  { name: 'Other', value: 210, color: CATEGORY_COLORS['Other'] ?? '#64748b' },
];

const total = DEMO_DATA.reduce((s, d) => s + d.value, 0);
const chartData = DEMO_DATA.map((d) => ({
  ...d,
  percent: total > 0 ? Math.round((d.value / total) * 100) : 0,
}));

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { percent: number } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const percent = p.payload?.percent ?? 0;
  return (
    <div className="landing-chart-tooltip">
      <span className="landing-chart-tooltip-name">{p.name}</span>
      <span className="landing-chart-tooltip-amount">{formatCurrency(p.value)}</span>
      <span className="landing-chart-tooltip-pct">{percent}%</span>
    </div>
  );
}

/** Active segment: slight scale (1.02x) + glow for polish */
function renderActiveShape(props: React.ComponentProps<typeof Sector>) {
  const scale = 1.02;
  const outerRadius = (props.outerRadius ?? 96) * scale;
  return (
    <Sector
      {...props}
      outerRadius={outerRadius}
      strokeWidth={2}
      stroke="var(--gray-800)"
      filter="drop-shadow(0 4px 12px rgba(0,0,0,0.12))"
    />
  );
}

interface LegendPayloadItem {
  value: string;
  color: string;
  payload?: { value: number; percent: number };
}

interface CustomLegendProps {
  payload?: LegendPayloadItem[];
  activeIndex: number | null;
  onItemHover?: (index: number | null) => void;
  onItemClick?: (index: number) => void;
}

function CustomLegend({ payload = [], activeIndex, onItemHover, onItemClick }: CustomLegendProps) {
  if (!payload.length) return null;
  return (
    <ul className="landing-chart-legend" role="list">
      {payload.map((entry, index) => (
        <li
          key={entry.value}
          className={`landing-chart-legend-item ${activeIndex === index ? 'landing-chart-legend-item--active' : ''}`}
          onMouseEnter={() => onItemHover?.(index)}
          onMouseLeave={() => onItemHover?.(null)}
          onClick={() => onItemClick?.(index)}
          {...(onItemClick && { role: 'button' as const, tabIndex: 0, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onItemClick(index); } } })}
        >
          <span className="landing-chart-legend-dot" style={{ background: entry.color }} aria-hidden />
          <span className="landing-chart-legend-label">
            {entry.value}
            {entry.payload != null && (
              <>
                {' — '}
                <span className="landing-chart-legend-amount">{formatCurrency(entry.payload.value)}</span>
                <span className="landing-chart-legend-pct"> ({entry.payload.percent}%)</span>
              </>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

const PIE_MOBILE_BREAKPOINT = 768;
const CHART_HEIGHT_DESKTOP = 450;
const CHART_HEIGHT_MOBILE = 260;

export function LandingAnalyticsChart() {
  const [inView, setInView] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [shouldRenderChart, setShouldRenderChart] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            // Delay chart rendering until after container has final dimensions
            setTimeout(() => setShouldRenderChart(true), 100);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < PIE_MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* Desktop: hover drives highlight + tooltip. Mobile: tap drives highlight + tooltip; tap again deselects. */
  const displayIndex = isMobile ? selectedIndex : activeIndex;
  const handleSegmentEnter = (_: unknown, index: number) => {
    if (!isMobile) setActiveIndex(index);
  };
  const handleSegmentLeave = () => {
    if (!isMobile) setActiveIndex(null);
  };
  const handleSegmentClick = (_: unknown, index: number) => {
    if (isMobile) setSelectedIndex(selectedIndex === index ? null : index);
  };

  return (
    <div ref={containerRef} className={`landing-analytics-chart-wrap ${inView ? 'landing-analytics-chart-wrap--in-view' : ''}`}>
      <p className="landing-chart-hint" aria-hidden>
        {isMobile ? (
          <>
            <Hand size={14} />
            Tap to highlight and see tooltip, tap again to deselect
          </>
        ) : (
          <>
            <MousePointer2 size={14} />
            Hover to highlight and see tooltip
          </>
        )}
      </p>
      <div className={`landing-chart-area ${!isMobile ? 'landing-chart-area--desktop' : ''}`}>
        {!inView && (
          <div className="landing-chart-skeleton" aria-hidden>
            <div className="landing-chart-skeleton-donut" />
          </div>
        )}
        {!isMobile && (
          <div className="landing-chart-legend-desktop">
            <CustomLegend
              payload={chartData.map((d) => ({ value: d.name, color: d.color, payload: { value: d.value, percent: d.percent } }))}
              activeIndex={displayIndex}
              onItemHover={setActiveIndex}
            />
          </div>
        )}
        <div
          className={`landing-analytics-chart landing-analytics-chart--pointer ${inView ? 'landing-analytics-chart--visible' : ''}`}
          style={{
            height: isMobile ? CHART_HEIGHT_MOBILE : CHART_HEIGHT_DESKTOP,
            width: isMobile ? '100%' : 320,
            minWidth: isMobile ? undefined : 320,
            pointerEvents: 'auto',
          }}
        >
          {shouldRenderChart && (
            <ResponsiveContainer
              width={isMobile ? '100%' : 320}
              height={isMobile ? '100%' : CHART_HEIGHT_DESKTOP}
              style={{ touchAction: 'manipulation' }}
            >
              <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? '45%' : '55%'}
                  outerRadius={isMobile ? '64%' : '76%'}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={1000}
                  animationEasing="ease-out"
                  {...({
                    activeIndex: displayIndex ?? undefined,
                    activeShape: renderActiveShape,
                  } as React.ComponentProps<typeof Pie>)}
                  onMouseEnter={handleSegmentEnter}
                  onMouseLeave={handleSegmentLeave}
                  onClick={handleSegmentClick}
                  onTouchEnd={(arg0: unknown, arg1?: number) => { if (typeof arg1 === 'number') handleSegmentClick(arg0, arg1); }}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={displayIndex == null || displayIndex === index ? 1 : 0.4}
                      style={{
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease',
                        touchAction: 'manipulation',
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      {isMobile && (
        <div className="landing-chart-legend-mobile">
          <CustomLegend
            payload={chartData.map((d) => ({ value: d.name, color: d.color, payload: { value: d.value, percent: d.percent } }))}
            activeIndex={displayIndex}
            onItemHover={undefined}
            onItemClick={(i) => setSelectedIndex(selectedIndex === i ? null : i)}
          />
        </div>
      )}
      {isMobile && selectedIndex != null && (
        <div className="landing-chart-mobile-tooltip" role="status">
          <span className="landing-chart-tooltip-name">{chartData[selectedIndex].name}</span>
          <span className="landing-chart-tooltip-amount">{formatCurrency(chartData[selectedIndex].value)}</span>
          <span className="landing-chart-tooltip-pct">{chartData[selectedIndex].percent}%</span>
        </div>
      )}
    </div>
  );
}
