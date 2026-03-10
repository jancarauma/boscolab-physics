import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'BOSCOLAB',
  description: 'Simulador de Física Computacional Interativo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <script defer src="https://unpkg.com/mathlive@0.99.0/dist/mathlive.min.js"></script>
      </head>
      <body>
        {children}
        <Script src="/boscolab-app.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
