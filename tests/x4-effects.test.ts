import { describe, expect, it } from 'vitest';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AnimatedBadge } from '@/components/ui/animated-badge';
import { ShinyText } from '@/components/ui/shiny-text';
import { RotatingWord } from '@/components/ui/rotating-word';
import { MenuToggle } from '@/components/ui/menu-toggle';
import { Logo } from '@/components/ui/logo';
import { FancyArrow } from '@/components/ui/fancy-arrow';
import { TiltCard } from '@/components/ui/tilt-card';
import { CardSwap } from '@/components/ui/card-swap';
import { MediaFrame } from '@/components/ui/media-frame';
import { Carousel } from '@/components/ui/carousel';
import { registry } from '@/lib/data/registry';

const h = createElement as unknown as (type: unknown, props?: Record<string, unknown> | null, ...children: unknown[]) => ReactElement;
const html = (element: ReactElement) => renderToStaticMarkup(element);
const get = (id: string) => registry.components.find(component => component.id === id)!;
const prop = (id: string, name: string) => get(id).props.find(item => item.name === name)!;

describe('SYX-025 AnimatedBadge', () => {
  it('is a plain Badge with its text until animation is asked for', () => {
    const markup = html(h(AnimatedBadge, { tone: 'primary' }, 'New'));
    expect(markup).toContain('New');
    expect(markup).toContain('data-tone="primary"');
    expect(markup).not.toContain('data-animated');
  });
  it('marks only an animated badge, and keeps the label and tone', () => {
    const markup = html(h(AnimatedBadge, { animated: true, tone: 'success' }, 'Live'));
    expect(markup).toContain('data-animated="true"');
    expect(markup).toContain('data-tone="success"');
    expect(markup).toContain('Live');
  });
});

describe('SYX-028 ShinyText', () => {
  it('is plain inline text, static by default', () => {
    const markup = html(h(ShinyText, null, 'faster'));
    expect(markup).toContain('>faster<');
    expect(markup).not.toContain('data-animated');
    expect(markup.startsWith('<span')).toBe(true);
  });
  it('marks the animated form without changing the words', () => {
    const markup = html(h(ShinyText, { animated: true }, 'faster'));
    expect(markup).toContain('data-animated="true"');
    expect(markup).toContain('>faster<');
  });
});

describe('SYX-034 RotatingWord', () => {
  const words = ['teams', 'designers', 'agents'];
  it('renders every word so the line reserves the widest one, and shows only the first before hydration', () => {
    const markup = html(h(RotatingWord, { words, animated: true }));
    for (const word of words) expect(markup).toContain(`>${word}<`);
    expect(markup.match(/data-active="true"/g)).toHaveLength(1);
    expect(markup).toContain('data-active="true">teams<');
  });
  it('hides the cycling words from assistive technology and reads one phrase instead', () => {
    const markup = html(h(RotatingWord, { words }));
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain('teams, designers, agents</span>');
    expect(html(h(RotatingWord, { words, label: 'for everyone' }))).toContain('for everyone</span>');
  });
  it('does not rotate until after hydration, and never for one word or none', () => {
    expect(html(h(RotatingWord, { words, animated: true }))).not.toContain('data-rotating');
    expect(html(h(RotatingWord, { words: ['solo'], animated: true }))).not.toContain('data-rotating');
    expect(html(h(RotatingWord, { words: [] }))).toBe('');
  });
});

describe('SYX-027 MenuToggle', () => {
  it('is a native button named by its label, collapsed by default, and never submits a form', () => {
    const markup = html(h(MenuToggle, { label: 'Menu', controls: 'site-menu' }));
    expect(markup).toContain('type="button"');
    expect(markup).toContain('aria-label="Menu"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('aria-controls="site-menu"');
    expect(markup.match(/aria-hidden="true"/g)).toHaveLength(1);
  });
  it('shows an expanded state, a size, and a disabled button', () => {
    expect(html(h(MenuToggle, { label: 'Menu', defaultExpanded: true }))).toContain('aria-expanded="true"');
    expect(html(h(MenuToggle, { label: 'Menu', expanded: true, defaultExpanded: false }))).toContain('aria-expanded="true"');
    expect(html(h(MenuToggle, { label: 'Menu' }))).toContain('data-size="medium"');
    expect(html(h(MenuToggle, { label: 'Menu', size: 'large' }))).toContain('data-size="large"');
    expect(html(h(MenuToggle, { label: 'Menu', disabled: true }))).toContain('disabled=""');
  });
  it('animates by default and can turn it off', () => {
    expect(html(h(MenuToggle, { label: 'Menu' }))).toContain('data-animated="true"');
    expect(html(h(MenuToggle, { label: 'Menu', animated: false }))).not.toContain('data-animated');
  });
});

describe('X4 effect contracts', () => {
  const ids = ['animated-badge', 'shiny-text', 'rotating-word', 'menu-toggle'];
  it('registers each with a recommended example; only MenuToggle is interactive and documents keys', () => {
    for (const id of ids) {
      expect(get(id), id).toBeDefined();
      expect(registry.examples.some(example => example.intent === 'recommended' && example.componentIds.includes(id)), id).toBe(true);
      expect(get(id).interactive, id).toBe(id === 'menu-toggle');
      expect(get(id).accessibility.keyboard.length > 0, id).toBe(id === 'menu-toggle');
    }
    expect(registry.rules.find(rule => rule.id === 'wcag-focus-visible')!.appliesTo).toContain('menu-toggle');
  });
  it('keeps every effect opt-in with the planned defaults', () => {
    expect(prop('animated-badge', 'animated').defaultValue).toBe(false);
    expect(prop('shiny-text', 'animated').defaultValue).toBe(false);
    expect(prop('rotating-word', 'animated').defaultValue).toBe(false);
    expect(prop('rotating-word', 'interval').defaultValue).toBe(3000);
    expect(prop('menu-toggle', 'defaultExpanded').defaultValue).toBe(false);
    expect(prop('menu-toggle', 'size').defaultValue).toBe('medium');
  });
  it('treats reduced motion as a documented state of every animated component', () => {
    for (const id of ['animated-badge', 'shiny-text', 'menu-toggle']) expect(get(id).states, id).toContain('reduced-motion');
    expect(get('rotating-word').states).toContain('paused');
  });
});

describe('SYX-026 Logo', () => {
  it('is one named image whose parts are decoration, with the supplied image and wordmark', () => {
    const markup = html(h(Logo, { label: 'Acme', src: '/mark.svg', wordmark: 'Acme' }));
    expect(markup).toContain('role="img"');
    expect(markup).toContain('aria-label="Acme"');
    expect(markup).toContain('src="/mark.svg"');
    expect(markup).toContain('alt=""');
    expect(markup).toContain('>Acme<');
  });
  it('shows the label as text when there is no image, mark or wordmark, and never invents a brand', () => {
    expect(html(h(Logo, { label: 'Acme' }))).toContain('>Acme<');
    expect(html(h(Logo, { label: 'Acme', mark: h('svg') }))).not.toContain('>Acme<');
    expect(html(h(Logo, { label: 'Acme' }))).not.toContain('<img');
  });
  it('is static by default with a medium size', () => {
    const markup = html(h(Logo, { label: 'Acme' }));
    expect(markup).not.toContain('data-animated');
    expect(markup).toContain('data-size="medium"');
    expect(html(h(Logo, { label: 'Acme', animated: true, size: 'large' }))).toContain('data-animated="true"');
  });
});

describe('SYX-029 FancyArrow', () => {
  it('is hidden from assistive technology and has no role when decorative', () => {
    const markup = html(h(FancyArrow, { src: '/arrow.svg' }));
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).not.toContain('role=');
    expect(markup).not.toContain('tabindex');
    expect(markup).toContain('data-placement="inline"');
  });
  it('becomes one named image only when given alt', () => {
    const markup = html(h(FancyArrow, { src: '/arrow.svg', alt: 'Next step' }));
    expect(markup).toContain('role="img"');
    expect(markup).toContain('aria-label="Next step"');
    expect(markup).not.toContain('aria-hidden="true"><span');
  });
  it('records placement and direction', () => {
    const markup = html(h(FancyArrow, { src: '/arrow.svg', placement: 'top-end', direction: 'down' }));
    expect(markup).toContain('data-placement="top-end"');
    expect(markup).toContain('data-direction="down"');
  });
});

describe('SYX-030 TiltCard', () => {
  it('is a plain Card until tilt is asked for', () => {
    const markup = html(h(TiltCard, null, h('p', null, 'Body')));
    expect(markup).toContain('>Body<');
    expect(markup).toContain('data-variant="default"');
    expect(markup).not.toContain('data-tilt');
    expect(markup).not.toContain('role=');
    expect(markup).not.toContain('tabindex');
  });
  it('marks tilt, adds depth only with tilt, and clamps the angle', () => {
    expect(html(h(TiltCard, { tilt: true }, 'x'))).toContain('data-tilt="true"');
    expect(html(h(TiltCard, { depth: true }, 'x'))).not.toContain('data-depth');
    expect(html(h(TiltCard, { tilt: true, depth: true }, 'x'))).toContain('data-depth="true"');
    expect(html(h(TiltCard, { tilt: true, maxTilt: 99 }, 'x'))).toContain('--tilt-max:15deg');
    expect(html(h(TiltCard, { tilt: true, maxTilt: -4 }, 'x'))).toContain('--tilt-max:0deg');
  });
});

describe('SYX-031 CardSwap', () => {
  const items = [{ id: 'a', content: h('p', null, 'First') }, { id: 'b', content: h('p', null, 'Second') }, { id: 'c', content: h('p', null, 'Third') }];
  it('keeps every card in order, with only the front one exposed', () => {
    const markup = html(h(CardSwap, { label: 'Highlights', items }));
    expect(markup.indexOf('First')).toBeLessThan(markup.indexOf('Second'));
    expect(markup.indexOf('Second')).toBeLessThan(markup.indexOf('Third'));
    expect(markup).toContain('role="group"');
    expect(markup).toContain('aria-label="Highlights"');
    expect(markup.match(/inert=""/g)).toHaveLength(2);
    expect(markup).toContain('data-position="0"');
  });
  it('has fixed-name buttons and a status line, and starts on the chosen card', () => {
    const markup = html(h(CardSwap, { label: 'Highlights', items, defaultIndex: 1 }));
    expect(markup).toContain('Previous card');
    expect(markup).toContain('Next card');
    expect(markup).toContain('Card 2 of 3');
    expect(markup).not.toContain('Pause cycling');
  });
  it('offers a pause button only with autoplay and never cycles before hydration', () => {
    const markup = html(h(CardSwap, { label: 'Highlights', items, autoplay: true }));
    expect(markup).toContain('Pause cycling');
    expect(markup).not.toContain('data-cycling');
  });
  it('shows no controls for one card and nothing for none', () => {
    expect(html(h(CardSwap, { label: 'One', items: items.slice(0, 1) }))).not.toContain('Next card');
    expect(html(h(CardSwap, { label: 'None', items: [] }))).toBe('');
  });
});

describe('SYX-033 MediaFrame', () => {
  it('is a figure with a real caption, the alt text and a reserved ratio', () => {
    const markup = html(h(MediaFrame, { src: '/pic.png', alt: 'A hill', caption: 'Hill at dusk' }));
    // React may put an image preload link ahead of the figure, so check for the element rather than the start.
    expect(markup).toContain('<figure');
    expect(markup).toContain('alt="A hill"');
    expect(markup).toContain('<figcaption');
    expect(markup).toContain('data-ratio="16:9"');
    expect(markup).toContain('data-fit="cover"');
    expect(markup).toContain('data-hover="none"');
    expect(markup).not.toContain('data-vignette');
  });
  it('records ratio, fit, hover and vignette, and renders a video with native controls', () => {
    const markup = html(h(MediaFrame, { src: '/pic.png', alt: 'A hill', ratio: '1:1', fit: 'contain', hover: 'zoom', vignette: true }));
    for (const part of ['data-ratio="1:1"', 'data-fit="contain"', 'data-hover="zoom"', 'data-vignette="true"']) expect(markup).toContain(part);
    const video = html(h(MediaFrame, { src: '/clip.mp4', alt: 'Demo clip', kind: 'video' }));
    expect(video).toContain('<video');
    expect(video).toContain('controls');
    expect(video).not.toContain('autoplay');
  });
});

describe('SYX-044 Carousel', () => {
  const items = [{ id: 'a', content: h('p', null, 'First') }, { id: 'b', content: h('p', null, 'Second') }, { id: 'c', content: h('p', null, 'Third') }];
  it('is a named carousel region holding every slide in order, none hidden', () => {
    const markup = html(h(Carousel, { label: 'Featured', items }));
    expect(markup).toContain('role="region"');
    expect(markup).toContain('aria-roledescription="carousel"');
    expect(markup).toContain('aria-label="Featured"');
    expect(markup.indexOf('First')).toBeLessThan(markup.indexOf('Second'));
    expect(markup.indexOf('Second')).toBeLessThan(markup.indexOf('Third'));
    expect(markup).toContain('aria-label="2 of 3"');
    expect(markup).not.toContain('inert');
    expect(markup).not.toContain('aria-hidden');
  });
  it('has a keyboard-focusable scrolling row, fixed-name buttons and a status line, with Previous disabled at the start', () => {
    const markup = html(h(Carousel, { label: 'Featured', items }));
    expect(markup).toContain('tabindex="0"');
    expect(markup).toContain('Previous slide');
    expect(markup).toContain('Next slide');
    expect(markup).toContain('Slide 1 of 3');
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>Previous slide/);
    expect(markup).not.toMatch(/<button[^>]*disabled=""[^>]*>Next slide/);
    expect(markup).not.toContain('Pause autoplay');
  });
  it('offers a pause button only with autoplay and never cycles before hydration', () => {
    const markup = html(h(Carousel, { label: 'Featured', items, autoplay: true }));
    expect(markup).toContain('Pause autoplay');
    expect(markup).not.toContain('data-cycling');
  });
  it('marks edge fade and peek only when asked', () => {
    expect(html(h(Carousel, { label: 'Featured', items }))).not.toMatch(/data-fade|data-peek/);
    const markup = html(h(Carousel, { label: 'Featured', items, edgeFade: true, peek: true }));
    expect(markup).toContain('data-fade="true"');
    expect(markup).toContain('data-peek="true"');
  });
  it('shows no controls for one slide and nothing for none', () => {
    expect(html(h(Carousel, { label: 'One', items: items.slice(0, 1) }))).not.toContain('Next slide');
    expect(html(h(Carousel, { label: 'None', items: [] }))).toBe('');
  });
});

describe('X4 second batch contracts', () => {
  const ids = ['logo', 'fancy-arrow', 'tilt-card', 'card-swap', 'carousel', 'media-frame'];
  it('registers each with a recommended example; only CardSwap and Carousel are interactive', () => {
    for (const id of ids) {
      expect(get(id), id).toBeDefined();
      expect(registry.examples.some(example => example.intent === 'recommended' && example.componentIds.includes(id)), id).toBe(true);
      expect(get(id).interactive, id).toBe(id === 'card-swap' || id === 'carousel');
      expect(get(id).accessibility.keyboard.length > 0, id).toBe(id === 'card-swap' || id === 'carousel');
    }
    expect(registry.rules.find(rule => rule.id === 'wcag-focus-visible')!.appliesTo).toContain('card-swap');
    expect(registry.rules.find(rule => rule.id === 'wcag-focus-visible')!.appliesTo).toContain('carousel');
  });
  it('keeps every effect opt-in with the planned defaults', () => {
    expect(prop('logo', 'animated').defaultValue).toBe(false);
    expect(prop('tilt-card', 'tilt').defaultValue).toBe(false);
    expect(prop('tilt-card', 'depth').defaultValue).toBe(false);
    expect(prop('card-swap', 'autoplay').defaultValue).toBe(false);
    expect(prop('card-swap', 'defaultIndex').defaultValue).toBe(0);
    expect(prop('carousel', 'autoplay').defaultValue).toBe(false);
    expect(prop('carousel', 'interval').defaultValue).toBe(3000);
    expect(prop('carousel', 'edgeFade').defaultValue).toBe(false);
    expect(prop('media-frame', 'ratio').defaultValue).toBe('16:9');
    expect(prop('media-frame', 'fit').defaultValue).toBe('cover');
    expect(prop('media-frame', 'hover').defaultValue).toBe('none');
    expect(prop('fancy-arrow', 'placement').defaultValue).toBe('inline');
  });
  it('tells the consumer to supply the identity and arrow art, since the system ships none', () => {
    for (const id of ['logo', 'fancy-arrow']) expect(get(id).accessibility.requirements.join(' ')).toMatch(/Supply the (identity|art) yourself|does not create/);
  });
});
