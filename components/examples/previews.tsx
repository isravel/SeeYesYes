'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { Spinner } from '@/components/ui/spinner';
function ButtonSave() {
  const [saved, setSaved] = useState(false);
  return <><Button onClick={() => setSaved(true)}>Save settings</Button><span role="status">{saved ? 'Settings saved for this example.' : ''}</span></>;
}
function SpinnerProgress() { return <p role="status"><Spinner /> Preparing your preview…</p>; }
function LinkDocs() { return <Link href="/api/registry">Read the registry</Link>; }
export const previewMap = { buttonSave: ButtonSave, spinnerProgress: SpinnerProgress, linkDocs: LinkDocs };
export const layoutPreviewMap = {};

export function ExamplePreview({ previewKey }: { previewKey: string }) {
  if (!Object.hasOwn(previewMap, previewKey)) throw new Error(`Unknown preview key: ${previewKey}`);
  const Preview = previewMap[previewKey as keyof typeof previewMap];
  return <Preview />;
}
