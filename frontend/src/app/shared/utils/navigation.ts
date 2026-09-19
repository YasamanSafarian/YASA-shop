/** Returns an in-app path only; rejects protocol-relative and external URLs. */
export function safeInternalRedirect(
  redirect: string | null | undefined,
  fallback = '/',
): string {
  if (!redirect) {
    return fallback;
  }
  if (!redirect.startsWith('/') || redirect.startsWith('//')) {
    return fallback;
  }
  return redirect;
}
