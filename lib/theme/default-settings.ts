import type { WorkspaceSettings } from '@/lib/contract/schema';
import { defaultTheme } from '@/lib/data/registry';

/** The bundled default settings, for tools and tests. The app's runtime takes its defaults from the theme system it is given. */
export const defaultWorkspaceSettings: WorkspaceSettings = { settingsVersion: 1, theme: defaultTheme, appearance: 'system' };
