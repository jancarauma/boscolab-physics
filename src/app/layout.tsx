import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  applicationName: 'BoscoLab',
  title: 'BoscoLab — Simulador de Física Interativo',
  description: 'Simule e visualize experimentos de física em tempo real. Bolas, pêndulos, órbitas planetárias, campos vetoriais e muito mais.',
  manifest: '/manifest.webmanifest',
  keywords: ['modellus', 'física', 'simulação', 'equações diferenciais', 'caraumã', 'modelagem', 'ODE'],
  authors: [{ name: 'J. Caraumã' }],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    title: 'BoscoLab',
    statusBarStyle: 'default',
  },
  openGraph: {
    title: 'BoscoLab',
    description: 'Simulador interativo de equações diferenciais',
    url: 'https://boscolab-physics.vercel.app',
    siteName: 'BoscoLab',
    locale: 'pt_BR',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b0f17',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
      <Script src="https://unpkg.com/mathlive@0.99.3/dist/mathlive.min.js" strategy="afterInteractive" />
    </html>
  );
}