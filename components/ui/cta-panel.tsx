import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { Card } from './card';
import styles from './CtaPanel.module.css';
export type CtaPanelLevel = 2 | 3 | 4;
export type CtaPanelProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> & {
  heading: string; level?: CtaPanelLevel; description?: ReactNode; action: ReactNode; texture?: boolean; ref?: Ref<HTMLDivElement>;
};
/**
 * An emphasized closing panel with one main action. It is a Card underneath, so the glass surface, edge and fallbacks are Card's own; a soft brand tint sits behind the content.
 * `action` is the single main action you supply (a Button or a Link). `texture` adds a faint dot pattern behind the text; it is decoration, off by default and removed in forced colors.
 */
export function CtaPanel({ heading, level = 2, description, action, texture = false, className = '', ref, ...props }: CtaPanelProps) {
  const Heading = `h${level}` as 'h2' | 'h3' | 'h4';
  return <div {...props} ref={ref} className={`${styles.root} ${className}`} data-level={level}>
    <Card variant="elevated" className={styles.panel} data-texture={texture ? true : undefined}>
      <div className={styles.body}>
        <div className={styles.text}>
          <Heading className={styles.heading}>{heading}</Heading>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        <div className={styles.action}>{action}</div>
      </div>
    </Card>
  </div>;
}
