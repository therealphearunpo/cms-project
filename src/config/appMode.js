export function isFrontendOnly() {
  const envVal = process.env.REACT_APP_DEMO;
  if (envVal !== undefined && envVal !== null && String(envVal).trim() !== '') {
    return String(envVal).toLowerCase() === 'true';
  }
  return true;
}

export const isDemoMode = isFrontendOnly;
