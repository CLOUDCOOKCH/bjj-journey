/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.NEXT_STANDALONE === "1" ? { output: "standalone" } : {}),
  images: {
    unoptimized: true,
  },
}

export default nextConfig
