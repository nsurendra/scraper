/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  api: {
    responseLimit: '10mb',
    bodyParser: { sizeLimit: '2mb' }
  }
}
module.exports = nextConfig
