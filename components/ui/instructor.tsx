import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { Link } from './link';
import { MediaFrame } from './media-frame';
import styles from './Instructor.module.css';
export type InstructorLevel = 2 | 3 | 4;
export type InstructorSocial = { id: string; label: string; href: string };
export type InstructorPortrait = { src: string; alt: string };
export type InstructorProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> & {
  name: string; level?: InstructorLevel; role?: string; bio?: ReactNode; portrait?: InstructorPortrait; socials?: InstructorSocial[]; ref?: Ref<HTMLElement>;
};
/**
 * A profile for one person: portrait, name, role, bio and links, all supplied by you. Nothing is filled in when a part is missing: no portrait, no bio and no links simply leave those parts out.
 * The name is a heading at the `level` the page chooses. The portrait keeps a fixed square so the page does not jump, and if it fails to load the name is shown as text in its place. Links open in a new tab and say so; each shows its own label, never only an icon.
 * Side by side from a medium width up, stacked with the portrait first on narrow screens.
 */
export function Instructor({ name, level = 3, role, bio, portrait, socials = [], className = '', ref, ...props }: InstructorProps) {
  const Heading = `h${level}` as 'h2' | 'h3' | 'h4';
  return <article {...props} ref={ref} aria-label={undefined} className={`${styles.root} ${className}`} data-portrait={portrait ? true : undefined}>
    {portrait && <MediaFrame className={styles.portrait} src={portrait.src} alt={portrait.alt} ratio="1:1" fallback={name} />}
    <div className={styles.body}>
      <Heading className={styles.name}>{name}</Heading>
      {role && <p className={styles.role}>{role}</p>}
      {bio && <div className={styles.bio}>{bio}</div>}
      {socials.length > 0 && <ul aria-label={`${name} on the web`} className={styles.socials}>
        {socials.map(social => <li key={social.id}><Link href={social.href} target="_blank" rel="noopener noreferrer">{social.label}<span className={styles.visuallyHidden}> (opens in a new tab)</span></Link></li>)}
      </ul>}
    </div>
  </article>;
}
