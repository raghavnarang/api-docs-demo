import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useApiDocs } from '../hooks/use-catalog'
import { QueryBoundary } from '../../../components/QueryBoundary'

/**
 * Getting Started guide for an API, rendered from its Markdown file (loaded via
 * the DAL `getDocs`). GitHub-flavoured Markdown (tables, fenced code) through
 * react-markdown + remark-gfm; styled with the Tailwind typography plugin.
 */
export function GettingStarted({ apiId }: { apiId: string }) {
  const docs = useApiDocs(apiId)

  // No guide for this API → omit the section entirely (keeps the TOC honest).
  if (docs.isSuccess && !docs.data) return null

  return (
    <section id="getting-started" className="scroll-mt-20 py-8">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Getting Started
      </h2>
      <QueryBoundary query={docs}>
        {(markdown) => (
          <div className="prose prose-slate prose-sm max-w-none prose-pre:bg-slate-900 prose-pre:text-slate-100">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </div>
        )}
      </QueryBoundary>
    </section>
  )
}
