/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['ucarecdn.com']
    },
    // telas antigas que dependiam da API do Silvio: levam para a home até serem refeitas com o Supabase
    async redirects() {
      return [
        { source: '/classico', destination: '/', permanent: false },
        { source: '/tag/:slug*', destination: '/', permanent: false },
      ];
    }
  };
  
  module.exports = nextConfig;