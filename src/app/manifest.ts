import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Naydira",
    short_name: "Naydira",
    description: "Manage your financial transactions",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/icons/naydira-logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/naydira-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
