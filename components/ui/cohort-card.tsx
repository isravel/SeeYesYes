'use client';
import { useEffect, useRef, useState, type ComponentProps, type ReactNode, type Ref } from 'react';
import { Badge, type BadgeTone } from './badge';
import { Link } from './link';
import { TiltCard } from './tilt-card';
import styles from './CohortCard.module.css';
export type CohortCardLevel = 2 | 3 | 4;
export type CohortTool = { id: string; label: string; src: string };
export type CohortCardProps = Omit<ComponentProps<typeof TiltCard>, 'children' | 'title' | 'tilt' | 'maxTilt' | 'depth' | 'ref'> & {
  title: string; href: string; level?: CohortCardLevel; status?: string; statusTone?: BadgeTone; description?: ReactNode; tools?: CohortTool[]; toolsLabel?: string; linkLabel?: string;
  tilt?: boolean; texture?: boolean; ref?: Ref<HTMLDivElement>;
};
function Tool({ tool }: { tool: CohortTool }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const image = useRef<HTMLImageElement | null>(null);
  // A server-rendered image can fail before hydration, when React is not yet listening for its error event.
  useEffect(() => { const node = image.current; if (node?.complete && node.naturalWidth === 0) setFailedSrc(tool.src); }, [tool.src]);
  return failedSrc === tool.src ? <span className={styles.toolFallback}>{tool.label}</span> : <img ref={image} className={styles.tool} src={tool.src} alt={tool.label} onError={() => setFailedSrc(tool.src)} />;
}
/**
 * A cohort as a TiltCard: title, a status you supply, a description, the tools it uses as images you supply, and one details link.
 * Tilt and a faint texture are decoration and off by default. With them off, on touch, under reduced motion or in forced colors, every piece of content is unchanged and still readable; keyboard focus never tilts the card.
 * The status is text in a badge, so its tone is never the only cue. A failed tool image shows its label as text. The whole card is the click target of its one link, named by its label followed by the title; put no other links or buttons inside.
 */
export function CohortCard({ title, href, level = 3, status, statusTone = 'neutral', description, tools = [], toolsLabel = 'Tools', linkLabel = 'View cohort', tilt = false, texture = false, className = '', ref, ...props }: CohortCardProps) {
  const Heading = `h${level}` as 'h2' | 'h3' | 'h4';
  return <TiltCard {...props} ref={ref} tilt={tilt} className={`${styles.root} ${className}`} data-texture={texture ? true : undefined}>
    <div className={styles.body}>
      {status && <Badge tone={statusTone} className={styles.status}>{status}</Badge>}
      <Heading className={styles.title}>{title}</Heading>
      {description && <div className={styles.description}>{description}</div>}
      {tools.length > 0 && <ul aria-label={toolsLabel} className={styles.tools}>{tools.map(tool => <li key={tool.id} className={styles.toolItem}><Tool tool={tool} /></li>)}</ul>}
      <Link href={href} className={styles.link}>{linkLabel}<span className={styles.visuallyHidden}> {title}</span></Link>
    </div>
  </TiltCard>;
}
