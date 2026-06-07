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

/**
 * Open/close state for the Cmd/Ctrl+K search dialog. Shared so the global
 * keyboard shortcut (in `AppShell`) and the header trigger button drive the same
 * dialog.
 */
interface SearchUiState {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

export const useSearchUiStore = create<SearchUiState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}))

interface SidebarUiState {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

export const useSidebarUiStore = create<SidebarUiState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}))
