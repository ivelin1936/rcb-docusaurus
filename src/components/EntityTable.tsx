import React from 'react';

/**
 * Describes a single field/column of a domain entity for documentation.
 */
export interface EntityField {
  /** Java field name or column name */
  name: string;
  /** Java type or SQL type (e.g. "UUID", "String", "TIMESTAMP WITH TIME ZONE") */
  type: string;
  /** Whether the field is required (NOT NULL) */
  required: boolean;
  /** Human-readable description */
  description: string;
  /** Example value (optional) */
  example?: string;
}

interface EntityTableProps {
  /** Entity class name (e.g. "EventEntity") */
  entityName: string;
  /** Array of field descriptors */
  fields: EntityField[];
  /** Optional notes shown below the table */
  notes?: string;
}

const TABLE_STYLE: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.9rem',
};

const TH_STYLE: React.CSSProperties = {
  padding: '8px 12px',
  textAlign: 'left',
  borderBottom: '2px solid var(--ifm-color-primary, #fcd434)',
  backgroundColor: 'var(--ifm-background-surface-color, #f8f9fa)',
  fontWeight: 600,
};

const TD_STYLE: React.CSSProperties = {
  padding: '7px 12px',
  borderBottom: '1px solid var(--ifm-toc-border-color, #e2e8f0)',
  verticalAlign: 'top',
};

const CODE_STYLE: React.CSSProperties = {
  fontFamily: 'var(--ifm-font-family-monospace)',
  fontSize: '0.85em',
  backgroundColor: 'var(--ifm-code-background, #f0f0f0)',
  padding: '1px 4px',
  borderRadius: '3px',
};

/**
 * Renders a domain entity's fields as a structured documentation table.
 * Useful for API reference pages and schema documentation.
 *
 * @example
 * ```mdx
 * import { EntityTable } from '@site/src/components';
 *
 * <EntityTable
 *   entityName="EventEntity"
 *   fields={[
 *     { name: 'id', type: 'UUID', required: true, description: 'Primary key — generated UUID', example: '550e8400-e29b-41d4-a716-446655440000' },
 *     { name: 'title', type: 'String', required: true, description: 'Event title (max 255 chars)', example: 'Spring Track Day 2026' },
 *     { name: 'startDate', type: 'ZonedDateTime', required: true, description: 'Event start — stored as TIMESTAMP WITH TIME ZONE' },
 *     { name: 'deletedAt', type: 'ZonedDateTime', required: false, description: 'Soft-delete timestamp; NULL = active' },
 *   ]}
 *   notes="All timestamps are stored in UTC. createdAt / updatedAt / createdBy / updatedBy omitted for brevity."
 * />
 * ```
 */
export function EntityTable({ entityName, fields, notes }: EntityTableProps): React.ReactElement {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <table style={TABLE_STYLE}>
        <caption
          style={{
            captionSide: 'top',
            textAlign: 'left',
            padding: '0 0 6px 0',
            fontWeight: 700,
            fontSize: '0.95rem',
          }}
        >
          <code style={{ ...CODE_STYLE, fontSize: '0.9em' }}>{entityName}</code>
        </caption>
        <thead>
          <tr>
            <th style={TH_STYLE}>Field</th>
            <th style={TH_STYLE}>Type</th>
            <th style={TH_STYLE}>Required</th>
            <th style={TH_STYLE}>Description</th>
            <th style={TH_STYLE}>Example</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field.name}>
              <td style={TD_STYLE}>
                <code style={CODE_STYLE}>{field.name}</code>
              </td>
              <td style={TD_STYLE}>
                <code style={CODE_STYLE}>{field.type}</code>
              </td>
              <td style={{ ...TD_STYLE, textAlign: 'center' }}>
                {field.required ? '✅' : '—'}
              </td>
              <td style={TD_STYLE}>{field.description}</td>
              <td style={TD_STYLE}>
                {field.example != null ? (
                  <code style={CODE_STYLE}>{field.example}</code>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {notes != null && (
        <p
          style={{
            fontSize: '0.82rem',
            color: 'var(--ifm-font-color-secondary, #555)',
            marginTop: '6px',
          }}
        >
          {notes}
        </p>
      )}
    </div>
  );
}
