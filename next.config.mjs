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
              style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
              img-src 'self' data: https: blob:;
              connect-src 'self 'https://zypher-api.code4bharat.com';
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
