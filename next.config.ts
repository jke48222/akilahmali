import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // the retired vinyl-loop easter egg → the single's release stub
      {
        source: "/music/who-really-won/turntable",
        destination: "/music/tower-of-roses",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
