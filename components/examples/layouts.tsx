'use client';
import { useId, useMemo, useState, type ReactNode } from 'react';
import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Link } from '@/components/ui/link';
import { Progress } from '@/components/ui/progress';
import { Select } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Table } from '@/components/ui/table';
import { Tabs } from '@/components/ui/tabs';
import styles from './Layouts.module.css';

const Frame = ({ children }: { children: ReactNode }) => <div className={styles.frame}>{children}</div>;

export function PageShellLayout() {
  return <Frame><div className={styles.shell}>
    <header className={styles.bar}><span className={styles.brand}>Northwind</span><nav aria-label="Example sections"><Link href="#overview">Overview</Link><Link href="#projects">Projects</Link><Link href="#team">Team</Link></nav><Avatar initials="MC" alt="Maya Chen" size="small" /></header>
    <div className={styles.body}>
      <aside className={styles.side} aria-label="Shell sidebar"><Button variant="ghost">Inbox</Button><Button variant="ghost">Planning</Button><Button variant="ghost">Archive</Button></aside>
      <section className={styles.main} aria-label="Shell content"><h3 className={styles.heading}>Workspace</h3><p className={styles.muted}>A header, a sidebar, and a content area. The parent places each region; the components own their own behavior.</p>
        <Card><p>Content goes here.</p></Card></section>
    </div>
  </div></Frame>;
}

export function DashboardLayout() {
  return <Frame><div className={styles.dashboard}>
    <h3 className={styles.heading}>Overview</h3>
    <div className={styles.stats}>{[['Active projects', '12'], ['Open tasks', '48'], ['Completed', '128']].map(([label, value]) => <Card key={label}><div className={styles.stat}><span>{label}</span><strong>{value}</strong></div></Card>)}</div>
    <div className={styles.cards}>
      <Card variant="outlined"><h4 className={styles.heading}>Launch plan</h4><Progress label="Launch plan progress" value={72} /><p className={styles.muted}>72% complete</p></Card>
      <Card variant="outlined"><h4 className={styles.heading}>Reviews</h4><Progress label="Review progress" value={40} /><p className={styles.muted}>40% complete</p></Card>
      <Card variant="outlined"><h4 className={styles.heading}>Status</h4><div className={styles.actions}><Badge tone="success">On track</Badge><Badge tone="warning">2 at risk</Badge></div></Card>
    </div>
    <Alert tone="info" title="Demo data">These numbers are sample content for the layout.</Alert>
  </div></Frame>;
}

const people = [{ id: 'maya', name: 'Maya Chen', role: 'Design lead', initials: 'MC', note: 'Owns the component contracts.' }, { id: 'omar', name: 'Omar Haddad', role: 'Engineer', initials: 'OH', note: 'Builds the shared primitives.' }, { id: 'lena', name: 'Lena Okafor', role: 'Researcher', initials: 'LO', note: 'Reviews accessibility evidence.' }];
export function SplitViewLayout() {
  const [selected, setSelected] = useState(people[0].id);
  const person = people.find(item => item.id === selected)!;
  return <Frame><div className={styles.split}>
    <ul className={styles.list} aria-label="People">{people.map(item => <li key={item.id}><button type="button" className={styles.item} aria-pressed={item.id === selected} onClick={() => setSelected(item.id)}><Avatar initials={item.initials} alt="" size="small" /><span>{item.name}</span></button></li>)}</ul>
    <Card><div className={styles.actions}><Avatar initials={person.initials} alt={person.name} /><div><h3 className={styles.heading}>{person.name}</h3><p className={styles.muted}>{person.role}</p></div></div><Separator /><p>{person.note}</p><Button variant="secondary">Send message</Button></Card>
  </div></Frame>;
}

export function DetailViewLayout() {
  return <Frame><div className={styles.detail}>
    <p className={styles.muted}><Link href="#projects">Projects</Link> / Website refresh</p>
    <div className={styles.actions}><h3 className={styles.heading}>Website refresh</h3><Badge tone="success">Active</Badge></div>
    <dl className={styles.facts}>{[['Owner', 'Maya Chen'], ['Due', 'Mar 14'], ['Budget', '$24,000']].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <Tabs label="Project details" items={[{ id: 'summary', label: 'Summary', content: 'A refreshed marketing site with clearer product pages.' }, { id: 'tasks', label: 'Tasks', content: '14 open tasks across design and engineering.' }, { id: 'files', label: 'Files', content: '36 shared files.' }]} />
    <div className={styles.actions}><Button>Edit project</Button><Button variant="secondary">Share</Button></div>
  </div></Frame>;
}

export function SettingsLayout() {
  const id = useId();
  const [saved, setSaved] = useState(false);
  return <Frame><form className={styles.form} onSubmit={event => { event.preventDefault(); setSaved(true); }}>
    <h3 className={styles.heading}>Profile settings</h3>
    <FormField id={`${id}-name`} label="Display name" helpText="Shown to your teammates."><Input defaultValue="Maya Chen" onChange={() => setSaved(false)} /></FormField>
    <FormField id={`${id}-role`} label="Role"><Select defaultValue="lead" onChange={() => setSaved(false)}><option value="lead">Design lead</option><option value="eng">Engineer</option></Select></FormField>
    <Switch label="Email me about reviews" defaultChecked onChange={() => setSaved(false)} />
    <Separator />
    <div className={styles.actions}><Button type="submit">Save changes</Button><span role="status" className={styles.muted}>{saved ? 'Saved in this preview only. Nothing is stored.' : ''}</span></div>
  </form></Frame>;
}

const invoices = [['INV-104', 'Acme Co', 'Paid', 1200], ['INV-105', 'Globex', 'Pending', 860], ['INV-106', 'Initech', 'Overdue', 2400], ['INV-107', 'Umbrella', 'Paid', 540], ['INV-108', 'Hooli', 'Pending', 1980], ['INV-109', 'Stark', 'Paid', 3100]] as const;
const tone = { Paid: 'success', Pending: 'warning', Overdue: 'destructive' } as const;
export function DenseDataLayout() {
  const id = useId();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const rows = useMemo(() => invoices.filter(([number, customer, state]) => (status === 'all' || state === status) && `${number} ${customer}`.toLowerCase().includes(query.toLowerCase())), [query, status]);
  return <Frame><div className={styles.dense}>
    <div className={styles.toolbar}>
      <FormField id={`${id}-q`} label="Search invoices"><Input type="search" value={query} onChange={event => setQuery(event.currentTarget.value)} /></FormField>
      <FormField id={`${id}-s`} label="Status"><Select value={status} onChange={event => setStatus(event.currentTarget.value)}><option value="all">All</option><option>Paid</option><option>Pending</option><option>Overdue</option></Select></FormField>
    </div>
    <p className={styles.muted} role="status">{rows.length} of {invoices.length} invoices</p>
    <Table caption="Invoices" emptyMessage="No invoices match." columns={[{ id: 'number', label: 'Invoice', rowHeader: true }, { id: 'customer', label: 'Customer' }, { id: 'status', label: 'Status' }, { id: 'amount', label: 'Amount' }]}
      rows={rows.map(([number, customer, state, amount]) => ({ id: number, cells: { number, customer, status: <Badge tone={tone[state]}>{state}</Badge>, amount: `$${amount.toLocaleString('en-US')}` } }))} />
  </div></Frame>;
}

export function MarketingLayout() {
  return <Frame><div className={styles.marketing}>
    <header className={styles.bar}><span className={styles.brand}>Northwind</span><nav aria-label="Marketing links"><Link href="#features">Features</Link><Link href="#pricing">Pricing</Link></nav><Button variant="secondary">Sign in</Button></header>
    <section className={styles.hero}><Badge tone="primary">New</Badge><h3>Plan work together, clearly.</h3><p>One shared place for projects, reviews, and decisions. This is sample marketing content for the layout.</p><div className={styles.actions}><Button>Get started</Button><Link href="#features">See how it works</Link></div></section>
    <div className={styles.cards} id="features">{[['Plan', 'Lay out projects in minutes.'], ['Review', 'Keep feedback in one place.'], ['Ship', 'Know exactly what is ready.']].map(([title, text]) => <Card key={title} variant="outlined"><h4 className={styles.heading}>{title}</h4><p>{text}</p></Card>)}</div>
  </div></Frame>;
}
