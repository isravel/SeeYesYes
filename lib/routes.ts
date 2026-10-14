/** Page routes navigate client-side. API routes and files such as /robots.txt are plain links. */
export const isPageRoute = (href: string) => href.startsWith('/') && !href.startsWith('/api/') && !/\.[a-z0-9]+$/i.test(href.split(/[?#]/)[0]);
