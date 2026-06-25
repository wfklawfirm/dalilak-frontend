/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com',
  },
}

module.exports = nextConfig
