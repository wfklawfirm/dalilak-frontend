/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  poweredByHeader: false,

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com',
  },
<<<<<<< HEAD

=======
>>>>>>> 9d5d5f8 (fix: security headers, vercel config, lint scripts, env example)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
<<<<<<< HEAD
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
=======
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
>>>>>>> 9d5d5f8 (fix: security headers, vercel config, lint scripts, env example)
        ],
      },
    ]
  },
<<<<<<< HEAD
=======
  images: {
    formats: ['image/webp'],
  },
>>>>>>> 9d5d5f8 (fix: security headers, vercel config, lint scripts, env example)
}

module.exports = nextConfig
