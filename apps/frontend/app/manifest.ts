import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kir-Dev Sprint Review',
    short_name: 'Sprint Review',
    description: 'Sprint Review application for Kir-Dev',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/Kir-Dev-Black.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/Kir-Dev-Black.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
