import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IFMS Inventário",
    short_name: "Inventário",
    description: "Sistema de Gestão de Inventário do IFMS",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#00693E",
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/logotipo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    orientation: "portrait",
    scope: "/",
    prefer_related_applications: false,
  };
}
