// Set REACT_APP_DEMO=true in your .env to enable offline/demo mode.
// By default the app connects to the backend API.
export function isFrontendOnly() {
  const envVal = process.env.REACT_APP_DEMO;
  if (envVal !== undefined && envVal !== null && String(envVal).trim() !== '') {
    return String(envVal).toLowerCase() === 'true';
  }
  return false;
}

export const isDemoMode = isFrontendOnly;
