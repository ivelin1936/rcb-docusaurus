import React from 'react';

/**
 * Status values for ADRs, stories, and tasks.
 * Used as colored inline badges in MDX documentation pages.
 */
export type StatusValue =
  | 'Proposed'
  | 'Accepted'
  | 'Deprecated'
  | 'Superseded'
  | 'Pending'
  | 'In Progress'
  | 'Completed'
  | 'Rejected'
  | 'Deferred';

interface StatusBadgeProps {
  /** The status to display */
  status: StatusValue;
  /** Optional custom label override (defaults to status value) */
  label?: string;
}

const STATUS_STYLES: Record<StatusValue, React.CSSProperties> = {
  Proposed:    { backgroundColor: '#f97316', color: '#fff' },
  Accepted:    { backgroundColor: '#22c55e', color: '#fff' },
  Deprecated:  { backgroundColor: '#9ca3af', color: '#fff' },
  Superseded:  { backgroundColor: '#3b82f6', color: '#fff' },
  Pending:     { backgroundColor: '#f59e0b', color: '#fff' },
  'In Progress': { backgroundColor: '#8b5cf6', color: '#fff' },
  Completed:   { backgroundColor: '#22c55e', color: '#fff' },
  Rejected:    { backgroundColor: '#ef4444', color: '#fff' },
  Deferred:    { backgroundColor: '#6b7280', color: '#fff' },
};

const BASE_STYLE: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: '12px',
  fontSize: '0.78rem',
  fontWeight: 600,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  verticalAlign: 'middle',
};

/**
 * Renders an ADR or story status as a colored inline badge.
 *
 * @example
 * ```mdx
 * import { StatusBadge } from '@site/src/components';
 *
 * **Status:** <StatusBadge status="Accepted" />
 * **Status:** <StatusBadge status="Proposed" />
 * **Status:** <StatusBadge status="Superseded" label="Superseded by ADR-009" />
 * ```
 */
export function StatusBadge({ status, label }: StatusBadgeProps): React.ReactElement {
  const style: React.CSSProperties = {
    ...BASE_STYLE,
    ...(STATUS_STYLES[status] ?? { backgroundColor: '#6b7280', color: '#fff' }),
  };

  return <span style={style}>{label ?? status}</span>;
}
