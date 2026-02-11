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
    instagram: 'https://www.instagram.com/bernatscorus/',
    youtube: 'https://www.youtube.com/@ScorusFitness',
    tiktok: 'https://www.tiktok.com/@scorusfitness_',
    facebook: 'https://www.facebook.com/ScorusFitness',
    linkedin: 'https://www.linkedin.com/in/bernat-richard-scorus-58478b92/',
    whatsapp: 'https://wa.me/34673975252',
  },
};

export const CONTACT_INFO: ContactInfo = {
  address: 'Avenida Conrado Albaladejo 31, 03540 Alicante (Alacant), Alicante',
  phone: '+34 673 97 52 52',
  email: 'info@scorusfitness.com',
  schedule: {
    weekdays: 'Lunes - Viernes: 7:00 - 20:30',
    saturday: 'Sábado: 7:00 - 14:00',
    sunday: 'Domingo: Cerrado',
  },
};

export const SOCIAL_LINKS: SocialLinks = {
  instagram: 'https://www.instagram.com/bernatscorus/',
  youtube: 'https://www.youtube.com/@ScorusFitness',
  tiktok: 'https://www.tiktok.com/@scorusfitness_',
  facebook: 'https://www.facebook.com/ScorusFitness',
  linkedin: 'https://www.linkedin.com/in/bernat-richard-scorus-58478b92/',
  whatsapp: 'https://wa.me/34673975252',
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

