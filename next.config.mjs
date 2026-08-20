/** @type {import('next').NextConfig} */
const nextConfig = {
  // lib/letterboxd.ts reads diary.csv from a path resolved at runtime
  // (it searches data/ for the file), so file tracing can't discover it
  // statically — include the whole data/ folder explicitly instead.
  outputFileTracingIncludes: {
    "/": ["./data/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
};

export default nextConfig;
