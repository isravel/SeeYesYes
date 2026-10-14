import type { LayoutExample } from '@/lib/contract/schema';

/** Demo compositions of existing primitives. They are not business features. */
export const layoutExamples: LayoutExample[] = [
  { id: 'dashboard', title: 'Dashboard', purpose: 'Summarize status with stats, progress, and badges.', componentIds: ['alert', 'badge', 'card', 'progress'], previewKey: 'dashboard' },
  { id: 'dense-data', title: 'Dense data', purpose: 'Search and filter a compact table of records.', componentIds: ['badge', 'form-field', 'input', 'select', 'table'], previewKey: 'denseData' },
  { id: 'detail-view', title: 'Detail view', purpose: 'Show one record with its facts, tabs, and actions.', componentIds: ['badge', 'button', 'link', 'tabs'], previewKey: 'detailView' },
  { id: 'marketing', title: 'Marketing and product', purpose: 'Introduce a product with a hero, benefits, and calls to action.', componentIds: ['badge', 'button', 'card', 'link'], previewKey: 'marketing' },
  { id: 'page-shell', title: 'Page shell', purpose: 'Frame a page with a header, sidebar, and content area.', componentIds: ['avatar', 'button', 'card', 'link'], previewKey: 'pageShell' },
  { id: 'settings', title: 'Settings', purpose: 'Edit preferences with labeled fields and local save feedback.', componentIds: ['button', 'form-field', 'input', 'select', 'separator', 'switch'], previewKey: 'settings' },
  { id: 'split-view', title: 'Split view', purpose: 'Pair a selectable list with a detail pane.', componentIds: ['avatar', 'button', 'card', 'separator'], previewKey: 'splitView' },
];
