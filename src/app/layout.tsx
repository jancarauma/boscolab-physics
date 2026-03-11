import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BoscoLab — Simulador de Equações Diferenciais',
  description: 'Simule e visualize equações diferenciais em tempo real. Pêndulos, órbitas, circuitos, atratores e muito mais.',
  keywords: ['simulação', 'equações diferenciais', 'física', 'modelagem', 'ODE'],
  authors: [{ name: 'Seu Nome' }],
  icons: {
    icon: '/favicon.ico',       
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',         // se tiver um apple-touch-icon.png, trocar aqui
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}