/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '1000mb'
    },
  },
  // Increase the maximum allowed size for API routes
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
}

module.exports = nextConfig 