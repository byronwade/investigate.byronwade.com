/** @type {import('next').NextConfig} */
const nextConfig = {
	serverExternalPackages: ["sharp"],
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "*.supabase.co",
				port: "",
				pathname: "/storage/v1/object/public/**",
			},
		],
	},
	// Enable file tracing for large responses
	outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;
