'use client';
import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode, type Ref, type SyntheticEvent } from 'react';
import { Avatar } from './avatar';
import { Card } from './card';
import styles from './Testimonials.module.css';
export type TestimonialAuthor = { name: string; role?: string };
export type TestimonialCaptions = { src: string; srclang: string; label?: string };
export type TestimonialReview = { kind: 'review'; id: string; quote: ReactNode; author: TestimonialAuthor; avatarSrc?: string; source?: string };
export type TestimonialStory = { kind: 'story'; id: string; src: string; title: string; author: TestimonialAuthor; captions: TestimonialCaptions; poster?: string };
export type TestimonialItem = TestimonialReview | TestimonialStory;
export type TestimonialsProps = Omit<HTMLAttributes<HTMLUListElement>, 'children'> & {
  items: TestimonialItem[]; label?: string; unavailableLabel?: string; ref?: Ref<HTMLUListElement>;
};
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('');
function Attribution({ author, source }: { author: TestimonialAuthor; source?: string }) {
  return <span className={styles.who}>
    <span className={styles.name}>{author.name}</span>
    {author.role && <span className={styles.role}>{author.role}</span>}
    {source && <span className={styles.role}>{source}</span>}
  </span>;
}
function Story({ item, unavailableLabel }: { item: TestimonialStory; unavailableLabel: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === item.src;
  const video = useRef<HTMLVideoElement | null>(null);
  // A server-rendered video can fail before hydration, when React is not yet listening for its error event.
  useEffect(() => { if (video.current?.error) setFailedSrc(item.src); }, [item.src]);
  return <figure className={styles.story}>
    <div className={styles.frame} data-state={failed ? 'error' : undefined}>
      {failed ? <span className={styles.fallback}>{unavailableLabel}</span>
        : <video ref={video} className={styles.video} src={item.src} poster={item.poster} controls playsInline preload="metadata" aria-label={`${item.title}, ${item.author.name}`} onError={() => setFailedSrc(item.src)}>
          <track kind="captions" src={item.captions.src} srcLang={item.captions.srclang} label={item.captions.label ?? 'Captions'} default />
        </video>}
    </div>
    <figcaption className={styles.caption}>
      <span className={styles.title}>{item.title}</span>
      <Attribution author={item.author} />
    </figcaption>
  </figure>;
}
/**
 * Stories and reviews that you supply, in a list. A story is a portrait video with its own controls and a captions track; a review is a quote with its author.
 * Nothing is written for you: every quote, name, role and source comes from `items`, and a review without an `author` cannot be expressed. Videos never autoplay, start paused, show captions by default, and pause when another story starts.
 * If a video cannot load, its frame says so in text (`unavailableLabel`). Review authors show a portrait when `avatarSrc` is given, else their initials.
 */
export function Testimonials({ items, label = 'Testimonials', unavailableLabel = 'This video could not be loaded.', className = '', ref, onPlayCapture, ...props }: TestimonialsProps) {
  const list = useRef<HTMLUListElement | null>(null);
  const assign = (node: HTMLUListElement | null) => {
    list.current = node;
    if (typeof ref === 'function') ref(node); else if (ref) (ref as { current: HTMLUListElement | null }).current = node;
  };
  // `play` does not bubble, so the capture phase sees it; every other story pauses so two voices never overlap.
  const played = (event: SyntheticEvent<HTMLUListElement>) => {
    onPlayCapture?.(event as never);
    list.current?.querySelectorAll('video').forEach(video => { if (video !== event.target) video.pause(); });
  };
  if (items.length === 0) return null;
  return <ul {...props} ref={assign} aria-label={label} className={`${styles.root} ${className}`} onPlayCapture={played}>
    {items.map(item => <li key={item.id} className={styles.item}>
      <Card>
        {item.kind === 'story' ? <Story item={item} unavailableLabel={unavailableLabel} /> : <figure className={styles.review}>
          <blockquote className={styles.quote}>{item.quote}</blockquote>
          <figcaption className={styles.byline}>
            <Avatar initials={initials(item.author.name)} alt="" src={item.avatarSrc} />
            <Attribution author={item.author} source={item.source} />
          </figcaption>
        </figure>}
      </Card>
    </li>)}
  </ul>;
}
