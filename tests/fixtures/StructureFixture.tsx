'use client';
import { useState } from 'react';
import type { Theme } from '@/lib/contract/schema';
import { ThemeScope } from '@/components/theme/ThemeScope';
import { Navigation } from '@/components/ui/navigation';
import { Table } from '@/components/ui/table';
import styles from './StructureFixture.module.css';
export function StructureFixture({ theme }: { theme: Theme }) {
  const [page, setPage] = useState('Reports');
  return <ThemeScope theme={theme} appearance="dark" id="structure-scope"><div className={styles.shell}>
    <Navigation label="Fixture workspace" mainId="structure-main" currentHref={`#${page.toLowerCase()}`} groups={[{ label: 'Workspace', items: [{ label: 'Reports', href: '#reports' }, { label: 'Settings', href: '#settings' }] }]} breadcrumbs={[{ label: 'Workspace', href: '#structure-main' }, { label: page, href: `#${page.toLowerCase()}` }]} />
    <main id="structure-main" tabIndex={-1}>
      <h1>{page}</h1>
      <section id="reports" tabIndex={-1} onFocus={() => setPage('Reports')}><h2>Reports</h2>
        <Table caption="Invoice report" columns={[{ id: 'invoice', label: 'Invoice', rowHeader: true }, { id: 'customer', label: 'Customer' }, { id: 'amount', label: 'Amount' }, { id: 'status', label: 'Status' }]} rows={[{ id: 'one', cells: { invoice: 'INV-104', customer: 'Northwind Studio — monthly subscription', amount: '₹12,500.00', status: 'Paid' } }]} />
        <Table caption="Archived invoices" columns={[{ id: 'invoice', label: 'Invoice' }, { id: 'status', label: 'Status' }]} rows={[]} />
      </section><section id="settings" tabIndex={-1} onFocus={() => setPage('Settings')}><h2>Settings</h2><p>Choose your workspace defaults.</p></section>
    </main>
  </div></ThemeScope>;
}
