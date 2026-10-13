import { NotFound } from '@/components/ui/not-found';

export default function AppNotFound() {
  return <main><NotFound title="We could not find that page" description="It may have moved, or the component or address may not exist in this system." homeHref="/components" homeLabel="Browse components" /></main>;
}
