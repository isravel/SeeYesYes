'use client';
import type { ComponentProps, ReactNode } from 'react';
import { CohortCard } from '@/components/ui/cohort-card';
import { CourseCard } from '@/components/ui/course-card';
import { CardGrid } from '@/components/ui/card-grid';
import { CtaPanel } from '@/components/ui/cta-panel';
import { FeatureBento, type FeatureBentoItem, type FeatureBentoLayout } from '@/components/ui/feature-bento';
import { Hero } from '@/components/ui/hero';
import { SectionHead } from '@/components/ui/section-head';
import { StatStrip, type StatItem } from '@/components/ui/stat-strip';
import { Testimonials, type TestimonialItem } from '@/components/ui/testimonials';
import styles from './LandingPage.module.css';

type SectionText = { heading: string; subtitle?: ReactNode; viewAllHref?: string; viewAllLabel?: string };
type WithId<T> = T & { id: string };
export type LandingPageProps = {
  /** The opening of the page. Required: every landing page starts with one. */
  hero: Omit<ComponentProps<typeof Hero>, 'level' | 'ref'>;
  /** Optional sections. Leave one out and it is not rendered: no heading, no empty space. */
  stats?: { heading: string; items: StatItem[] };
  cohorts?: SectionText & { items: WithId<Omit<ComponentProps<typeof CohortCard>, 'level' | 'ref'>>[]; label?: string };
  courses?: SectionText & { items: WithId<Omit<ComponentProps<typeof CourseCard>, 'level' | 'ref'>>[]; label?: string };
  features?: SectionText & { items: FeatureBentoItem[]; layout?: FeatureBentoLayout };
  testimonials?: SectionText & { items: TestimonialItem[] };
  cta?: Omit<ComponentProps<typeof CtaPanel>, 'level' | 'ref'>;
  /** 1 when this is the page's own title (the default); 2 when the host page already has an h1. Sections and cards follow so heading order never skips. */
  level?: 1 | 2;
};

/**
 * A configurable landing page: hero, then stats, cohorts, courses, features, testimonials and a closing call to action, in that order. Only the hero is required; every other section appears only when you supply it.
 * Every word, number, link, image and review comes from you, and nothing is invented to fill a gap. Section headings sit one level under the hero, and the cards under those, so the outline stays correct at either `level`.
 * Place it inside PageShell (or any page) so the Navbar and Footer are yours; it adds no landmarks of its own, only labelled regions for the sections.
 */
export function LandingPage({ hero, stats, cohorts, courses, features, testimonials, cta, level = 1 }: LandingPageProps) {
  const section = (level + 1) as 2 | 3;
  const card = (level + 2) as 3 | 4;
  const head = (text: SectionText) => <SectionHead heading={text.heading} level={section} subtitle={text.subtitle} viewAllHref={text.viewAllHref} viewAllLabel={text.viewAllLabel} />;
  return <div className={styles.root}>
    <Hero {...hero} level={level} />
    {stats && stats.items.length > 0 && <section aria-label={stats.heading} className={styles.section}><StatStrip items={stats.items} /></section>}
    {cohorts && cohorts.items.length > 0 && <section aria-label={cohorts.heading} className={styles.section}>{head(cohorts)}
      <CardGrid label={cohorts.label ?? cohorts.heading} items={cohorts.items.map(({ id, ...props }) => ({ id, content: <CohortCard {...props} level={card} /> }))} /></section>}
    {courses && courses.items.length > 0 && <section aria-label={courses.heading} className={styles.section}>{head(courses)}
      <CardGrid label={courses.label ?? courses.heading} items={courses.items.map(({ id, ...props }) => ({ id, content: <CourseCard {...props} level={card} /> }))} /></section>}
    {features && features.items.length > 0 && <section aria-label={features.heading} className={styles.section}>{head(features)}
      <FeatureBento items={features.items} layout={features.layout} level={card} label={features.heading} /></section>}
    {testimonials && testimonials.items.length > 0 && <section aria-label={testimonials.heading} className={styles.section}>{head(testimonials)}
      <Testimonials items={testimonials.items} label={testimonials.heading} /></section>}
    {cta && <section aria-label={cta.heading} className={styles.section}><CtaPanel {...cta} level={section} /></section>}
  </div>;
}
