/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '**',
            },
        ],
    },
    // the admin used to live at /seller; keep old links and bookmarks working
    async redirects() {
        return [
            { source: '/seller', destination: '/admin', permanent: true },
            { source: '/seller/:path*', destination: '/admin/:path*', permanent: true },
        ];
    },
};

export default nextConfig;
