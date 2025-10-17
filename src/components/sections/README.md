# 📦 Componentes Sections - Scorus Fitness

Componentes reutilizables de secciones de página.

## 🎯 Filosofía

**"Escribe una vez, usa en todos los idiomas"**

Cada componente aquí es 100% reutilizable y funciona con ES, EN, FR, DE.

## 📚 Componentes Disponibles

| Componente | Descripción | Props Principales |
|-----------|-------------|-------------------|
| `HeroSection.astro` | Hero con imagen de fondo | `title`, `subtitle`, `heroImage`, `cta1`, `cta2` |
| `ServicesGrid.astro` | Grid de 4 servicios | `services[]`, `title`, `tagline` |
| `AboutSection.astro` | Características (3 features) | `features[]`, `title`, `subtitle` |
| `ProgramsShowcase.astro` | Grid de 6 programas | `programs[]`, `title`, `titleHighlight` |
| `GymSection.astro` | Info + imagen del gym | `features[]`, `gymImage`, `cta` |
| `BioSection.astro` | Biografía con imagen | `achievements[]`, `aboutImage`, `cta` |
| `CTAFinal.astro` | CTA de contacto final | `title`, `address`, `cta` |

## 🚀 Uso Rápido

```astro
---
import HeroSection from '@components/sections/HeroSection.astro';
import heroImage from '../../../public/images/hero/bernat-hero.jpg';

const data = {
  tagline: "Scorus Fitness",
  title: "TRANSFORMA",
  titleHighlight: "TU CUERPO",
  subtitle: "Entrenamiento de élite...",
  subtitleHighlight: "Tu transformación empieza aquí.",
  cta1: { href: "/contacto", text: "Comenzar Ahora" },
  cta2: { href: "/servicios", text: "Ver Servicios" }
};
---

<HeroSection 
  {...data}
  heroImage={heroImage}
  heroImageAlt="Bernat Scorus"
/>
```

## ✅ Reglas

1. **NUNCA hardcodear textos** - Siempre por props
2. **Imágenes via props** - Usar ImageMetadata de Astro
3. **Mobile-first** - Responsive obligatorio
4. **TypeScript** - Interface Props definida
5. **Accesibilidad** - WCAG AA mínimo

## 📖 Documentación Completa

Ver: **`/METODOLOGIA-COMPONENTES.md`**

---

⭐ Si una sección aparece en más de un idioma, **DEBE** ser un componente aquí.

