/**
 * Tipos globales del proyecto Scorus Fitness
 */

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    instagram: string;
    youtube: string;
  };
}

export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: string;
  label?: string;
  description?: string;
  children?: NavItem[];
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  schedule: {
    weekdays: string;
    hours: string;
  };
}

export interface SocialLinks {
  instagram: string;
  youtube: string;
}

