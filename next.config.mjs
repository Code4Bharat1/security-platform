/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    const apiURL = process.env.NEXT_PUBLIC_PROD_API_URL || '';
    const isLocalApi = apiURL.includes('localhost') || apiURL.includes('127.0.0.1');
    const connectSrc = `connect-src 'self' https://security-platform-api.code4bharat.com ${
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
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://trusted-site.com;
              style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
              img-src 'self' data: https: blob:;
              ${connectSrc};
            `.replace(/\s{2,}/g, ' ').trim()
          },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
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
