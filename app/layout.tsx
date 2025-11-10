import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'BiblioMail System - Gestión de Biblioteca por Email',
  description: 'Sistema inteligente de gestión de biblioteca mediante correo electrónico usando IA',
  keywords: 'biblioteca, email, IA, LLM, FastAPI, automatización',
  authors: [{ name: 'Tu Nombre' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}