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
 * Datos actualizados desde Google My Business - Febrero 2026
 */
export function getLocalBusinessSchema(): SchemaBase & Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    '@id': `${SITE_CONFIG.url}/#organization`,
    name: 'Entrenador Personal en Alicante - ScorusFitness',
    alternateName: SITE_CONFIG.name,
    description: 'En ScorusFitness, te ofrecemos los servicios de Bernat Scorus, entrenador personal y nutricionista, quien es campeón del mundo en físico culturismo y cuenta con 25 años de experiencia en el sector, habiendo trabajado con más de 4,000 clientes satisfechos. Ofrecemos planes personalizados que incluyen rutinas de entrenamiento y dietas adaptadas a tus necesidades, consultas online, y entrenamiento personal.',
    url: SITE_CONFIG.url,
    telephone: '+34673975252',
    email: CONTACT_INFO.email,
    priceRange: '€€',
    foundingDate: '2014-10',
    // Categorías de negocio
    additionalType: [
      'https://schema.org/HealthAndBeautyBusiness',
      'https://schema.org/SportsActivityLocation',
    ],
    // Dirección
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Avenida Conrado Albaladejo 31',
      addressLocality: 'Alicante (Alacant)',
      addressRegion: 'Alicante',
      postalCode: '03540',
      addressCountry: 'ES',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 38.3452,
      longitude: -0.4810,
    },
    // Zona de servicio
    areaServed: {
      '@type': 'Place',
      name: 'Playa de San Juan, Alicante, España',
    },
    // Horarios de Google My Business
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
    // Valoraciones de Google
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '167',
      bestRating: '5',
      worstRating: '1',
    },
    // Idiomas disponibles
    availableLanguage: ['es', 'en'],
    // Características del negocio
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Ducha', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Aseos', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Aparcamiento en la calle gratuito', value: true },
    ],
    // Servicios ofrecidos
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Entrenamiento Personal',
          description: 'Entrenamiento personalizado en instalaciones o al aire libre',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Asesoramiento Nutricional',
          description: 'Dietas personalizadas adaptadas a tus objetivos',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Clases Online',
          description: 'Consultas y entrenamiento online',
        },
      },
    ],
    // Políticas
    isAccessibleForFree: false,
    // Redes sociales actualizadas
    sameAs: [
      'https://www.instagram.com/bernatscorus/',
      'https://www.youtube.com/@ScorusFitness',
      'https://www.tiktok.com/@scorusfitness_',
      'https://www.facebook.com/ScorusFitness',
      'https://www.linkedin.com/in/bernat-richard-scorus-58478b92/',
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

/**
 * Schema para AggregateRating de un servicio
 */
export interface AggregateRatingData {
  ratingValue: string;
  reviewCount: string;
  bestRating?: string;
  worstRating?: string;
}

export function getAggregateRatingSchema(rating: AggregateRatingData): Record<string, any> {
  return {
    '@type': 'AggregateRating',
    ratingValue: rating.ratingValue,
    reviewCount: rating.reviewCount,
    bestRating: rating.bestRating || '5',
    worstRating: rating.worstRating || '1',
  };
}

/**
 * Schema para Service con AggregateRating incluido
 */
export function getServiceWithRatingSchema(params: {
  name: string;
  description: string;
  url: string;
  image?: string;
  aggregateRating: AggregateRatingData;
  priceRange?: string;
}): SchemaBase & Record<string, any> {
  const schema: SchemaBase & Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: params.name,
    description: params.description,
    url: params.url,
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${SITE_CONFIG.url}/#localbusiness`,
      name: SITE_CONFIG.name,
    },
    areaServed: {
      '@type': 'City',
      name: 'Alicante',
    },
    aggregateRating: getAggregateRatingSchema(params.aggregateRating),
  };

  if (params.image) {
    schema.image = params.image;
  }

  if (params.priceRange) {
    schema.priceRange = params.priceRange;
  }

  return schema;
}


