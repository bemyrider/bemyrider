/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'supabase.co'],
  },
  // Riabilita l'icona flottante di Next.js in sviluppo
  devIndicators: {
    buildActivity: true,
  },
  // Escludi le Edge Functions dalla build Next.js
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  // Ignora i file Supabase durante la build
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
}

module.exports = nextConfig 