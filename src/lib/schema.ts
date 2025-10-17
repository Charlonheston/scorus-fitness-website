/**
 * Helpers para Schema.org structured data
 */

import { SITE_CONFIG, CONTACT_INFO, SOCIAL_LINKS } from './constants';

interface SchemaBase {
  '@context': string;
  '@type': string;
}

/**
 * Schema para LocalBusiness (Scorus Fitness)
 */
export function getLocalBusinessSchema(): SchemaBase & Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    '@id': `${SITE_CONFIG.url}/#organization`,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    telephone: CONTACT_INFO.phone,
    email: CONTACT_INFO.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Av. Conrado Albaladejo, 31',
      addressLocality: 'Alicante',
      postalCode: '03540',
      addressCountry: 'ES',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 38.3452,
      longitude: -0.4810,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '10:00',
        closes: '14:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '15:00',
        closes: '22:00',
      },
    ],
    sameAs: [SOCIAL_LINKS.instagram, SOCIAL_LINKS.youtube],
  };
}

/**
 * Schema para Person (Bernat Scorus)
 */
export function getPersonSchema(): SchemaBase & Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_CONFIG.url}/#person`,
    name: 'Bernat Scorus',
    jobTitle: 'Entrenador Personal y Culturista Profesional',
    worksFor: {
      '@id': `${SITE_CONFIG.url}/#organization`,
    },
    url: SITE_CONFIG.url,
    sameAs: [SOCIAL_LINKS.instagram, SOCIAL_LINKS.youtube],
  };
}

/**
 * Schema para BlogPosting
 */
export function getBlogPostingSchema(post: {
  title: string;
  description: string;
  publishedDate: Date;
  modifiedDate?: Date;
  author: string;
  image?: string;
  url: string;
}): SchemaBase & Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image || SITE_CONFIG.ogImage,
    datePublished: post.publishedDate.toISOString(),
    dateModified: (post.modifiedDate || post.publishedDate).toISOString(),
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@id': `${SITE_CONFIG.url}/#organization`,
    },
    url: post.url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.url,
    },
  };
}

/**
 * Schema para Service
 */
export function getServiceSchema(service: {
  name: string;
  description: string;
  image?: string;
  url: string;
}): SchemaBase & Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    image: service.image,
    url: service.url,
    provider: {
      '@id': `${SITE_CONFIG.url}/#organization`,
    },
  };
}

/**
 * Schema para BreadcrumbList
 */
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

