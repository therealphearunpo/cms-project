export function isFrontendOnly() {
  const demoFlag = String(process.env.REACT_APP_DEMO ?? '').trim().toLowerCase();
  if (demoFlag === 'true') {
    return true;
  }

  if (demoFlag === 'false') {
    return false;
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return false;
    }
  }

  return !String(process.env.REACT_APP_API_URL ?? '').trim();
}

export const isDemoMode = isFrontendOnly;
