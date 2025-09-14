/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'uolpvxgcobjefivqnscj.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bemyrider.it',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.bemyrider.it',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Configurazioni di sicurezza per testing
  devIndicators: {
    buildActivity: true,
    appIsrStatus: false, // Disabilita per ridurre risorse
  },

  // Limite memoria per build
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: [],
  },

  // Escludi le Edge Functions dalla build Next.js
  webpack: config => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    // Ottimizzazioni per testing
    if (process.env.NODE_ENV === 'test') {
      config.optimization = {
        ...config.optimization,
        minimize: false, // Disabilita minimizzazione in test
      };
    }

    return config;
  },

  // Ignora i file Supabase durante la build
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
};

module.exports = nextConfig;
