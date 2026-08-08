/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    const apiURL = process.env.NEXT_PUBLIC_PROD_API_URL || '';
    const isLocalApi = apiURL.includes('localhost') || apiURL.includes('127.0.0.1');
    const connectSrc = `connect-src 'self' https://api-security.nexcorealliance.com/ https://accounts.google.com https://*.razorpay.com ${
      (isDev || isLocalApi) ? 'http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*' : ''
    }`;

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://trusted-site.com https://accounts.google.com https://*.razorpay.com;
              style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://accounts.google.com https://*.razorpay.com;
              img-src 'self' data: https: blob: https://lh3.googleusercontent.com;
              frame-src 'self' https://accounts.google.com https://*.razorpay.com;
              ${connectSrc};
            `.replace(/\s{2,}/g, ' ').trim()
          },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { 
            key: 'Cross-Origin-Opener-Policy', 
            value: 'unsafe-none' 
          },
          { 
            key: 'Cross-Origin-Embedder-Policy', 
            value: 'unsafe-none'
          },
          {
            key: 'Permissions-Policy',
            value: 'accelerometer=(self "https://api.razorpay.com" "https://checkout.razorpay.com"), gyroscope=(self "https://api.razorpay.com" "https://checkout.razorpay.com")'
          }
        ],
      },
      {
        source: '/gain-access',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      {
        source: '/login',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
