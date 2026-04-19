const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function getBackendOrigin() {
  // Absolute API URL: e.g. http://localhost:5000/api
  if (/^https?:\/\//i.test(API_BASE_URL)) {
    try {
      const parsed = new URL(API_BASE_URL);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      return 'http://localhost:5000';
    }
  }

  // Relative API URL: e.g. /api (same-origin deployment)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return 'http://localhost:5000';
}

export default function getImageUrl(imagePath) {
  if (!imagePath) return null;

  // Keep absolute URLs untouched.
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${getBackendOrigin()}${normalizedPath}`;
}
