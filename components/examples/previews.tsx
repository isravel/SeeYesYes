'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/ui/avatar';
import { Alert } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
function ButtonSave() {
  const [saved, setSaved] = useState(false);
  return <><Button onClick={() => setSaved(true)}>Save settings</Button><span role="status">{saved ? 'Settings saved for this example.' : ''}</span></>;
}
function SpinnerProgress() { return <p role="status"><Spinner /> Preparing your preview…</p>; }
function LinkDocs() { return <Link href="/api/registry">Read the registry</Link>; }
function CardProfile() { return <Card><h3>Workspace settings</h3><p>Choose the defaults your team shares.</p></Card>; }
function BadgeStatus() { return <Badge tone="success">Ready</Badge>; }
function SeparatorSections() { return <div className="previewSections"><span>Overview</span><Separator /><span>Details</span></div>; }
function AvatarMember() { return <Avatar initials="MC" alt="Maya Chen" />; }
function AlertRecovery() { return <Alert tone="info" title="Preview mode">Your changes stay in this preview.</Alert>; }
function ProgressUpload() { return <Progress label="Uploading files" value={68} />; }
function SkeletonList() { return <section aria-busy="true" aria-label="Loading members"><Skeleton shape="text" /><Skeleton shape="rect" /></section>; }
export const previewMap = {
  buttonSave: ButtonSave, spinnerProgress: SpinnerProgress, linkDocs: LinkDocs,
  cardProfile: CardProfile, badgeStatus: BadgeStatus, separatorSections: SeparatorSections,
  avatarMember: AvatarMember, alertRecovery: AlertRecovery, progressUpload: ProgressUpload, skeletonList: SkeletonList,
};
export const layoutPreviewMap = {};

export function ExamplePreview({ previewKey }: { previewKey: string }) {
  if (!Object.hasOwn(previewMap, previewKey)) throw new Error(`Unknown preview key: ${previewKey}`);
  const Preview = previewMap[previewKey as keyof typeof previewMap];
  return <Preview />;
}
