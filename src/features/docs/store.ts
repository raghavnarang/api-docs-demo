import { create } from 'zustand'

/**
 * Shared docs UI state. The scroll-spy lives in `ApiDocsPage` (co-located with the
 * endpoint sections it observes, so there's no cross-component DOM-readiness race);
 * it publishes the active endpoint id here and the `Sidebar` TOC reads it.
 */
interface DocsUiState {
  activeEndpointId: string | null
  setActiveEndpointId: (id: string | null) => void
}

export const useDocsUiStore = create<DocsUiState>((set) => ({
  activeEndpointId: null,
  setActiveEndpointId: (id) => set({ activeEndpointId: id }),
}))
