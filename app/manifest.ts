import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pure Physique",
    short_name: "Pure Physique",
    description: "Mobile-first fitness and nutrition coaching check-ins for coaches and clients.",
    start_url: "/",
    display: "standalone",
    background_color: "#181818",
    theme_color: "#181818",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
