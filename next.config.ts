import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts : Next.js inline + Remotion
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Styles : Tailwind inline + Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Images : données inline + OSM tiles + Supabase Storage
              "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://staticmap.openstreetmap.de https://*.supabase.co",
              // Iframes : OpenStreetMap embed
              "frame-src 'self' https://www.openstreetmap.org",
              // Fetch/XHR : Supabase, Resend (serveur), API adresse gouv, Nominatim, OSM
              [
                "connect-src 'self'",
                "https://*.supabase.co",
                "wss://*.supabase.co",
                "https://api-adresse.data.gouv.fr",
                "https://nominatim.openstreetmap.org",
                "https://fonts.googleapis.com",
              ].join(" "),
              // Workers pour Remotion
              "worker-src 'self' blob:",
              "media-src 'self' blob:",
            ].join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
