import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.anichin.moe',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'anichin.moe',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.nimegami.id',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nimegami.id',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'movieku.rest',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'filegoat.s3.de.io.cloud.ovh.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
