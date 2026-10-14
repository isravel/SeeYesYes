import type { ReactNode } from 'react';
import './globals.css';
import './tokens.css';

export const metadata = { title: 'Fixture app' };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
