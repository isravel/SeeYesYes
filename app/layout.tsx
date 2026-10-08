import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { localAdapter } from '@/lib/data/adapter';
import { ThemeScope } from '@/components/theme/ThemeScope';
const sans = localFont({ src: [
  { path: '../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2', weight: '400' },
  { path: '../node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2', weight: '500' },
  { path: '../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2', weight: '600' },
], variable: '--font-inter', display: 'swap' });
const mono = localFont({ src: '../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2', variable: '--font-jetbrains-mono', display: 'swap' });
export const metadata: Metadata = { title: 'SeeYesYes — Shared decisions', description: 'A design system that humans and AI can understand.' };
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const system = await localAdapter.get('registry');
  const theme = await localAdapter.get('theme');
  // Only html permits the theme bootstrap's planned pre-hydration style updates (M3).
  return <html suppressHydrationWarning lang="en" className={`${sans.variable} ${mono.variable}`}><body><ThemeScope system={system} theme={theme} appearance="system" workspace>{children}</ThemeScope></body></html>;
}
