'use client';
import type { Ref } from 'react';
import { Desktop, Moon, Sun } from '@phosphor-icons/react';
import type { Appearance } from '@/lib/contract/schema';
import { cn } from '@/lib/utils/cn';
import { useComponentDefaults } from './ThemeScope';
import { useOptionalThemeStores } from './ThemeLifecycleProvider';
import { useAppearance } from './useAppearance';
import styles from './ThemeSwitcher.module.css';

const options = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Desktop },
] as const;

export type ThemeSwitcherProps = {
  /** `icon` shows icons with accessible names; `labeled` also shows the words. */
  variant?: 'icon' | 'labeled';
  size?: 'small' | 'medium' | 'large';
  /** The group's accessible name. It stays the same whichever option is selected. */
  label?: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
};
type ViewProps = Required<Pick<ThemeSwitcherProps, 'variant' | 'size' | 'label'>> & Pick<ThemeSwitcherProps, 'className' | 'ref'> & {
  appearance: Appearance | null; pending: boolean; ready: boolean; message: string; onChange: (value: Appearance) => void;
};

function SwitcherView({ variant, size, label, className, ref, appearance, pending, ready, message, onChange }: ViewProps) {
  return <div ref={ref} role="group" aria-label={label} aria-busy={pending || undefined} className={cn(styles.root, className)} data-variant={variant} data-size={size}>
    {options.map(({ value, label: optionLabel, Icon }) => <button key={value} type="button" className={styles.option} aria-pressed={appearance === value} aria-label={variant === 'icon' ? optionLabel : undefined} disabled={!ready || pending} onClick={() => onChange(value)}>
      <Icon className={styles.icon} aria-hidden="true" weight="regular" />
      {variant === 'labeled' && <span>{optionLabel}</span>}
    </button>)}
    <span role="status" className={styles.status}>{pending ? 'Saving…' : message}</span>
  </div>;
}
function ConnectedSwitcher(props: Pick<ViewProps, 'variant' | 'size' | 'label' | 'className' | 'ref'>) {
  const { appearance, pending, initialized, message, change } = useAppearance();
  return <SwitcherView {...props} appearance={appearance} pending={pending} ready={initialized} message={message} onChange={value => { void change(value); }} />;
}

/**
 * Chooses light, dark, or system appearance through the same settings writer as the workspace selector.
 * The group has one stable name; the current preference is exposed with `aria-pressed` on its option.
 * Outside a ThemeLifecycleProvider there is no preference to change, so the options render disabled.
 */
export function ThemeSwitcher({ variant, size, label = 'Theme', className, ref }: ThemeSwitcherProps) {
  const defaults = useComponentDefaults('theme-switcher');
  const shared = { variant: variant ?? defaults.variant, size: size ?? defaults.size, label, className, ref };
  return useOptionalThemeStores()
    ? <ConnectedSwitcher {...shared} />
    : <SwitcherView {...shared} appearance={null} pending={false} ready={false} message="" onChange={() => undefined} />;
}
