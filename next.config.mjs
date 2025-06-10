/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://trusted-site.com;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https:;
              connect-src 'self' ${isDev ? 'http://localhost:* http://127.0.0.1:*' : 'https://your-production-api.com'};
            `.replace(/\s{2,}/g, ' ').trim()
          },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};

export default nextConfig;