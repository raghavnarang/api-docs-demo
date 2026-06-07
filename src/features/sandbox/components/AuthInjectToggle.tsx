/**
 * Toggle for auto-injecting the session token as `Authorization: Bearer <token>`
 * into the sandbox request (§2.3). Disabled and explained when logged out.
 */
export function AuthInjectToggle({
  checked,
  onChange,
  isLoggedIn,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  isLoggedIn: boolean
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked && isLoggedIn}
        disabled={!isLoggedIn}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 disabled:opacity-50"
      />
      <span className={isLoggedIn ? '' : 'text-slate-400'}>
        Inject auth token
        {!isLoggedIn ? (
          <span className="ml-1 text-xs">(sign in to enable)</span>
        ) : null}
      </span>
    </label>
  )
}
