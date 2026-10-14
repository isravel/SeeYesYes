'use client';
import { createContext, lazy, Suspense, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

const ActivationContext = createContext(false);
// The example previews pull in every component, so they load only once the grid is near the viewport.
const Preview = lazy(() => import('@/components/examples/previews').then(module => ({ default: module.ExamplePreview })));

/** Wraps a grid of previews; activates them when the grid is within 150px of the viewport. */
export function PreviewsOnDemand({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') { setActive(true); return; }
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { setActive(true); observer.disconnect(); } }, { rootMargin: '150px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref}><ActivationContext.Provider value={active}>{children}</ActivationContext.Provider></div>;
}

export function LazyPreview({ previewKey }: { previewKey: string }) {
  const active = useContext(ActivationContext);
  return active ? <Suspense fallback={null}><Preview previewKey={previewKey} /></Suspense> : null;
}
