/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jqxnwscwjaxzdawmmylk.supabase.co",
        pathname: "/storage/v1/object/public/**"
      }
    ]
  }
};

module.exports = nextConfig;
