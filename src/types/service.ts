/**
 * Tipos relacionados con servicios y programas
 */

export interface Service {
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  icon?: string;
  image?: string;
  price?: {
    amount: number;
    currency: string;
    period?: string;
  };
  features?: string[];
  cta?: {
    text: string;
    link: string;
  };
}

export interface Program {
  slug: string;
  title: string;
  description: string;
  category: 'gym' | 'academia' | 'online';
  duration?: string;
  level?: 'principiante' | 'intermedio' | 'avanzado';
  image?: string;
  benefits?: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  image?: string;
  rating?: number;
  date?: Date;
}

