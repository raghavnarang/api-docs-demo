import type { EndpointUsage } from '../../../lib/data/types'
import { MethodBadge } from '../../../components/MethodBadge'

const numberFmt = new Intl.NumberFormat('en-US')

/** Per-endpoint breakdown table (§2.5). */
export function EndpointBreakdownTable({
  endpoints,
}: {
  endpoints: EndpointUsage[]
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-lg text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-2">Endpoint</th>
            <th className="px-4 py-2 text-right">Calls</th>
            <th className="px-4 py-2 text-right">Error rate</th>
            <th className="px-4 py-2 text-right">Avg latency</th>
          </tr>
        </thead>
        <tbody>
          {endpoints.map((ep) => (
            <tr
              key={`${ep.method} ${ep.path}`}
              className="border-b border-slate-100 last:border-0"
            >
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <MethodBadge method={ep.method} />
                  <span className="font-mono text-xs text-slate-700">
                    {ep.path}
                  </span>
                </div>
              </td>
              <td className="px-4 py-2 text-right tabular-nums text-slate-700">
                {numberFmt.format(ep.calls)}
              </td>
              <td className="px-4 py-2 text-right tabular-nums text-slate-700">
                {(ep.errorRate * 100).toFixed(2)}%
              </td>
              <td className="px-4 py-2 text-right tabular-nums text-slate-700">
                {ep.avgLatencyMs} ms
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
