import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { localAdapter } from '@/lib/data/adapter';
import { ThemeLifecycleProvider } from '@/components/theme/ThemeLifecycleProvider';
import { buildThemeBootstrapScript } from '@/lib/theme/persistence';
const sans = localFont({ src: [
  { path: '../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2', weight: '400' },
  { path: '../node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2', weight: '500' },
  { path: '../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2', weight: '600' },
], variable: '--font-inter', display: 'swap' });
const mono = localFont({ src: '../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2', variable: '--font-jetbrains-mono', display: 'swap' });
export const metadata: Metadata = { title: 'SeeYesYes — Shared decisions', description: 'A design system that humans and AI can understand.' };
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const system = await localAdapter.get('registry');
  return <html suppressHydrationWarning lang="en" className={`${sans.variable} ${mono.variable}`}><head><script dangerouslySetInnerHTML={{ __html: buildThemeBootstrapScript() }} /></head><body><ThemeLifecycleProvider system={system}>{children}</ThemeLifecycleProvider></body></html>;
}
