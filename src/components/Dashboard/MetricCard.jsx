// MetricCard redesign per MOEYS spec
import React from 'react';

import { HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineChevronRight } from 'react-icons/hi';


/**
 * MetricCard component.
 * Props:
 *   label: string – metric label
 *   value: number | string – KPI value
 *   trend: string – e.g. "+12.45% vs last term"
 *   trendDirection: 'up' | 'down' | 'neutral' (optional)
 *   unit: string – optional unit suffix (unused in UI, kept for extensibility)
 *   subject: string – key to select left border color (e.g., 'enrollment', 'math', ...)
 *   timestamp: string – timestamp text (e.g., "Real-time")
 *   icon: React component – optional decorative icon
 */
export default function MetricCard({
  label,
  value,
  trend,
  trendDirection,
  unit = '',
  subject = 'enrollment',
  timestamp = 'Real-time',
  icon: Icon,
}) {
  const hasPositive = trend && trend.includes('+');
  const hasNegative = trend && trend.includes('-');
  const direction = trendDirection || (hasPositive ? 'up' : hasNegative ? 'down' : 'neutral');
  const ArrowIcon = direction === 'up' ? HiOutlineTrendingUp : direction === 'down' ? HiOutlineTrendingDown : HiOutlineChevronRight;
  const arrowClass = `metric-card__trend--${direction}`;

  return (
    <article className={`metric-card metric-card--${subject}`}>
      <header className="metric-card__header">
        <span className="metric-card__label">{label}</span>
        <span className="metric-card__timestamp">{timestamp}</span>
      </header>
      <div className="metric-card__value" aria-label="metric value">{value}</div>
      <footer className="metric-card__footer">
        <div className={`metric-card__trend ${arrowClass}`}>
          <ArrowIcon className="metric-card__trend-icon" />
          <span>{trend}</span>
        </div>
        {Icon && <Icon className="metric-card__icon" aria-hidden="true" />}
      </footer>
    </article>
  );
}
