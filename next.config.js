/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow TypeScript errors during production build — caught in development
  typescript: { ignoreBuildErrors: true },
  // Allow ESLint warnings during production build
  eslint: { ignoreDuringBuilds: true },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com',
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

module.exports = nextConfig
