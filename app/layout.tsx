import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
const sans = localFont({ src: [
  { path: '../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2', weight: '400' },
  { path: '../node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2', weight: '500' },
  { path: '../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2', weight: '600' },
], variable: '--font-inter', display: 'swap' });
const mono = localFont({ src: '../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2', variable: '--font-jetbrains-mono', display: 'swap' });
export const metadata: Metadata = { title: 'SeeYesYes — Shared decisions', description: 'A design system that humans and AI can understand.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${sans.variable} ${mono.variable}`}><body>{children}</body></html>;
}
