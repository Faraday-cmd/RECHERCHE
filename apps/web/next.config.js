/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@recherche/shared'],
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
  },
};

module.exports = nextConfig;
