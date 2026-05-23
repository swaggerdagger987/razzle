/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@razzle/ui", "@razzle/types", "@razzle/panels", "@razzle/agents", "@razzle/hallway"],
  async redirects() {
    return [
      { source: "/bureau", destination: "/league", permanent: true },
      { source: "/bureau/:league", destination: "/league/:league", permanent: true },
      { source: "/bureau/:league/:feature", destination: "/league/:league/:feature", permanent: true },
      { source: "/league/:id/self-scout", destination: "/league/:id", permanent: true },
    ];
  },
  async rewrites() {
    const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:8000";
    return [{ source: "/api/:path*", destination: `${apiOrigin}/api/:path*` }];
  },
  typedRoutes: true,
};

export default nextConfig;
