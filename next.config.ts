import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placekitten.com",
      },
      {
        protocol: "https",
        hostname: "placedog.net",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();


export default withNextIntl(nextConfig);
