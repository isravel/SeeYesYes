'use client';
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { TooltipTrigger, Tooltip as AriaTooltip } from 'react-aria-components/Tooltip';
import { Focusable } from 'react-aria-components/Focusable';
import { useComponentDefaults, useSurface } from '@/components/theme/ThemeScope';
import { Button } from './button';
import tooltipStyles from './Tooltip.module.css';
import styles from './IconButton.module.css';
export type IconButtonVariant = 'ghost' | 'outline' | 'soft' | 'muted' | 'primary' | 'secondary' | 'destructive';
export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label' | 'aria-labelledby' | 'aria-pressed'> & {
  label: string; icon: ReactNode; variant?: IconButtonVariant; size?: 'small' | 'medium' | 'large'; loading?: boolean; pressed?: boolean; tooltip?: string; ref?: Ref<HTMLButtonElement>;
};
/**
 * A square Button that shows only an icon. `label` is required and becomes the accessible name, so the icon never has to carry the meaning.
 * Pass `pressed` to make it a toggle (`aria-pressed`). A `tooltip` repeats or extends the name on hover and keyboard focus; it never replaces `label`.
 */
export function IconButton({ label, icon, variant, size, loading = false, pressed, tooltip, className = '', ref, ...props }: IconButtonProps) {
  const defaults = useComponentDefaults('icon-button');
  const tip = useComponentDefaults('tooltip');
  const surface = useSurface();
  const button = <Button {...props} ref={ref} variant={variant ?? defaults.variant} size={size ?? defaults.size} loading={loading} aria-label={label} aria-pressed={pressed} className={`${styles.root} ${className}`}>
    <span className={styles.icon} aria-hidden="true">{icon}</span>
  </Button>;
  if (!tooltip) return button;
  return <TooltipTrigger delay={tip.delay} closeDelay={100}>
    <Focusable>{button}</Focusable>
    <AriaTooltip className={tooltipStyles.root} data-surface={surface} placement={tip.placement} offset={8}>{tooltip}</AriaTooltip>
  </TooltipTrigger>;
}
