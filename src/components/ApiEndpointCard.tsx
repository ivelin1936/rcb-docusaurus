import React from 'react';

/** HTTP methods supported by the API */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiEndpointCardProps {
  /** HTTP method */
  method: HttpMethod;
  /** URL path (e.g. "/api/v1/events/{id}") */
  path: string;
  /** Short description of what the endpoint does */
  description: string;
  /** Required role(s) for access (e.g. "USER", "ADMIN", "Public") */
  auth?: string;
  /** Whether the endpoint is stable, beta, or deprecated */
  stability?: 'stable' | 'beta' | 'deprecated';
  /** Link to the full OpenAPI spec or detailed docs */
  docsUrl?: string;
}

const METHOD_COLORS: Record<HttpMethod, { bg: string; color: string }> = {
  GET:    { bg: '#22c55e', color: '#fff' },
  POST:   { bg: '#3b82f6', color: '#fff' },
  PUT:    { bg: '#f59e0b', color: '#fff' },
  PATCH:  { bg: '#8b5cf6', color: '#fff' },
  DELETE: { bg: '#ef4444', color: '#fff' },
};

const STABILITY_LABELS: Record<NonNullable<ApiEndpointCardProps['stability']>, { label: string; color: string }> = {
  stable:     { label: 'Stable',     color: '#22c55e' },
  beta:       { label: 'Beta',       color: '#f59e0b' },
  deprecated: { label: 'Deprecated', color: '#9ca3af' },
};

const CARD_STYLE: React.CSSProperties = {
  border: '1px solid var(--ifm-toc-border-color, #e2e8f0)',
  borderRadius: '8px',
  padding: '12px 16px',
  marginBottom: '12px',
  backgroundColor: 'var(--ifm-background-surface-color, #f8f9fa)',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const METHOD_BADGE_STYLE = (method: HttpMethod): React.CSSProperties => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '4px',
  fontFamily: 'var(--ifm-font-family-monospace)',
  fontSize: '0.8rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  ...METHOD_COLORS[method],
});

const PATH_STYLE: React.CSSProperties = {
  fontFamily: 'var(--ifm-font-family-monospace)',
  fontSize: '0.92rem',
  fontWeight: 600,
  color: 'var(--ifm-font-color-base)',
};

/**
 * Renders an OpenAPI endpoint summary card showing method, path, description, auth, and stability.
 * Useful in API reference guides to give quick at-a-glance endpoint summaries.
 *
 * @example
 * ```mdx
 * import { ApiEndpointCard } from '@site/src/components';
 *
 * <ApiEndpointCard
 *   method="GET"
 *   path="/api/v1/events"
 *   description="List all upcoming events. Supports pagination and filtering by date range."
 *   auth="Public"
 *   stability="stable"
 * />
 *
 * <ApiEndpointCard
 *   method="POST"
 *   path="/api/v1/events"
 *   description="Create a new event. Only club admins can create events."
 *   auth="ADMIN"
 *   stability="stable"
 * />
 *
 * <ApiEndpointCard
 *   method="DELETE"
 *   path="/api/v1/events/{id}"
 *   description="Soft-delete an event. Sets deletedAt timestamp; does not remove from DB."
 *   auth="ADMIN"
 *   stability="beta"
 * />
 * ```
 */
export function ApiEndpointCard({
  method,
  path,
  description,
  auth,
  stability = 'stable',
  docsUrl,
}: ApiEndpointCardProps): React.ReactElement {
  const stabilityInfo = STABILITY_LABELS[stability];

  return (
    <div style={CARD_STYLE}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={METHOD_BADGE_STYLE(method)}>{method}</span>
        <span style={PATH_STYLE}>{path}</span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: stabilityInfo.color,
          }}
        >
          {stabilityInfo.label}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--ifm-font-color-base)' }}>
        {description}
      </p>
      <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--ifm-font-color-secondary, #555)' }}>
        {auth != null && (
          <span>
            🔒 <strong>Auth:</strong> {auth}
          </span>
        )}
        {docsUrl != null && (
          <a href={docsUrl} style={{ color: 'var(--ifm-color-primary)' }}>
            Full docs →
          </a>
        )}
      </div>
    </div>
  );
}
