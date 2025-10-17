/**
 * Tipos relacionados con el blog
 */

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  author: string;
  tags: string[];
  image?: string;
  featured?: boolean;
}

export interface BlogCategory {
  slug: string;
  name: string;
  description: string;
  count?: number;
}

export type BlogCategorySlug = 'nutricion' | 'culturismo' | 'cuidado-personal' | 'rutinas';

