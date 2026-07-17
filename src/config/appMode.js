export function isFrontendOnly() {
  return String(process.env.REACT_APP_DEMO).toLowerCase() === 'true';
}

export const isDemoMode = isFrontendOnly;
