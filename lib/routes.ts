/** Page routes navigate client-side. API routes and files such as /robots.txt are plain links. */
export const isPageRoute = (href: string) => {
  if (!href.startsWith('/') || href.startsWith('/api/')) return false;
  // `split` always yields at least one segment, but reading it defensively keeps this valid for
  // consumers compiling with `noUncheckedIndexedAccess`.
  const [path = ''] = href.split(/[?#]/);
  return !/\.[a-z0-9]+$/i.test(path);
};
