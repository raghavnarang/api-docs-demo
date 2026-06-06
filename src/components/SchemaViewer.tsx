import type { SchemaNode } from '../lib/spec-parser'

/**
 * Recursively renders a parsed `SchemaNode` as a docs field tree:
 * object property rows (name · type · required · rules · description), array
 * items, `oneOf`/`anyOf` variant blocks, free-form maps, readOnly/writeOnly tags,
 * and the cut-cycle marker. Pure presentation — all resolution happens in the parser.
 */

/** Short human type label for a node. */
function typeLabel(node: SchemaNode): string {
  if (node.composition) return node.composition
  if (node.type === 'array') {
    const inner = node.items ? typeLabel(node.items) : 'any'
    return `array<${inner}>`
  }
  if (node.additionalProperties) {
    const v = node.additionalProperties
    const hasShape = v.type || v.properties || v.composition
    return `map<string, ${hasShape ? typeLabel(v) : 'any'}>`
  }
  let t = node.type ?? (node.properties ? 'object' : 'any')
  if (node.format) t += ` <${node.format}>`
  if (node.enum) t = node.type ?? 'enum'
  return t
}

/** Collects validation constraints into short chips for the "rules" cell. */
function rules(node: SchemaNode): string[] {
  const out: string[] = []
  if (node.enum) out.push(`enum: ${node.enum.join(' | ')}`)
  if (node.minimum !== undefined) out.push(`≥ ${node.minimum}`)
  if (node.maximum !== undefined) out.push(`≤ ${node.maximum}`)
  if (typeof node.exclusiveMinimum === 'number')
    out.push(`> ${node.exclusiveMinimum}`)
  if (typeof node.exclusiveMaximum === 'number')
    out.push(`< ${node.exclusiveMaximum}`)
  if (node.multipleOf !== undefined) out.push(`multiple of ${node.multipleOf}`)
  if (node.minLength !== undefined || node.maxLength !== undefined)
    out.push(`length ${node.minLength ?? 0}…${node.maxLength ?? '∞'}`)
  if (node.minItems !== undefined || node.maxItems !== undefined)
    out.push(`items ${node.minItems ?? 0}…${node.maxItems ?? '∞'}`)
  if (node.uniqueItems) out.push('unique')
  if (node.pattern) out.push(`pattern: ${node.pattern}`)
  if (node.default !== undefined)
    out.push(`default: ${JSON.stringify(node.default)}`)
  return out
}

/** A node worth expanding inline (has its own nested fields). */
function isExpandable(node: SchemaNode): boolean {
  if (node.circular) return false
  if (node.composition) return true
  if (node.properties?.length) return true
  if (node.type === 'array' && node.items) return isExpandable(node.items)
  if (node.additionalProperties) return isExpandable(node.additionalProperties)
  return false
}

function Tag({ children, tone }: { children: string; tone: 'red' | 'slate' }) {
  const cls = tone === 'red' ? 'text-red-600' : 'text-slate-400'
  return <span className={`text-[11px] font-medium ${cls}`}>{children}</span>
}

function Rules({ node }: { node: SchemaNode }) {
  const items = rules(node)
  if (items.length === 0) return null
  return (
    <div className="mt-0.5 flex flex-wrap gap-1">
      {items.map((r, i) => (
        <span
          key={i}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-500"
        >
          {r}
        </span>
      ))}
    </div>
  )
}

/** The schema a row should expand into (unwraps arrays to their item schema). */
function expandTarget(node: SchemaNode): SchemaNode | undefined {
  if (node.composition) return node
  if (node.properties?.length) return node
  if (node.type === 'array' && node.items && isExpandable(node.items))
    return node.items
  if (node.additionalProperties && isExpandable(node.additionalProperties))
    return node.additionalProperties
  return undefined
}

function PropertyRows({ node }: { node: SchemaNode }) {
  return (
    <ul className="divide-y divide-slate-100">
      {node.properties?.map(({ name, schema }) => {
        const child = expandTarget(schema)
        return (
          <li key={name} className="py-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <code className="font-mono text-sm text-slate-800">{name}</code>
              <span className="font-mono text-xs text-slate-500">
                {typeLabel(schema)}
              </span>
              {schema.required ? <Tag tone="red">required</Tag> : null}
              {schema.readOnly ? <Tag tone="slate">read-only</Tag> : null}
              {schema.writeOnly ? <Tag tone="slate">write-only</Tag> : null}
            </div>
            {schema.description ? (
              <p className="mt-0.5 text-sm text-slate-600">
                {schema.description}
              </p>
            ) : null}
            <Rules node={schema} />
            {child ? (
              <div className="mt-2 border-l-2 border-slate-200 pl-3">
                <SchemaViewer node={child} />
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

export function SchemaViewer({ node }: { node: SchemaNode }) {
  if (node.circular) {
    return (
      <p className="font-mono text-xs text-slate-400">↻ circular reference</p>
    )
  }

  // oneOf / anyOf union
  if (node.composition && node.variants) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500">
          {node.composition === 'oneOf' ? 'One of' : 'Any of'}
          {node.discriminator ? ` (by ${node.discriminator})` : ''}:
        </p>
        {node.variants.map((variant, i) => (
          <div key={i} className="rounded-md border border-slate-200 p-3">
            <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">
              Option {i + 1}
            </p>
            <SchemaViewer node={variant} />
          </div>
        ))}
      </div>
    )
  }

  // object
  if (node.properties?.length) return <PropertyRows node={node} />

  // array of expandable items
  if (node.type === 'array' && node.items && isExpandable(node.items)) {
    return (
      <div>
        <p className="mb-1 text-xs font-medium text-slate-500">Array of:</p>
        <SchemaViewer node={node.items} />
      </div>
    )
  }

  // free-form map
  if (node.additionalProperties && isExpandable(node.additionalProperties)) {
    return (
      <div>
        <p className="mb-1 text-xs font-medium text-slate-500">Map values:</p>
        <SchemaViewer node={node.additionalProperties} />
      </div>
    )
  }

  // leaf (scalar / empty)
  return (
    <div>
      <span className="font-mono text-xs text-slate-500">
        {typeLabel(node)}
      </span>
      {node.description ? (
        <p className="mt-0.5 text-sm text-slate-600">{node.description}</p>
      ) : null}
      <Rules node={node} />
    </div>
  )
}
