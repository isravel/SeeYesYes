'use client';
import type { ReactNode, Ref } from 'react';
import { Tabs as AriaTabs, TabList, Tab, TabPanel } from 'react-aria-components';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './Tabs.module.css';

export type TabsItem = { id: string; label: string; content: ReactNode; disabled?: boolean };
export type TabsProps = {
  label: string; items: TabsItem[]; selectedId?: string; defaultSelectedId?: string;
  onSelectionChange?: (id: string) => void; orientation?: 'horizontal' | 'vertical';
  activation?: 'automatic' | 'manual'; className?: string; ref?: Ref<HTMLDivElement>;
};
export function Tabs({ label, items, selectedId, defaultSelectedId, onSelectionChange, orientation, activation, className = '', ref }: TabsProps) {
  const defaults = useComponentDefaults('tabs');
  return <AriaTabs ref={ref} className={`${styles.root} ${className}`} selectedKey={selectedId} defaultSelectedKey={defaultSelectedId} onSelectionChange={key => onSelectionChange?.(String(key))} orientation={orientation ?? defaults.orientation} keyboardActivation={activation ?? defaults.activation}>
    <TabList className={styles.list} aria-label={label}>
      {items.map(item => <Tab key={item.id} id={item.id} isDisabled={item.disabled} className={styles.tab}>{item.label}</Tab>)}
    </TabList>
    {items.map(item => <TabPanel key={item.id} id={item.id} className={styles.panel}>{item.content}</TabPanel>)}
  </AriaTabs>;
}
