'use client';
import { createContext, useContext, useEffect, useMemo, useRef, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { UNSAFE_PortalProvider } from '@react-aria/overlays';
import type { Appearance, Mode, Theme } from '@/lib/contract/schema';
import { effectiveDefaults, validateTheme, type ThemeSystem } from '@/lib/contract/theme-validation';
import { cssVariables, resolveTokens } from '@/lib/theme/resolve';
import { contractDefaults, type ComponentDefaults } from '@/lib/generated/component-defaults';
import styles from './ThemeScope.module.css';

type ScopeValue = {
  system: ThemeSystem; theme: Theme; mode: Mode | null;
  defaults: Record<string, Record<string, string | number | boolean>>;
  getPortalContainer: () => HTMLElement | null;
};
const ScopeContext = createContext<ScopeValue | null>(null);
const systemMode = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' as const : 'light' as const;
const serverMode = () => null;
const subscribe = (onChange: () => void) => {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};
export function useThemeScope() { return useContext(ScopeContext); }
export function useComponentDefaults<K extends keyof ComponentDefaults>(componentId: K): ComponentDefaults[K] {
  const scope = useThemeScope();
  return (scope?.defaults[componentId] ?? contractDefaults[componentId]) as ComponentDefaults[K];
}
export type ThemeScopeProps = {
  theme: Theme; appearance: Appearance; system?: ThemeSystem; children: ReactNode;
  workspace?: boolean; ready?: boolean; className?: string; id?: string;
};
export function ThemeScope({ theme, appearance, system: suppliedSystem, workspace = false, ready = true, className = '', id, children }: ThemeScopeProps) {
  const parent = useThemeScope();
  const system = suppliedSystem ?? parent?.system;
  if (!system) throw new Error('A root ThemeScope needs a validated design system.');
  if (workspace && parent) throw new Error('Only the root scope can own the workspace.');
  const preference = useSyncExternalStore(subscribe, systemMode, serverMode);
  const mode = appearance === 'system' ? preference : appearance;
  const root = useRef<HTMLDivElement>(null);
  const resolved = useMemo(() => {
    validateTheme(theme, system);
    return resolveTokens(system.tokens, theme, system.fonts);
  }, [system, theme]);
  const variables = useMemo(() => mode ? cssVariables(resolved, mode) : null, [resolved, mode]);
  const value = useMemo<ScopeValue>(() => ({
    system, theme, mode,
    defaults: Object.fromEntries(system.components.map(c => [c.id, effectiveDefaults(c, theme)])),
    // Body is inside the html workspace root and preserves valid document structure.
    getPortalContainer: () => workspace ? document.body : root.current,
  }), [system, theme, mode, workspace]);
  useEffect(() => {
    if (!workspace || !ready || !variables || !mode) return;
    const html = document.documentElement;
    const previous = Object.fromEntries(Object.keys(variables).map(key => [key, html.style.getPropertyValue(key)]));
    const oldAppearance = html.getAttribute('data-appearance');
    const oldScheme = html.style.colorScheme;
    Object.entries(variables).forEach(([key, variable]) => html.style.setProperty(key, variable));
    html.setAttribute('data-appearance', mode);
    html.style.colorScheme = mode;
    return () => {
      Object.entries(previous).forEach(([key, variable]) => variable ? html.style.setProperty(key, variable) : html.style.removeProperty(key));
      if (oldAppearance) html.setAttribute('data-appearance', oldAppearance); else html.removeAttribute('data-appearance');
      html.style.colorScheme = oldScheme;
    };
  }, [workspace, ready, variables, mode]);
  const content = workspace ? children : mode && variables ? <div ref={root} id={id} className={`${styles.root} ${className}`} data-theme-scope="" data-appearance={mode} style={{ ...variables, colorScheme: mode } as CSSProperties}>{children}</div> : null;
  return <ScopeContext.Provider value={value}><UNSAFE_PortalProvider getContainer={value.getPortalContainer}>{content}</UNSAFE_PortalProvider></ScopeContext.Provider>;
}
