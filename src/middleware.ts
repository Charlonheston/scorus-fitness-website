import { defineMiddleware } from 'astro:middleware';

const VALID_PREFIXES = ['/es', '/en', '/de', '/fr', '/hu', '/api', '/_astro', '/_image', '/images', '/fonts', '/sitemap', '/robots.txt', '/favicon'];

const STATIC_EXTENSIONS = /\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot|mp4|webm|json|xml|txt|map)$/i;

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  if (pathname === '/' || pathname === '') {
    return next();
  }

  if (STATIC_EXTENSIONS.test(pathname)) {
    return next();
  }

  const hasValidPrefix = VALID_PREFIXES.some(prefix => pathname.startsWith(prefix));
  if (hasValidPrefix) {
    return next();
  }

  const response = await next();

  if (response.status === 404) {
    return context.redirect('/es', 301);
  }

  return response;
});
