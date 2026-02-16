import { useRef, useState, useCallback, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';

/** Sample balance-over-time data (last 12 months) for the landing animation */
export const BALANCE_DATA = [
  { label: 'Jan', value: 2840, year: 2025 },
  { label: 'Feb', value: 3520, year: 2025 },
  { label: 'Mar', value: 3190, year: 2025 },
  { label: 'Apr', value: 4100, year: 2025 },
  { label: 'May', value: 3850, year: 2025 },
  { label: 'Jun', value: 4620, year: 2025 },
  { label: 'Jul', value: 4310, year: 2025 },
  { label: 'Aug', value: 5080, year: 2025 },
  { label: 'Sep', value: 4750, year: 2025 },
  { label: 'Oct', value: 5420, year: 2025 },
  { label: 'Nov', value: 5190, year: 2025 },
  { label: 'Dec', value: 5910, year: 2025 },
];

/** Stats derived from BALANCE_DATA for the landing section */
export const BALANCE_CHART_STATS = (() => {
  const first = BALANCE_DATA[0].value;
  const last = BALANCE_DATA[BALANCE_DATA.length - 1].value;
  const growth = first ? Math.round(((last - first) / first) * 100) : 0;
  return { startingBalance: first, currentBalance: last, growthPercent: growth };
})();

const PADDING = { top: 36, right: 28, bottom: 44, left: 52 };
const DRAW_DURATION_MS = 1600;
const Y_AXIS_TICKS = 4;
const GRID_OPACITY = 0.35;

export default function BalanceLineAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hoverPoint, setHoverPoint] = useState<{
    x: number;
    y: number;
    value: number;
    label: string;
    year: number;
  } | null>(null);
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);
  const [drawComplete, setDrawComplete] = useState(false);
  const [inView, setInView] = useState(false);
  const drawStartedRef = useRef(false);

  const data = BALANCE_DATA;
  const minY = Math.min(...data.map((d) => d.value));
  const maxY = Math.max(...data.map((d) => d.value));
  const rangeY = maxY - minY || 1;
  const chartWidth = size.width - PADDING.left - PADDING.right;
  const chartHeight = size.height - PADDING.top - PADDING.bottom;

  // Build path and get length
  const points = data.map((d, i) => {
    const x = PADDING.left + (i / (data.length - 1)) * chartWidth;
    const y = PADDING.top + chartHeight - ((d.value - minY) / rangeY) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  // Y-axis label values
  const yTicks = Array.from({ length: Y_AXIS_TICKS + 1 }, (_, i) => {
    const t = i / Y_AXIS_TICKS;
    const value = Math.round(minY + t * rangeY);
    const y = PADDING.top + chartHeight - t * chartHeight;
    return { value, y };
  });

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    setPathLength(len);
  }, [size.width, size.height]);

  // Observe when section is in view to start draw
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setInView(true);
      },
      { threshold: 0.2, rootMargin: '0px 0px -80px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Animate line drawing when in view
  useEffect(() => {
    if (!inView || pathLength === 0 || drawStartedRef.current) return;
    drawStartedRef.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / DRAW_DURATION_MS, 1);
      const eased = 1 - (1 - t) * (1 - t);
      if (pathRef.current) {
        pathRef.current.style.strokeDashoffset = String((1 - eased) * pathLength);
      }
      if (t < 1) requestAnimationFrame(tick);
      else setDrawComplete(true);
    };
    requestAnimationFrame(tick);
  }, [inView, pathLength]);

  const updateSize = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });
  }, []);

  useEffect(() => {
    updateSize();
    const ro = new ResizeObserver(updateSize);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', updateSize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [updateSize]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el || chartWidth <= 0) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const chartX = x - PADDING.left;
      if (chartX < 0 || chartX > chartWidth) {
        setHoverPoint(null);
        return;
      }
      const index = Math.round((chartX / chartWidth) * (data.length - 1));
      const clamped = Math.max(0, Math.min(index, data.length - 1));
      const point = data[clamped];
      const p = points[clamped];
      setHoverPoint({
        x: p.x,
        y: p.y,
        value: point.value,
        label: point.label,
        year: point.year ?? 2025,
      });
    },
    [chartWidth, data, points]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverPoint(null);
  }, []);

  if (size.width === 0 || size.height === 0) {
    return <div className="balance-line-animation" ref={containerRef} style={{ minHeight: 280 }} />;
  }

  return (
    <div
      className="balance-line-animation"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="img"
      aria-label="Balance over time: hover to see values"
      data-hover={hoverPoint ? 'true' : undefined}
    >
      <svg width={size.width} height={size.height} className="balance-line-animation__svg">
        <defs>
          {/* Solid teal at bottom fading to transparent at top for depth */}
          <linearGradient id="balance-line-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0} />
            <stop offset="60%" stopColor="var(--accent)" stopOpacity={0.12} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.35} />
          </linearGradient>
          <filter id="balance-line-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.08" />
          </filter>
          <filter id="balance-dot-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Grid: horizontal + vertical, very faint */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={`h-${t}`}
            x1={PADDING.left}
            y1={PADDING.top + t * chartHeight}
            x2={PADDING.left + chartWidth}
            y2={PADDING.top + t * chartHeight}
            className="balance-line-animation__grid"
          />
        ))}
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={`v-${t}`}
            x1={PADDING.left + t * chartWidth}
            y1={PADDING.top}
            x2={PADDING.left + t * chartWidth}
            y2={PADDING.top + chartHeight}
            className="balance-line-animation__grid"
          />
        ))}
        {/* Area fill with subtle shadow/depth */}
        <path
          d={`${pathD} L ${points[points.length - 1].x} ${PADDING.top + chartHeight} L ${points[0].x} ${PADDING.top + chartHeight} Z`}
          fill="url(#balance-line-gradient)"
          className="balance-line-animation__area"
          filter="url(#balance-line-shadow)"
        />
        {/* The balance line (thicker, glow on hover via CSS) */}
        <path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLength}
          style={{ strokeDashoffset: pathLength }}
          className="balance-line-animation__line"
        />
        {/* Cursor vertical line */}
        {drawComplete && hoverPoint && (
          <line
            x1={hoverPoint.x}
            y1={PADDING.top}
            x2={hoverPoint.x}
            y2={PADDING.top + chartHeight}
            className="balance-line-animation__cursor"
            stroke="var(--accent)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
        )}
        {/* Starting point marker */}
        {drawComplete && points[0] && (
          <circle
            cx={points[0].x}
            cy={points[0].y}
            r={4}
            fill="var(--card-bg)"
            stroke="var(--accent)"
            strokeWidth={2}
            className="balance-line-animation__start-dot"
          />
        )}
        {/* Glowing dot that follows cursor (pulses on hover) */}
        {drawComplete && hoverPoint && (
          <g filter="url(#balance-dot-glow)" className="balance-line-animation__dot-wrap">
            <circle
              cx={hoverPoint.x}
              cy={hoverPoint.y}
              r={6}
              fill="var(--accent)"
              opacity={0.35}
              className="balance-line-animation__dot-glow"
            />
            <circle
              cx={hoverPoint.x}
              cy={hoverPoint.y}
              r={5}
              fill="var(--card-bg)"
              stroke="var(--accent)"
              strokeWidth={2.5}
              className="balance-line-animation__dot"
            />
          </g>
        )}
        {/* Y-axis labels ($) */}
        {yTicks.map((tick) => (
          <text
            key={tick.value}
            x={PADDING.left - 10}
            y={tick.y}
            textAnchor="end"
            dominantBaseline="middle"
            className="balance-line-animation__axis-label balance-line-animation__axis-label--y"
          >
            {tick.value >= 1000 ? `$${tick.value / 1000}k` : `$${tick.value}`}
          </text>
        ))}
        {/* X-axis labels (months) */}
        {data.map((d, i) => {
          const p = points[i];
          if (!p) return null;
          return (
            <text
              key={d.label}
              x={p.x}
              y={PADDING.top + chartHeight + 14}
              textAnchor="middle"
              className="balance-line-animation__axis-label balance-line-animation__axis-label--x"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
      {/* Tooltip: date + amount */}
      {hoverPoint && (
        <div
          className="balance-line-animation__tooltip"
          style={{
            left: Math.max(70, Math.min(hoverPoint.x, size.width - 70)),
            top: Math.min(hoverPoint.y + 22, size.height - 64),
          }}
        >
          <span className="balance-line-animation__tooltip-label">
            {hoverPoint.label} {hoverPoint.year}
          </span>
          <span className="balance-line-animation__tooltip-value">
            {formatCurrency(hoverPoint.value)}
          </span>
        </div>
      )}
    </div>
  );
}
