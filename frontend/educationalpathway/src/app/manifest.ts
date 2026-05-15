import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Path Finder",
    short_name: "Path Finder",
    description: "Your journey to academic success starts here.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/pathfinder.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pathfinder.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/pathfinder.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
