/**
 * Constantes del sitio Scorus Fitness
 */

import type { SiteConfig, ContactInfo, SocialLinks } from '@/types/index';

export const SITE_CONFIG: SiteConfig = {
  name: 'Scorus Fitness',
  description: 'Entrenamiento personal y gimnasio en Alicante. Transforma tu cuerpo y mente.',
  url: 'https://scorusfitness.com',
  ogImage: 'https://scorusfitness.com/og-image.jpg',
  links: {
    instagram: 'https://instagram.com/bernatscorus',
    youtube: 'https://youtube.com/@ScorusFitness',
  },
};

export const CONTACT_INFO: ContactInfo = {
  address: 'Av. Conrado Albaladejo, 31 – 03540 Alicante, España',
  phone: '+34 673 97 52 52',
  email: 'info@scorusfitness.com',
  schedule: {
    weekdays: 'Lunes - Viernes',
    hours: '10:00 - 14:00; 15:00 - 22:00',
  },
};

export const SOCIAL_LINKS: SocialLinks = {
  instagram: 'https://instagram.com/bernatscorus',
  youtube: 'https://youtube.com/@ScorusFitness',
};

// Metadatos default para SEO
export const DEFAULT_SEO = {
  title: 'Scorus Fitness | Entrenamiento Personal en Alicante',
  description:
    'Centro de entrenamiento personal y gimnasio en Alicante. Programas personalizados, RE-BORN, Scorus Campus. Transforma tu cuerpo con Bernat Scorus.',
  keywords: [
    'entrenamiento personal',
    'gimnasio alicante',
    'bernat scorus',
    'culturismo',
    'fitness',
    'transformación física',
  ],
};

// Categorías del blog
export const BLOG_CATEGORIES = [
  { slug: 'nutricion', name: 'Nutrición' },
  { slug: 'culturismo', name: 'Culturismo' },
  { slug: 'cuidado-personal', name: 'Cuidado Personal' },
  { slug: 'rutinas', name: 'Rutinas de Entrenamiento' },
] as const;

