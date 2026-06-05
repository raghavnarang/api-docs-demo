import '@testing-library/jest-dom'

// jsdom doesn't implement scrollTo; TanStack Router's scroll restoration calls
// it. Stub to keep test output clean.
window.scrollTo = () => {}
