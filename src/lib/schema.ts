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
 * Datos alineados con Google Business Profile - Marzo 2026
 *
 * TODO: Rellenar legalName, taxID y companyRegistration con los datos fiscales reales.
 * TODO: Actualizar las URLs de image con fotos reales del gimnasio/entrenamiento.
 */
export function getLocalBusinessSchema(): SchemaBase & Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_CONFIG.url}/#localbusiness`,
    mainEntityOfPage: SITE_CONFIG.url,
    name: 'Entrenador Personal en Alicante - ScorusFitness',
    alternateName: SITE_CONFIG.name,
    description:
      'Transforma tu cuerpo en ScorusFitness Alicante con la metodología de Bernat Scorus, Campeón del Mundo de Culturismo. Con 25 años de experiencia y 4,000 clientes, ofrecemos un servicio de entrenamiento personal, nutrición y seguimiento online de élite. Especialistas en planes a medida para aumento de masa muscular y fuerza, adelgazamiento y pérdida de grasa, rehabilitación y preparación de oposiciones, y nutrición avanzada.',
    url: SITE_CONFIG.url,
    telephone: CONTACT_INFO.phone,
    email: CONTACT_INFO.email,
    slogan:
      'Empieza hoy tu cambio con un referente mundial del fitness. Entrenamiento personal, nutrición y seguimiento online de élite en Alicante.',

    // --- Datos legales ---
    legalName: 'SCORUSFITNESS SL.',
    taxID: 'B13802780',

    // --- Categorías de negocio (GMB) ---
    additionalType: [
      'https://schema.org/SportsActivityLocation',
      'https://schema.org/HealthAndBeautyBusiness',
    ],

    // --- Imágenes como ImageObject ---
    image: [
      {
        '@type': 'ImageObject',
        '@id': `${SITE_CONFIG.url}/#image-gym-1`,
        url: `${SITE_CONFIG.url}/images/gym/gym-scorus-fitness-alicante.webp`,
        name: 'Centro de entrenamiento personal Scorus Fitness en Alicante',
        caption:
          'Interior del centro privado de entrenamiento personal Scorus Fitness con equipamiento profesional en Playa de San Juan, Alicante.',
        inLanguage: 'es',
      },
      {
        '@type': 'ImageObject',
        '@id': `${SITE_CONFIG.url}/#image-training-1`,
        url: `${SITE_CONFIG.url}/images/services/entrenamiento-personal-alicante.webp`,
        name: 'Sesión de entrenamiento personal con Bernat Scorus',
        caption:
          'Bernat Scorus, campeón del mundo de culturismo, dirigiendo una sesión de entrenamiento personal en sus instalaciones de Alicante.',
        inLanguage: 'es',
      },
    ],
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE_CONFIG.url}/#logo-image`,
      url: `${SITE_CONFIG.url}/images/logos/logo-scorus.webp`,
      name: 'Logo Scorus Fitness',
      caption:
        'Logo oficial de Scorus Fitness, centro de entrenamiento personal en Alicante.',
      inLanguage: 'es',
    },

    // --- Económicos y pagos ---
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    paymentAccepted: ['BankTransfer', 'Bizum'],

    // --- Fechas ---
    foundingDate: '2014-10',

    // --- Dirección completa (alineada con GMB) ---
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Avenida Conrado Albaladejo 31',
      addressLocality: 'Alicante (Alacant)',
      postalCode: '03540',
      addressRegion: 'Comunidad Valenciana',
      addressCountry: {
        '@type': 'Country',
        name: 'ES',
      },
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 38.3452,
      longitude: -0.481,
    },

    // --- Zona de servicio ---
    areaServed: [
      { '@type': 'City', name: 'Alicante' },
      {
        '@type': 'Place',
        name: 'Playa de San Juan, Alicante (Alacant), Alicante, España',
      },
    ],

    // --- Horarios (alineados con GMB) ---
    openingHours: ['Mo-Fr 07:00-22:00', 'Sa 07:00-14:00'],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '07:00',
        closes: '22:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '07:00',
        closes: '14:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '00:00',
        closes: '00:00',
      },
    ],

    // --- Idiomas de servicio (según GMB: inglés y español) ---
    knowsLanguage: [
      { '@type': 'Language', name: 'Spanish', alternateName: 'es' },
      { '@type': 'Language', name: 'English', alternateName: 'en' },
    ],

    // --- Características del local (según GMB) ---
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Ducha', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Aseos', value: true },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Aparcamiento en la calle gratuito',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Aparcamiento propio',
        value: false,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Accesibilidad silla de ruedas',
        value: false,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Servicios en las instalaciones',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Servicios al aire libre',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Clases online',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Espacio seguro LGBTQ+',
        value: true,
      },
    ],

    // --- Se necesita cita ---
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/es/contacto`,
        actionPlatform: [
          'https://schema.org/DesktopWebPlatform',
          'https://schema.org/MobileWebPlatform',
        ],
      },
      result: {
        '@type': 'Reservation',
        name: 'Reservar cita de entrenamiento personal',
      },
    },

    // --- Servicios ofrecidos ---
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Entrenamiento Personal',
          description:
            'Sesiones de entrenamiento personalizado one-to-one en centro privado o al aire libre.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Nutrición y Dietética',
          description:
            'Planes de nutrición avanzada y dietas personalizadas adaptadas a tus objetivos.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Seguimiento Online',
          description:
            'Asesoramiento y entrenamiento online personalizado desde cualquier lugar.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Aumento de Masa Muscular y Fuerza',
          description:
            'Programas específicos para ganancia muscular y desarrollo de fuerza.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Adelgazamiento y Pérdida de Grasa',
          description:
            'Planes de entrenamiento y nutrición orientados a la pérdida de grasa.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Rehabilitación y Preparación de Oposiciones',
          description:
            'Programas adaptados para rehabilitación física y preparación de pruebas de oposiciones.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Talleres y Seminarios',
          description:
            'Talleres grupales y seminarios sobre entrenamiento, nutrición y culturismo.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Programa RE-BORN',
          description:
            'Programa de transformación física integral con entrenamiento y nutrición.',
        },
      },
    ],

    isAccessibleForFree: false,

    // --- Fundador ---
    founder: {
      '@type': 'Person',
      name: 'Bernat Richard Scorus',
      givenName: 'Bernat',
      familyName: 'Scorus',
      jobTitle: 'Certified Personal Trainer & Nutritionist',
      description:
        'Campeón del Mundo de Culturismo (NABBA 2006). Más de 27 años de experiencia en entrenamiento personal y nutrición deportiva. Escritor para revistas Iron Man y Muscular Development.',
      url: `${SITE_CONFIG.url}/es/biografia`,
      image: `${SITE_CONFIG.url}/images/bernat/bernat-scorus.jpg`,
    },

    // --- Redes sociales y perfiles externos ---
    sameAs: [
      SOCIAL_LINKS.instagram,
      SOCIAL_LINKS.youtube,
      SOCIAL_LINKS.tiktok,
      SOCIAL_LINKS.facebook,
      SOCIAL_LINKS.linkedin,
      'https://www.paginasamarillas.es/f/playa-de-san-juan/scorusfitness_231625922_000000001.html',
      'https://tuentrenador360.com/profesional/entrenador-personal-en-alicante-scorusfitness-alicante/',
      'https://www.einforma.com/informacion-empresa/scorusfitness',
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
    name: 'Bernat Richard Scorus',
    givenName: 'Bernat',
    additionalName: 'Richard',
    familyName: 'Scorus',
    jobTitle: 'Certified Personal Trainer & Nutritionist',
    description:
      'Campeón del Mundo de Culturismo (NABBA 2006). Entrenador personal certificado y nutricionista con más de 27 años de experiencia y más de 4,000 clientes satisfechos. Escritor para revistas Iron Man y Muscular Development.',
    image: `${SITE_CONFIG.url}/images/bernat/bernat-scorus.jpg`,
    url: `${SITE_CONFIG.url}/es/biografia`,
    telephone: CONTACT_INFO.phone,
    email: CONTACT_INFO.email,
    birthPlace: {
      '@type': 'Place',
      name: 'Hungary',
    },
    nationality: {
      '@type': 'Country',
      name: 'HU',
    },
    worksFor: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    workLocation: {
      '@type': 'Place',
      name: 'Alicante, Comunidad Valenciana, España',
    },
    knowsAbout: [
      'Entrenamiento personal',
      'Nutrición deportiva',
      'Culturismo',
      'Preparación física',
      'Suplementación deportiva',
      'Prevención de enfermedades',
      'Preparación de competiciones',
    ],
    knowsLanguage: [
      { '@type': 'Language', name: 'Spanish', alternateName: 'es' },
      { '@type': 'Language', name: 'English', alternateName: 'en' },
      { '@type': 'Language', name: 'Hungarian', alternateName: 'hu' },
    ],
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        name: 'Especialista en Ciencias del Entrenamiento y Lesiones Deportivas',
        credentialCategory: 'certificate',
        recognizedBy: {
          '@type': 'Organization',
          name: 'ICNS - Institución Científica de Nutrición y Salud',
        },
      },
      {
        '@type': 'EducationalOccupationalCredential',
        name: 'Fisicoculturismo y Fitness',
        credentialCategory: 'degree',
        recognizedBy: {
          '@type': 'Organization',
          name: 'Semmelweis University (Budapest)',
        },
      },
    ],
    award: [
      'Campeón del Mundo Absoluto NABBA (2006)',
      'NAC Mr. Universo 2º plaza (2009)',
      'Arnold Classic Columbus Ohio (2011)',
      'Arnold Classic Europe (2012)',
      'IFBB Amateur Mr. Olympia Master 2º plaza (2019)',
      'Campeón Junior Nacional de Hungría (2000)',
      'Campeón de Hungría +100kg (2001)',
      'Campeón de Austria +100kg (2005)',
    ],
    alumniOf: [
      {
        '@type': 'EducationalOrganization',
        name: 'ICNS - Institución Científica de Nutrición y Salud',
      },
      {
        '@type': 'EducationalOrganization',
        name: 'Semmelweis University',
      },
    ],
    sameAs: [
      'https://www.instagram.com/bernatscorus/',
      SOCIAL_LINKS.youtube,
      SOCIAL_LINKS.tiktok,
      SOCIAL_LINKS.facebook,
      SOCIAL_LINKS.linkedin,
    ],
  };
}

/**
 * Schema para BlogPosting con datos de autor enriquecidos desde Strapi
 */
export interface BlogPostAuthor {
  name: string;
  title?: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: Array<{ url: string; platform: string }>;
}

export function getBlogPostingSchema(post: {
  title: string;
  description: string;
  publishedDate: Date;
  modifiedDate?: Date;
  author: string | BlogPostAuthor;
  image?: string;
  url: string;
}): SchemaBase & Record<string, any> {
  const authorData =
    typeof post.author === 'string'
      ? { '@type': 'Person' as const, name: post.author }
      : buildAuthorSchema(post.author);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image || SITE_CONFIG.ogImage,
    datePublished: post.publishedDate.toISOString(),
    dateModified: (post.modifiedDate || post.publishedDate).toISOString(),
    author: authorData,
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/images/logos/logo-scorus.webp`,
      },
    },
    url: post.url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.url,
    },
  };
}

function buildAuthorSchema(author: BlogPostAuthor): Record<string, any> {
  const schema: Record<string, any> = {
    '@type': 'Person',
    name: author.name,
    url: `${SITE_CONFIG.url}/es/biografia`,
  };

  if (author.title) {
    schema.jobTitle = author.title;
  }

  if (author.bio) {
    schema.description = author.bio;
  }

  if (author.avatarUrl) {
    schema.image = author.avatarUrl;
  }

  if (author.socialLinks && author.socialLinks.length > 0) {
    schema.sameAs = author.socialLinks.map((link) => link.url);
  }

  return schema;
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
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
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
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
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
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };
}

/**
 * Schema para WebSite (para sitelinks de búsqueda en Google)
 */
export function getWebSiteSchema(lang: string = 'es'): SchemaBase & Record<string, any> {
  // Formato correcto para inLanguage según schema.org
  const langMap: Record<string, string> = {
    es: 'es',
    en: 'en',
    fr: 'fr',
    de: 'de',
    hu: 'hu',
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_CONFIG.url}/#website`,
    name: SITE_CONFIG.name,
    alternateName: 'ScorusFitness',
    description: 'Entrenador personal y nutricionista con 25 años de experiencia. Campeón del mundo en culturismo. Servicios personalizados de entrenamiento y asesoramiento online.',
    url: SITE_CONFIG.url,
    image: `${SITE_CONFIG.url}/og-image.jpg`,
    inLanguage: langMap[lang] || 'es',
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/images/logos/logo-scorus.webp`,
      },
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
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
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


