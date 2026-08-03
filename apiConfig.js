// Dynamic API & Socket URL Resolver for Local Dev & Vercel Production

export const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:5000';

  const { protocol, hostname, port } = window.location;

  // If running on Vercel or any HTTPS production domain
  if (protocol === 'https:' || (hostname !== 'localhost' && hostname !== '127.0.0.1' && !port)) {
    return window.location.origin;
  }

  // Local development
  return `http://${hostname}:5000`;
};
