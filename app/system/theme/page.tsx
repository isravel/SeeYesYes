import type { Metadata } from 'next';
import { ThemeEditor } from './ThemeEditor';

export const metadata: Metadata = { title: 'Theme editor — SeeYesYes' };
export default function ThemeEditorPage() { return <ThemeEditor />; }
