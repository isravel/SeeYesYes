'use client';
import { useRef, useState } from 'react';
import type { Theme } from '@/lib/contract/schema';
import { ThemeScope } from '@/components/theme/ThemeScope';
import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { AvatarGroup } from '@/components/ui/avatar-group';
import { Fieldset } from '@/components/ui/fieldset';
import { Highlight } from '@/components/ui/highlight';
import { Kbd } from '@/components/ui/kbd';
import { Level } from '@/components/ui/level';
import { LiveDot } from '@/components/ui/live-dot';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { RadioGroup } from '@/components/ui/radio-group';
import { Select } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Table } from '@/components/ui/table';
import { Tabs } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip } from '@/components/ui/tooltip';
import { IconButton } from '@/components/ui/icon-button';
import { SearchInput } from '@/components/ui/search-input';
import { Segmented } from '@/components/ui/segmented';
import { Chip } from '@/components/ui/chip';
import { CheckboxGroup } from '@/components/ui/checkbox-group';
import { InputOtp } from '@/components/ui/input-otp';
import { Combobox } from '@/components/ui/combobox';
import { Toast } from '@/components/ui/toast';
import { AnimatedBadge } from '@/components/ui/animated-badge';
import { ShinyText } from '@/components/ui/shiny-text';
import { RotatingWord } from '@/components/ui/rotating-word';
import { MenuToggle } from '@/components/ui/menu-toggle';
import { Logo } from '@/components/ui/logo';
import { FancyArrow } from '@/components/ui/fancy-arrow';
import { TiltCard } from '@/components/ui/tilt-card';
import { CardSwap } from '@/components/ui/card-swap';
import { MediaFrame } from '@/components/ui/media-frame';
import { Carousel } from '@/components/ui/carousel';
import { ShareButtons } from '@/components/ui/share-buttons';
import { Footer } from '@/components/ui/footer';
import { SectionHead } from '@/components/ui/section-head';
import { StatStrip } from '@/components/ui/stat-strip';
import { CtaPanel } from '@/components/ui/cta-panel';
import { Navbar } from '@/components/ui/navbar';
import { Hero } from '@/components/ui/hero';
import { FeatureBento } from '@/components/ui/feature-bento';
import { Testimonials } from '@/components/ui/testimonials';
import { AppBadges } from '@/components/ui/app-badges';
import { Instructor } from '@/components/ui/instructor';
import { Disclosure } from '@/components/ui/disclosure';
import { Accordion } from '@/components/ui/accordion';
import { Pagination } from '@/components/ui/pagination';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Popover } from '@/components/ui/popover';
import { Drawer } from '@/components/ui/drawer';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ListingFixture } from './ListingFixture';
import { Plus } from '@phosphor-icons/react';
import styles from './OverlayFixture.module.css';

const tabItems = [{ id: 'one', label: 'Overview', content: 'Overview content' }, { id: 'two', label: 'Details', content: 'Details content' }, { id: 'three', label: 'History', content: 'History content', disabled: true }];

/** Every X2 control in one scope, so browser checks can exercise real focus, layout and glass without the workspace shell. */
export function ControlsFixture({ theme, surface, appearance = 'light' }: { theme: Theme; surface: 'glass' | 'clean'; appearance?: 'light' | 'dark' }) {
  const [message, setMessage] = useState('');
  const [plan, setPlan] = useState('');
  const [query, setQuery] = useState('');
  const [view, setView] = useState('list');
  const [picked, setPicked] = useState<string[]>([]);
  const [tags, setTags] = useState(['Archived', 'Draft']);
  const [failing, setFailing] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpDone, setOtpDone] = useState('');
  const [country, setCountry] = useState<string | null>(null);
  const [page, setPage] = useState(6);
  const [open, setOpen] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [undone, setUndone] = useState(0);
  const [toastTries, setToastTries] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [wordsPaused, setWordsPaused] = useState(false);
  // A toast keeps the action it was queued with, so the attempt count lives in a ref rather than in a stale closure.
  const toastCalls = useRef(0);
  const scoped: Theme = { ...theme, effects: { ...theme.effects, surface } };
  return <main className={styles.main}><h1>Control checks</h1>
    <ThemeScope id="controls-scope" theme={scoped} appearance={appearance} className={styles.scope}>
      <section aria-label="Buttons" id="buttons">
        {(['primary', 'secondary', 'ghost', 'destructive', 'outline', 'soft', 'muted', 'solid', 'danger'] as const).map(variant => <Button key={variant} variant={variant}>{`Button ${variant}`}</Button>)}
        <Button loading>Saving</Button><Button disabled variant="outline">Unavailable</Button>
      </section>
      <section aria-label="Surfaces">
        <Card variant="elevated"><p>Outer card</p><Card><p>Inner card</p></Card></Card>
        <Badge tone="warning">4.8 rating</Badge><Badge tone="success">New</Badge>
        <Avatar initials="AB" alt="Ada B" ring />
        <Avatar initials="MC" alt="Maya Chen" src="/does-not-exist.png" />
      </section>
      <section aria-label="Toolbar">
        <Input aria-label="Search" size="small" /><Select aria-label="Sort" size="small"><option value="a">Newest</option><option value="b">Oldest</option></Select>
        <Input aria-label="Read only" readOnly defaultValue="Locked" />
      </section>
      <section aria-label="Growth">
        <FormField id="grow-field" label="Grow notes" helpText="Grows up to four lines." error={message === 'invalid' ? 'Add a note.' : undefined}>
          <Textarea autoGrow rows={2} maxRows={4} />
        </FormField>
        <Textarea aria-label="Fixed notes" rows={2} />
      </section>
      <section aria-label="Groups">
        <Fieldset legend="Contact details" helpText="How we reach you." error="Choose one way." required>
          <FormField id="group-phone" label="Phone"><Input type="tel" /></FormField>
          <Checkbox aria-label="Select all" indeterminate />
          <Switch label="Notifications" tone="neutral" />
        </Fieldset>
        <RadioGroup name="fixture-plan" label="Plan" value={plan} onChange={setPlan} options={[{ value: 'basic', label: 'Basic', hint: 'For one person' }, { value: 'team', label: 'Team', error: 'Needs an admin' }]} />
      </section>
      <section aria-label="Feedback">
        <Alert tone="destructive" variant="outline" title="Could not save">Try again in a moment.</Alert>
        <Alert tone="info" variant="text">Plain message</Alert>
        <Progress label="Upload" value={40} tone="neutral" /><Progress label="Scanning" />
        <Skeleton shape="rect" width="8rem" height="2rem" data-testid="skeleton" /><Spinner size="small" /><Separator decorative={false} />
      </section>
      <section aria-label="Navigation and data">
        <Tabs label="Line tabs" variant="line" items={tabItems} />
        <Tabs label="Boxed vertical tabs" variant="boxed" orientation="vertical" items={tabItems} />
        <Table caption="Stock" header="plain" rowHover columns={[{ id: 'name', label: 'Name', rowHeader: true }, { id: 'qty', label: 'Quantity' }]} rows={[{ id: '1', cells: { name: 'Apples', qty: '3' } }]} />
      </section>
      <section aria-label="Display" id="display">
        <p id="highlight-line">Your export includes <Highlight data-testid="highlight">every saved theme</Highlight> in this workspace.</p>
        <p><Level tone="success">Easy</Level> <Level tone="warning">Medium</Level> <Level tone="destructive">Hard</Level> <Level tone="info">Custom label</Level></p>
        <p><LiveDot animated data-testid="live-animated">Live now</LiveDot> <LiveDot status="inactive" size="medium">Offline</LiveDot> <LiveDot data-testid="live-static">Scheduled</LiveDot></p>
        <p id="kbd-line">Press <Kbd keys={['Ctrl', 'K']} /> to search, or <Kbd size="medium">Esc</Kbd> to close.</p>
        <AvatarGroup label="Project members" data-testid="group" people={[{ initials: 'MC', alt: 'Maya Chen' }, { initials: 'AB', alt: 'Ada Bell' }, { initials: 'JO', alt: 'Jon Ortiz' }, { initials: 'LK', alt: 'Lena Koh' }, { initials: 'TS', alt: 'Tariq Shah' }, { initials: 'NP', alt: 'Nia Park' }]} />
        <AvatarGroup label="Reviewers with list" max={2} overflowContent={close => <><ul><li>Jon Ortiz</li><li>Lena Koh</li></ul><button type="button" onClick={close}>Close list</button></>} people={[{ initials: 'MC', alt: 'Maya Chen' }, { initials: 'AB', alt: 'Ada Bell' }, { initials: 'JO', alt: 'Jon Ortiz' }, { initials: 'LK', alt: 'Lena Koh' }]} />
        <AvatarGroup label="Two reviewers" size="small" people={[{ initials: 'MC', alt: 'Maya Chen' }, { initials: 'AB', alt: 'Ada Bell' }]} />
      </section>
      <section aria-label="Form controls" id="x3-controls">
        <IconButton label="Add member" tooltip="Add member" icon={<Plus />} onClick={() => setMessage('added')} />
        <IconButton label="Pin item" variant="outline" size="small" pressed={view === 'pinned'} icon={<Plus />} onClick={() => setView(view === 'pinned' ? 'list' : 'pinned')} />
        <IconButton label="Saving item" loading icon={<Plus />} />
        <IconButton label="Unavailable item" disabled icon={<Plus />} />
        <SearchInput label="Search members" value={query} onChange={setQuery} placeholder="Search members" />
        <SearchInput label="Searching members" defaultValue="Maya" searching />
        <Segmented label="View" value={view === 'pinned' ? 'list' : view} onChange={setView} options={[{ value: 'list', label: 'List' }, { value: 'grid', label: 'Grid' }, { value: 'map', label: 'Map', disabled: true }]} />
        <Chip tone="info">Design</Chip>
        <Chip onSelectedChange={() => undefined}>In stock</Chip>
        {tags.map(tag => <Chip key={tag} onRemove={() => setTags(list => list.filter(item => item !== tag))}>{tag}</Chip>)}
        <Chip onRemove={() => setFailing(true)} error={failing ? 'Could not remove. Try again.' : undefined}>Pinned tag</Chip>
        <CheckboxGroup name="channels" label="Notify me by" value={picked} onChange={setPicked} helpText="Choose any." error={picked.length === 0 && message === 'submit' ? 'Choose at least one.' : undefined}
          options={[{ value: 'email', label: 'Email' }, { value: 'sms', label: 'Text message', hint: 'Carrier rates may apply.' }, { value: 'push', label: 'Push', disabled: true }]} />
        <p data-testid="x3-picked">{picked.join(',')}|{view}</p>
        <InputOtp name="otp" label="Verification code" helpText="Enter the 6-digit code." value={otp} onChange={setOtp} onComplete={code => setOtpDone(code)} error={otp.length === 6 && otp !== '123456' ? 'That code is not right.' : undefined} />
        <InputOtp label="Masked code" length={4} masked defaultValue="12" />
        <InputOtp label="Locked code" defaultValue="123456" readOnly />
        <InputOtp label="Unavailable code" disabled />
        <p data-testid="x3-otp">{otp}|{otpDone}</p>
        <Combobox name="country" label="Country" placeholder="Search countries" helpText="Type to filter." value={country} onChange={setCountry}
          options={[{ value: 'in', label: 'India', group: 'Asia' }, { value: 'jp', label: 'Japan', group: 'Asia' }, { value: 'fr', label: 'France', group: 'Europe' }, { value: 'de', label: 'Germany', group: 'Europe', disabled: true }]} />
        <Combobox label="Searching country" loading options={[]} />
        <Combobox label="Locked country" defaultValue="jp" readOnly options={[{ value: 'jp', label: 'Japan' }]} />
        <Combobox label="Unavailable country" disabled options={[{ value: 'jp', label: 'Japan' }]} />
        <Combobox label="Invalid country" error="Choose a country from the list." options={[{ value: 'jp', label: 'Japan' }]} />
        <p data-testid="x3-country">{country ?? 'none'}</p>
      </section>
      <section aria-label="Disclosure and navigation" id="x3-compositions">
        <Disclosure label="Shipping details" data-testid="click-disclosure"><button type="button">Inside the panel</button></Disclosure>
        <Disclosure label="Hover preview" openOnHover data-testid="hover-disclosure"><p>Preview content</p></Disclosure>
        <Accordion headingLevel={3} items={[{ id: 'one', label: 'Shipping', content: 'Ships fast.' }, { id: 'two', label: 'Returns', content: 'Return in thirty days.' }, { id: 'three', label: 'Support', content: 'Write to us.', disabled: true }]} />
        <Accordion mode="multiple" value={open} onChange={setOpen} items={[{ id: 'm1', label: 'First multiple', content: 'One.' }, { id: 'm2', label: 'Second multiple', content: 'Two.' }]} />
        <Accordion collapsible={false} defaultValue={['k1']} items={[{ id: 'k1', label: 'Always one', content: 'Kept open.' }, { id: 'k2', label: 'Other', content: 'Other content.' }]} />
        <Pagination label="Results pages" pageCount={12} page={page} onPageChange={setPage} />
        <Pagination label="Linked pages" pageCount={3} defaultPage={2} getHref={target => `#page-${target}`} />
        <Breadcrumbs label="Trail" items={[{ label: 'Components', href: '/components' }, { label: 'Navigation', href: '#navigation' }, { label: 'Breadcrumbs', href: '#breadcrumbs' }]} />
        <Breadcrumbs label="Long trail" separator="chevron" items={[{ label: 'Workspace with a very long name that must wrap', href: '#one' }, { label: 'Another long section name to force wrapping', href: '#two' }, { label: 'Yet another deeply nested destination', href: '#three' }, { label: 'Current page with a long title', href: '#four' }]} />
        <p data-testid="x3-page">{page}|{open.join(',')}</p>
      </section>
      <section aria-label="Popover and drawer" id="x3-panels">
        <Popover triggerLabel="Filter options" label="Filter options">{close => <><label>Name filter <input type="text" /></label><button type="button" onClick={close}>Apply filters</button></>}</Popover>
        <Drawer triggerLabel="Open right drawer" title="Right filters">{close => <><label>Search <input type="text" /></label><button type="button" onClick={close}>Done</button></>}</Drawer>
        <Drawer triggerLabel="Open left drawer" title="Left filters" side="left" size="small"><p>Left content.</p></Drawer>
        <Drawer triggerLabel="Open bottom drawer" title="Bottom filters" side="bottom"><p>Bottom content.</p></Drawer>
        <Drawer triggerLabel="Open required drawer" title="Required drawer" dismissOnOutsidePress={false} closeOnEscape={false} closeLabel="Finish drawer"><p>Finish this first.</p></Drawer>
      </section>
      <section aria-label="Toasts" id="x3-toasts">
        <Toast triggerLabel="Show info toast" message="Saved to drafts." />
        <Toast triggerLabel="Show success toast" tone="success" title="Done" message="Project archived." />
        <Toast triggerLabel="Show warning toast" tone="warning" message="Storage is almost full." timeout={1200} />
        <Toast triggerLabel="Show error toast" tone="destructive" message="Could not sync." timeout={1200} />
        <Toast triggerLabel="Show quick toast" message="Quick note." timeout={600} />
        <Toast triggerLabel="Show undo toast" tone="success" message="Member removed." actionLabel="Undo" onAction={() => setUndone(count => count + 1)} />
        <Toast triggerLabel="Show retry toast" tone="destructive" message="Upload failed." actionLabel="Retry" actionErrorMessage="Still offline. Try again." onAction={async () => { toastCalls.current += 1; setToastTries(toastCalls.current); if (toastCalls.current < 2) throw new Error('offline'); }} />
        <Toast triggerLabel="Show top toast" message="Top note." position="top-end" />
        <Toast triggerLabel="Unavailable toast" message="Never shown." disabled />
        <p data-testid="x3-toast">{undone}|{toastTries}</p>
      </section>
      <section aria-label="Effects" id="x4-effects">
        <p><AnimatedBadge animated tone="primary" data-testid="badge-animated">Featured</AnimatedBadge> <AnimatedBadge data-testid="badge-static" tone="success">Ready</AnimatedBadge></p>
        <p id="shiny-line">Ship <ShinyText animated data-testid="shiny-animated">faster</ShinyText> with <ShinyText data-testid="shiny-static">one system</ShinyText></p>
        <h2 id="rotating-line">Built for <RotatingWord animated interval={1000} paused={wordsPaused} words={['teams', 'designers', 'a very long word indeed']} data-testid="rotating" /></h2>
        <p>Plain <RotatingWord words={['alpha', 'beta']} data-testid="rotating-static" /> and one <RotatingWord words={['solo']} animated data-testid="rotating-solo" /></p>
        <Button onClick={() => setWordsPaused(value => !value)}>{wordsPaused ? 'Resume words' : 'Pause words'}</Button>
        <MenuToggle label="Site menu" controls="x4-menu" expanded={menuOpen} onExpandedChange={setMenuOpen} />
        <MenuToggle label="Small menu" size="small" defaultExpanded animated={false} />
        <MenuToggle label="Unavailable menu" size="large" disabled />
        <nav id="x4-menu" aria-label="Site" hidden={!menuOpen}><a href="#x4-effects">Overview</a></nav>
      </section>
      <section aria-label="Media and cards" id="x4-media">
        <p>
          <Logo label="Acme" src="/sample-mark.svg" wordmark="Acme" data-testid="logo-image" />{' '}
          <Logo label="Acme" mark={<svg viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="5" fill="currentColor" /></svg>} size="large" animated data-testid="logo-inline" />{' '}
          <Logo label="Broken brand" src="/missing-mark.svg" data-testid="logo-broken" />{' '}
          <Logo label="Label only" size="small" data-testid="logo-text" />
        </p>
        <div id="arrow-area" style={{ position: 'relative', minHeight: 96 }}>
          <p>Start here <FancyArrow src="/sample-arrow.svg" data-testid="arrow-inline" /> <FancyArrow src="/sample-arrow.svg" alt="Next step" direction="down" data-testid="arrow-named" /> <FancyArrow src="/missing-arrow.svg" data-testid="arrow-broken" /></p>
          <FancyArrow src="/sample-arrow.svg" placement="bottom-end" direction="left" data-testid="arrow-corner" />
        </div>
        <TiltCard tilt depth data-testid="tilt-on"><h3>Tilting card</h3><p data-tilt-layer>Layer text.</p><Button>Inside action</Button></TiltCard>
        <TiltCard data-testid="tilt-off"><h3>Plain card</h3><p>No tilt.</p></TiltCard>
        <CardSwap label="Highlights" data-testid="swap" items={[{ id: 'fast', content: <><h3>Fast</h3><Button>Fast action</Button></> }, { id: 'accessible', content: <h3>Accessible</h3> }, { id: 'themed', content: <h3>Themed with a much longer heading that wraps onto several lines in a narrow card</h3> }]} />
        <CardSwap label="Auto highlights" autoplay interval={3000} data-testid="swap-auto" items={[{ id: 'one', content: <h3>One</h3> }, { id: 'two', content: <h3>Two</h3> }]} />
        <Carousel label="Featured" data-testid="carousel" items={[{ id: 'one', content: <Card><h3>One</h3><Button>One action</Button></Card> }, { id: 'two', content: <Card><h3>Two</h3></Card> }, { id: 'three', content: <Card><h3>Three</h3></Card> }, { id: 'four', content: <Card><h3>Four</h3><Button>Four action</Button></Card> }]} />
        <Carousel label="Auto featured" autoplay edgeFade peek data-testid="carousel-auto" items={[{ id: 'a', content: <Card><h3>Alpha</h3></Card> }, { id: 'b', content: <Card><h3>Beta</h3></Card> }, { id: 'c', content: <Card><h3>Gamma</h3></Card> }]} />
        <Carousel label="Single" data-testid="carousel-one" items={[{ id: 'only', content: <Card><h3>Only slide</h3></Card> }]} />
        <Carousel label="Empty" data-testid="carousel-empty" items={[]} />
        <MediaFrame src="/sample-media.svg" alt="A green hillside under a pale sky" caption="Hillside at midday" data-testid="media-ok" />
        <MediaFrame src="/sample-media.svg" alt="Square hillside" ratio="1:1" fit="contain" hover="zoom" vignette data-testid="media-square" />
        <MediaFrame src="/missing-media.png" alt="Missing picture" caption="Nothing loaded" data-testid="media-broken" />
      </section>
      <section aria-label="Page sections" id="x5-sections">
        <SectionHead heading="Featured guides" subtitle="Start with the basics." viewAllHref="/docs" level={2} data-testid="head-link" />
        <SectionHead heading="Plain heading" level={3} data-testid="head-plain" />
        <SectionHead heading="A much longer section heading that has to wrap onto several lines on a narrow screen" subtitle="With a subtitle that is also fairly long so it wraps too." viewAllHref="/docs" viewAllLabel="See every guide" level={3} data-testid="head-long" />
        <ShareButtons url="https://example.com/guide?lang=en&ref=a%26b#install" title="Guide: A & B" data-testid="share" />
        <ShareButtons url="/docs?tab=one#top" attribution={false} size="small" label="Share this page" data-testid="share-relative" />
        <ShareButtons url="mailto:team@example.com" size="large" label="Share unavailable" data-testid="share-unavailable" />
        <StatStrip data-testid="stats" items={[{ id: 'members', label: 'Team members', value: '24' }, { id: 'projects', label: 'Active projects', value: '9' }, { id: 'regions', label: 'Regions' }, { id: 'long', label: 'A label that is long enough to wrap in a narrow column', value: '1,234,567' }]} />
        <CtaPanel heading="Ready to start?" description="Create a workspace in a minute." action={<Button>Create workspace</Button>} level={2} data-testid="cta" />
        <CtaPanel heading="Textured panel" texture level={3} action={<Button variant="outline">Read the guide</Button>} data-testid="cta-texture" />
        <Footer data-testid="footer" identity={<p>Acme helps teams ship consistent interfaces.</p>} legal="© Acme" columns={[
          { id: 'product', heading: 'Product', links: [{ label: 'Components', href: '/components' }, { label: 'Docs', href: '/docs' }] },
          { id: 'company', heading: 'Company', links: [{ label: 'Publisher site', href: 'https://example.com', external: true }] },
          { id: 'legal', heading: 'Legal', links: [{ label: 'Terms of service and a very long policy name that must wrap', href: '#terms' }] },
          { id: 'extra', heading: 'More', links: [{ label: 'Status', href: '#status' }] },
          { id: 'hidden', heading: 'Fifth column', links: [{ label: 'Never shown', href: '#never' }] },
        ]} />
        <Navbar data-testid="navbar" sticky={false} label="Fixture main" brand={<a href="/">Acme</a>} currentHref="/docs" actions={<Button>Get started</Button>} groups={[
          { id: 'main', links: [{ label: 'Components', href: '/components' }, { label: 'Docs', href: '/docs' }] },
          { id: 'more', label: 'More', links: [{ label: 'Publisher site', href: 'https://example.com', external: true }, { label: 'Empty', href: '/empty' }] },
          { id: 'none', links: [] },
        ]} />
        <Hero data-testid="hero-centered" level={2} badge={<Badge>New</Badge>} heading={<>Ship a <Highlight>consistent</Highlight> interface with an unreasonably long heading that has to wrap</>} lead="Reusable parts that keep every screen accessible." actions={<Button>Get started</Button>} />
        <Hero data-testid="hero-split" level={2} heading="Split hero" lead="Text first, media second." media={<MediaFrame src="/sample-media.svg" alt="A green hillside under a pale sky" />} />
        <Hero data-testid="hero-forced" level={2} heading="Forced centered" layout="centered" media={<MediaFrame src="/sample-media.svg" alt="A green hillside under a pale sky" />} />
        <FeatureBento data-testid="bento" label="Fixture highlights" level={3} layout="three-over-four" items={[
          { id: 'f1', title: 'Shared tokens', description: 'One source for color and spacing.', href: '/system/tokens' },
          { id: 'f2', title: 'Accessible by default', badge: 'Built in' },
          { id: 'f3', title: 'Readable contracts', href: '/docs', linkLabel: 'Read more' },
          { id: 'f4', title: 'Four' }, { id: 'f5', title: 'Five' }, { id: 'f6', title: 'Six' }, { id: 'f7', title: 'Seven' }, { id: 'f8', title: 'Eight' },
        ]} />
        <Testimonials data-testid="voices" items={[
          { kind: 'review', id: 'r1', quote: 'Setup took an afternoon.', author: { name: 'Priya Nair', role: 'Engineering lead' }, source: 'Customer survey' },
          { kind: 'story', id: 's1', src: '/sample-story.webm', title: 'How we adopted it', author: { name: 'Sam Okoye' }, captions: { src: '/sample-captions.vtt', srclang: 'en' } },
          { kind: 'story', id: 's2', src: '/missing-story.webm', title: 'Broken story', author: { name: 'Lee Park' }, captions: { src: '/sample-captions.vtt', srclang: 'en' } },
        ]} />
        <AppBadges data-testid="badges" size="large" badges={[
          { id: 'ios', store: 'app-store', href: 'https://example.com/ios', src: '/sample-badge.svg' },
          { id: 'android', store: 'google-play', href: 'https://example.com/android', src: '/sample-badge.svg', label: 'Get Acme on Google Play' },
          { id: 'broken', store: 'app-store', href: 'https://example.com/broken', src: '/missing-badge.svg', label: 'Broken badge' },
        ]} />
        <Instructor data-testid="instructor" level={3} name="Maya Chen" role="Lead instructor" bio={<p>Maya teaches interface design.</p>} portrait={{ src: '/sample-avatar.svg', alt: 'Portrait of Maya Chen' }} socials={[{ id: 'site', label: 'Website', href: 'https://example.com' }]} />
        <Instructor data-testid="instructor-broken" level={3} name="Broken Portrait" portrait={{ src: '/missing-portrait.png', alt: 'Missing portrait' }} />
        <Instructor data-testid="instructor-text" level={3} name="Text Only" />
      </section>
      <section aria-label="Listing kit" id="x6-listings"><ListingFixture /></section>
      <section aria-label="Confirm dialogs" id="x3-confirm">
        <ConfirmDialog triggerLabel="Archive project" title="Archive this project?" confirmLabel="Archive project" onConfirm={() => setConfirmed('archived')}><p>The project moves to the archive.</p></ConfirmDialog>
        <ConfirmDialog triggerLabel="Delete project" title="Delete Orchard?" confirmLabel="Delete project" destructive confirmText="Orchard" onConfirm={() => new Promise<void>(resolve => setTimeout(() => { setConfirmed('deleted'); resolve(); }, 400))}><p>This removes the project for everyone.</p></ConfirmDialog>
        <ConfirmDialog triggerLabel="Remove member" title="Remove Ada Bell?" confirmLabel="Remove member" errorMessage="Could not remove the member. Try again." confirmText="Ada" onConfirm={async () => { setAttempts(count => count + 1); if (attempts < 1) throw new Error('offline'); setConfirmed('removed'); }}><p>Ada Bell loses access.</p></ConfirmDialog>
        <p data-testid="x3-confirmed">{confirmed}|{attempts}</p>
      </section>
      <section aria-label="Overlays">
        <Dialog triggerLabel="Open glass dialog" title="Glass dialog" closeLabel="Close glass dialog"><p>Panel over a scrim.</p></Dialog>
        <DropdownMenu triggerLabel="Open glass menu" items={[{ id: 'save', label: 'Save' }, { id: 'delete', label: 'Delete', destructive: true }]} onAction={setMessage} />
        <DropdownMenu triggerLabel="Open grouped menu" onAction={setMessage} items={[
          { type: 'group', id: 'file', label: 'File', items: [{ id: 'open', label: 'Open' }, { id: 'rename', label: 'Rename', disabled: true }] },
          { type: 'separator', id: 'sep-1' },
          { type: 'group', id: 'help', label: 'Help', items: [{ id: 'docs', label: 'Read the docs', href: '/docs' }, { id: 'site', label: 'Publisher site', href: 'https://example.com', external: true }] },
          { type: 'separator', id: 'sep-2' },
          { type: 'group', id: 'empty-group', label: 'Hidden group', items: [] },
          { id: 'remove', label: 'Remove everything permanently from this workspace and every connected project', destructive: true },
          { type: 'separator', id: 'sep-trailing' },
        ]} />
        <DropdownMenu triggerLabel="Open empty menu" items={[]} onAction={setMessage} />
        <Tooltip triggerLabel="Glass tooltip trigger" content="Short label" delay={0} onPress={() => setMessage('pressed')} />
        <p role="status" data-testid="menu-status">{message}</p>
      </section>
    </ThemeScope>
  </main>;
}
