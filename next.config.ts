import type { NextConfig } from 'next';
const config: NextConfig = { poweredByHeader: false, experimental: { agentUpgrade: 'security' }, turbopack: { root: process.cwd() } };
export default config;
