# 🎯 METODOLOGÍA DE COMPONENTES REUTILIZABLES - SCORUS FITNESS

**Filosofía Central:** *"Escribe una vez, usa en todos los idiomas"*

---

## 📁 ESTRUCTURA OBLIGATORIA DEL PROYECTO

```
src/
├── components/
│   ├── ui/              → Componentes atómicos reutilizables
│   │   ├── ButtonPrimary.astro      (CTA principal con glow effect)
│   │   ├── ButtonSecondary.astro    (Outline/Glass buttons)
│   │   ├── ButtonGhost.astro        (Links minimalistas)
│   │   └── ...
│   │
│   ├── sections/        → ⭐ COMPONENTES DE SECCIONES (MÁS IMPORTANTE)
│   │   ├── HeroSection.astro        (Hero con imagen de fondo)
│   │   ├── ServicesGrid.astro       (Grid de 4 servicios)
│   │   ├── AboutSection.astro       (Características clave)
│   │   ├── ProgramsShowcase.astro   (Grid de 6 programas)
│   │   ├── GymSection.astro         (Info + imagen del gym)
│   │   ├── BioSection.astro         (Biografía con imagen)
│   │   └── CTAFinal.astro           (CTA de contacto final)
│   │
│   ├── layout/          → Layout global del sitio
│   │   ├── Header.astro
│   │   ├── Navigation.astro
│   │   ├── MobileMenu.astro
│   │   └── Footer.astro
│   │
│   └── i18n/
│       └── LanguageSwitcher.astro
│
├── pages/
│   └── [lang]/          → Rutas por idioma (es/, en/, fr/, de/)
│       └── index.astro  → SOLO ensambla componentes (~100 líneas)
│
└── data/                → Datos en JSON (futuro)
    └── home/
        ├── es.json
        ├── en.json
        ├── fr.json
        └── de.json
```

---

## ✅ EJEMPLO DE PÁGINA CORRECTA

**Archivo:** `src/pages/es/index.astro`  
**Líneas:** ~100-180 líneas  
**Contenido:** 80% datos, 20% imports

```astro
---
/**
 * Página HOME en español
 * ✅ Usa componentes reutilizables
 * ✅ Datos centralizados
 */

import Layout from '@layouts/Layout.astro';
import HeroSection from '@components/sections/HeroSection.astro';
import ServicesGrid from '@components/sections/ServicesGrid.astro';
import AboutSection from '@components/sections/AboutSection.astro';
// ... más imports

// Importar imágenes
import heroImage from '../../../public/images/hero/bernat-hero.jpg';
import aboutImage from '../../../public/images/about/bernat-about.jpg';
import gymImage from '../../../public/images/gym/gym-01.jpg';

// Datos de la página
const homeData = {
  hero: {
    tagline: "Scorus Fitness",
    title: "TRANSFORMA",
    titleHighlight: "TU CUERPO",
    subtitle: "Entrenamiento de élite. Resultados extraordinarios.",
    subtitleHighlight: "Tu transformación empieza aquí.",
    cta1: { href: "/es/contacto", text: "Comenzar Ahora" },
    cta2: { href: "/es/servicios", text: "Ver Servicios" }
  },
  services: {
    tagline: "Servicios Principales",
    title: "EMPIEZA TU",
    titleHighlight: "TRANSFORMACIÓN",
    services: [
      {
        iconType: "dumbbell",
        title: "Entrenamiento Personal",
        description: "Sesiones 1:1 personalizadas.",
        cta: "Ver Más",
        href: "/es/servicios/entrenamiento-personal"
      },
      // ... más servicios
    ]
  },
  // ... más secciones
};
---

<Layout title="Scorus Fitness | Home">
  <HeroSection 
    {...homeData.hero}
    heroImage={heroImage}
    heroImageAlt="Bernat Scorus"
  />
  
  <ServicesGrid {...homeData.services} />
  <AboutSection {...homeData.about} />
  <ProgramsShowcase {...homeData.programs} />
  <GymSection {...homeData.gym} gymImage={gymImage} gymImageAlt="Scorus GYM" />
  <BioSection {...homeData.bio} aboutImage={aboutImage} aboutImageAlt="Bernat" />
  <CTAFinal {...homeData.cta} />
</Layout>
```

**Resultado:**
- ✅ Solo ~100 líneas
- ✅ Fácil de leer
- ✅ Cambiar componente actualiza TODOS los idiomas
- ✅ Datos centralizados

---

## ❌ EJEMPLO INCORRECTO (NO HACER ESTO)

```astro
---
import Layout from '@layouts/Layout.astro';
---

<Layout>
  <section class="hero">
    <div class="container">
      <h1>TRANSFORMA TU CUERPO</h1>
      <!-- 800 líneas de HTML duplicado... -->
    </div>
  </section>
  
  <section class="services">
    <!-- 150 líneas más... -->
  </section>
  
  <!-- 500 líneas más... -->
</Layout>
```

**Problemas:**
- ❌ 800 líneas difícil de mantener
- ❌ HTML duplicado en 4 idiomas (3200 líneas totales!)
- ❌ Cambiar diseño requiere modificar 4 archivos
- ❌ Alto riesgo de inconsistencias

---

## 📘 GUÍA: CREAR NUEVO COMPONENTE SECTION

### Paso 1: Crear archivo

**Ubicación:** `src/components/sections/NombreComponente.astro`

### Paso 2: Estructura del componente

```astro
---
/**
 * NombreComponente - Descripción breve
 * Componente reutilizable para todos los idiomas
 * 
 * Props:
 * - title: string - Título principal
 * - description: string - Descripción
 * - items: Array<Item> - Lista de items
 */

import { Image } from 'astro:assets';
import ButtonPrimary from '@components/ui/ButtonPrimary.astro';

interface Item {
  name: string;
  value: string;
}

interface Props {
  title: string;
  description: string;
  items: Item[];
}

const { title, description, items } = Astro.props;
---

<section class="bg-white py-24">
  <div class="container">
    <h2 class="text-4xl font-black">{title}</h2>
    <p class="text-lg">{description}</p>
    
    {items.map((item) => (
      <div>
        <h3>{item.name}</h3>
        <p>{item.value}</p>
      </div>
    ))}
  </div>
</section>
```

### Paso 3: Usar en páginas

```astro
---
import NombreComponente from '@components/sections/NombreComponente.astro';

const data = {
  title: "Mi Título",
  description: "Mi descripción",
  items: [...]
};
---

<NombreComponente {...data} />
```

---

## 📘 GUÍA: AÑADIR NUEVO IDIOMA

**Ejemplo:** Añadir ITALIANO (it)

### Paso 1: Crear estructura

```
src/pages/it/
├── index.astro
├── servizi/
├── accademia/
├── palestra.astro
├── biografia.astro
└── contatto.astro
```

### Paso 2: Crear datos

```json
// src/data/home/it.json
{
  "hero": {
    "tagline": "Scorus Fitness",
    "title": "TRASFORMA",
    "titleHighlight": "IL TUO CORPO",
    "subtitle": "Allenamento d'élite...",
    ...
  },
  ...
}
```

### Paso 3: Crear página home

```astro
---
// src/pages/it/index.astro
import Layout from '@layouts/Layout.astro';
import HeroSection from '@components/sections/HeroSection.astro';
// ... imports

import homeData from '@data/home/it.json'; // O datos inline

import heroImage from '../../../public/images/hero/bernat-hero.jpg';
---

<Layout title="Scorus Fitness | Home">
  <HeroSection {...homeData.hero} heroImage={heroImage} heroImageAlt="..." />
  <ServicesGrid {...homeData.services} />
  <!-- ... resto -->
</Layout>
```

### Paso 4: Actualizar Navigation

```astro
// src/components/layout/Navigation.astro
const navigationConfig = {
  it: {
    items: [
      { name: 'Home', href: '/it/' },
      { name: 'Servizi', href: '/it/servizi' },
      // ...
    ]
  }
};
```

### Paso 5: Actualizar LanguageSwitcher

```astro
const languages = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  // ...
];
```

✅ **Resultado:** Nuevo idioma añadido en ~2 horas

---

## 🔧 PROPS MÁS COMUNES

### Textos
- `tagline: string` - Etiqueta pequeña superior
- `title: string` - Título principal
- `titleHighlight: string` - Parte resaltada en rojo
- `subtitle: string` - Subtítulo
- `description: string` - Descripción larga

### Imágenes
- `heroImage: ImageMetadata` - Imagen importada de Astro
- `heroImageAlt: string` - Texto alternativo
- `aboutImage: ImageMetadata`
- `gymImage: ImageMetadata`

### Arrays
- `services: Array<Service>` - Lista de servicios
- `features: Array<Feature>` - Lista de características
- `programs: Array<Program>` - Lista de programas
- `achievements: string[]` - Lista de logros

### CTAs
- `cta: { href: string, text: string }`
- `cta1, cta2: { href, text }`

---

## 📋 CHECKLIST ANTES DE COMMIT

### Para Nuevos Componentes
- [ ] Está en `src/components/sections/`
- [ ] Tiene JSDoc con descripción y props
- [ ] Interface `Props` definida con TypeScript
- [ ] Textos vienen por props (no hardcoded)
- [ ] Imágenes vienen por props (ImageMetadata)
- [ ] Usa componentes `ui/` cuando sea posible
- [ ] Mobile-first responsive
- [ ] Iconos SVG inline sin frames
- [ ] Contraste accesible (WCAG AA)

### Para Páginas
- [ ] La página es < 200 líneas
- [ ] Importa componentes `sections/`
- [ ] Datos en objeto centralizado
- [ ] Usa spread operator `{...data}`
- [ ] Rutas con prefijo de idioma
- [ ] SEO: title y description definidos

### Para Multiidioma
- [ ] ¿Apliqué cambio a ES, EN, FR, DE?
- [ ] ¿Componente funciona con todos los idiomas?
- [ ] ¿Añadí ruta en `navigationConfig`?
- [ ] Textos NO hardcodeados en componente

### General
- [ ] `npm run lint` → Sin errores
- [ ] `npm run check` → TypeScript OK
- [ ] Commit message: Conventional Commits
- [ ] `git push` exitoso

---

## 🐛 TROUBLESHOOTING

### "El componente no encuentra la prop"
**Solución:**
1. Verifica que la prop está en `interface Props`
2. Desestructura: `const { prop } = Astro.props`
3. Pasa desde la página: `<Component prop="valor" />`

### "La imagen no se ve"
**Solución:**
1. Usa `import img from '../../../public/...'`
2. Pasa como prop: `<Component image={img} />`
3. En componente: `<Image src={props.image} />`
4. NO uses string path, usa ImageMetadata

### "Los estilos no se aplican"
**Solución:**
1. Usa clases Tailwind directamente
2. Para CSS custom, usa `<style>` en componente
3. Verifica typos en clases

### "TypeScript error en props"
**Solución:**
1. Define `interface Props` correctamente
2. Usa `const { ... } = Astro.props;`
3. Arrays: `Array<{ field: type }>`
4. Const enums: `iconType: 'a' | 'b' | 'c'`

### "Componente se ve diferente en cada idioma"
**❌ ERROR DE CONCEPTO:**  
¡Los componentes NUNCA deben verse diferentes!  
Solo los TEXTOS cambian, el HTML es el mismo.

### "Necesito cambiar diseño en todos los idiomas"
**✅ ESTO ES CORRECTO:**
1. Edita solo el componente en `src/components/sections/`
2. Guarda
3. ✅ Se actualiza en ES, EN, FR, DE automáticamente

---

## 📊 MÉTRICAS DE CALIDAD

### Objetivos

**Componentes:**
- Componentes `sections/`: 10 (mínimo 7)
- Componentes `ui/`: 5+
- Duplicación de código: < 5%

**Páginas:**
- Líneas por página: < 200 (ideal: ~100)
- % HTML directo: < 20%
- % imports `sections/`: > 50%
- Páginas usando componentes: 100%

**Multiidioma:**
- Idiomas soportados: 4 (ES, EN, FR, DE)
- Consistencia de diseño: 100%
- Tiempo añadir nuevo idioma: < 2 horas

**Mantenibilidad:**
- Tiempo cambiar diseño global: < 15 min
- Archivos a modificar: 1 (el componente)
- Reducción de código: 70% vs sin componentes

---

## ✨ BENEFICIOS

### Desarrollo
- ✅ 70-80% menos código
- ✅ Velocidad 3x más rápida
- ✅ Onboarding: 1 hora vs 1 semana
- ✅ Refactoring seguro
- ✅ Testing unitario posible

### Mantenimiento
- ✅ Cambiar diseño: 1 archivo vs 4
- ✅ Añadir idioma: 2 horas vs 2 semanas
- ✅ Bug fixing: 1 lugar vs múltiples
- ✅ Consistencia: 100% garantizada

### Escalabilidad
- ✅ Nuevas páginas: Copiar 100 líneas
- ✅ Nuevas secciones: 1 componente
- ✅ Soportar 10 idiomas: Sin problema
- ✅ Equipo de 10 devs: Sin conflictos

### Calidad
- ✅ DRY: 100% cumplido
- ✅ SOLID principles
- ✅ Clean Code
- ✅ TypeScript type-safe

---

## 🎯 REGLA DE ORO

> **"Si una sección de HTML aparece en más de un idioma,  
> DEBE ser un componente en `src/components/sections/`"**

**¡NO HAY EXCEPCIONES A ESTA REGLA!**

---

## 📚 RECURSOS

### Componentes Creados
- `src/components/sections/HeroSection.astro`
- `src/components/sections/ServicesGrid.astro`
- `src/components/sections/AboutSection.astro`
- `src/components/sections/ProgramsShowcase.astro`
- `src/components/sections/GymSection.astro`
- `src/components/sections/BioSection.astro`
- `src/components/sections/CTAFinal.astro`

### Demo
- `src/pages/es/index-refactored.astro` (Ejemplo: 180 líneas)

### Documentación Astro
- [Astro Components](https://docs.astro.build/en/core-concepts/astro-components/)
- [TypeScript](https://docs.astro.build/en/guides/typescript/)

---

⭐ **RECUERDA:** Esta metodología es **OBLIGATORIA** para todo el proyecto.  
**NO se aceptan PRs con código duplicado entre idiomas.**

---

*Última actualización: Octubre 2025*

