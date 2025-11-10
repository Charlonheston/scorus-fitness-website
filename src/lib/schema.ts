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
 * Datos actualizados desde Google My Business
 */
export function getLocalBusinessSchema(): SchemaBase & Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    '@id': `${SITE_CONFIG.url}/#organization`,
    name: 'Entrenador Personal en Alicante - ScorusFitness',
    alternateName: SITE_CONFIG.name,
    description: 'Entrenador personal y nutricionista con 25 años de experiencia. Campeón del mundo en físico culturismo. Más de 4,000 clientes entrenados.',
    url: SITE_CONFIG.url,
    telephone: '+34673975252',
    email: CONTACT_INFO.email,
    priceRange: '€€',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Av. Conrado Albaladejo, 31',
      addressLocality: 'Alicante',
      addressRegion: 'Alicante',
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
        opens: '07:00',
        closes: '20:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '07:00',
        closes: '14:00',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '167',
      bestRating: '5',
      worstRating: '1',
    },
    sameAs: [
      SOCIAL_LINKS.instagram,
      SOCIAL_LINKS.youtube,
      'https://www.facebook.com/scorusfitness',
      'https://www.linkedin.com/in/bernatscorus',
      'https://www.tiktok.com/@scorusfitness',
    ],
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

/**
 * Schema para FAQPage (Preguntas Frecuentes)
 */
export interface FAQ {
  question: string;
  answer: string;
}

export function getFAQPageSchema(faqs: FAQ[]): SchemaBase & Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Schema para VideoObject
 */
export function getVideoSchema(video: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: Date;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
}): SchemaBase & Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate.toISOString(),
    duration: video.duration,
    contentUrl: video.contentUrl,
    embedUrl: video.embedUrl,
  };
}

/**
 * Schema para Offer (ofertas de servicios/productos con precios)
 */
export function getOfferSchema(offer: {
  name: string;
  price: number | string;
  priceCurrency: string;
  description: string;
  url: string;
  availability?: string;
  validFrom?: Date;
  priceValidUntil?: Date;
}): SchemaBase & Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: offer.name,
    price: offer.price,
    priceCurrency: offer.priceCurrency,
    description: offer.description,
    url: offer.url,
    availability: offer.availability || 'https://schema.org/InStock',
    validFrom: offer.validFrom?.toISOString(),
    priceValidUntil: offer.priceValidUntil?.toISOString(),
  };
}

/**
 * Schema para EducationalOrganization (para Academia)
 */
export function getEducationalOrganizationSchema(): SchemaBase & Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${SITE_CONFIG.url}/academia#organization`,
    name: 'Scorus Academia',
    description:
      'Programas de formación y educación profesional en fitness, culturismo y entrenamiento. Talleres, seminarios y programas de transformación.',
    url: `${SITE_CONFIG.url}/es/academia`,
    provider: {
      '@id': `${SITE_CONFIG.url}/#organization`,
    },
  };
}

/**
 * Schema para Course (cursos individuales)
 */
export function getCourseSchema(course: {
  name: string;
  description: string;
  url: string;
  provider?: string;
}): SchemaBase & Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    url: course.url,
    provider: {
      '@id': course.provider || `${SITE_CONFIG.url}/#organization`,
    },
  };
}

/**
 * Schema para WebSite (para sitelinks de búsqueda en Google)
 */
export function getWebSiteSchema(lang: string = 'es'): SchemaBase & Record<string, any> {
  const langMap: Record<string, string> = {
    es: 'es_ES',
    en: 'en_US',
    fr: 'fr_FR',
    de: 'de_DE',
    hu: 'hu_HU',
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_CONFIG.url}/#website`,
    name: SITE_CONFIG.name,
    description: 'Entrenador personal y nutricionista con 25 años de experiencia. Campeón del mundo en culturismo. Servicios personalizados de entrenamiento y asesoramiento online.',
    url: SITE_CONFIG.url,
    inLanguage: langMap[lang] || 'es_ES',
    publisher: {
      '@id': `${SITE_CONFIG.url}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/${lang}/blog?buscar={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Schema para ImageGallery con ImageObjects
 */
export function getImageGallerySchema(images: Array<{
  url: string;
  caption?: string;
  description?: string;
}>): SchemaBase & Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'Galería de Scorus Fitness',
    description: 'Instalaciones del gimnasio boutique Scorus Fitness en Alicante',
    image: images.map((img) => ({
      '@type': 'ImageObject',
      contentUrl: img.url.startsWith('http') ? img.url : `${SITE_CONFIG.url}${img.url}`,
      caption: img.caption,
      description: img.description,
    })),
  };
}


