# 🏋️ Scorus Fitness - Sitio Web Profesional

Sitio web de entrenamiento personal y gimnasio construido con **Astro 4**, **TailwindCSS** y enfoque en **Performance**, **SEO** y **Accesibilidad**.

## 🌟 Características

- ⚡ **Performance Excepcional**: Lighthouse 95+ garantizado
- 🌍 **Multilingüe**: Español, Inglés, Francés, Alemán
- 📱 **Responsive**: Mobile-first design
- ♿ **Accesible**: WCAG 2.1 AA compliance
- 🔍 **SEO Optimizado**: Schema.org, OpenGraph, metadatos completos
- 🤖 **AI-Ready**: HTML semántico y structured data
- 🚀 **Astro Islands**: JavaScript solo donde se necesita

## 🛠️ Stack Tecnológico

- **Framework**: [Astro 4.x](https://astro.build)
- **Styling**: [TailwindCSS 3.x](https://tailwindcss.com)
- **UI Components**: Astro + React Islands
- **CMS**: Sanity.io (headless)
- **i18n**: astro-i18next
- **Testing**: Vitest + Playwright
- **Deployment**: Vercel

## 📋 Requisitos Previos

- Node.js 20.x LTS (ver `.nvmrc`)
- npm o pnpm
- Git

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/scorus-fitness.git

# Entrar al directorio
cd scorus-fitness

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

## 🧞 Comandos Disponibles

| Comando              | Acción                                              |
| :------------------- | :-------------------------------------------------- |
| `npm run dev`        | Inicia servidor de desarrollo en `localhost:4321`  |
| `npm run build`      | Construye el sitio para producción en `./dist/`    |
| `npm run preview`    | Vista previa de la construcción                     |
| `npm run lint`       | Ejecuta ESLint                                      |
| `npm run lint:fix`   | Corrige errores de linting automáticamente          |
| `npm run format`     | Formatea el código con Prettier                     |
| `npm test`           | Ejecuta tests unitarios con Vitest                  |
| `npm run test:e2e`   | Ejecuta tests E2E con Playwright                    |

## 📁 Estructura del Proyecto

```
/
├── public/                       # Assets estáticos
├── src/
│   ├── components/              # Componentes Astro + React Islands
│   │   ├── ui/                  # Componentes UI base
│   │   ├── react/               # Islas React (interactivas)
│   │   ├── layout/              # Header, Footer, Navigation
│   │   ├── sections/            # Secciones de página
│   │   ├── blog/                # Componentes del blog
│   │   └── seo/                 # Componentes SEO
│   ├── content/                 # Content Collections
│   │   ├── config.ts
│   │   └── blog/
│   ├── layouts/                 # Layouts de página
│   ├── pages/                   # Rutas (file-based routing)
│   │   └── [lang]/              # Rutas i18n
│   ├── lib/                     # Utilidades y helpers
│   │   ├── api/                 # Clientes API (Sanity)
│   │   └── i18n/                # Configuración i18n
│   ├── types/                   # TypeScript types
│   └── styles/                  # Estilos globales
├── docs/                        # Documentación técnica
└── package.json
```

## 📚 Documentación

La documentación completa del proyecto está en `/docs`:

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitectura y decisiones técnicas
- [DEVELOPMENT.md](docs/DEVELOPMENT.md) - Guía de desarrollo
- [I18N.md](docs/I18N.md) - Internacionalización
- [CMS_SETUP.md](docs/CMS_SETUP.md) - Configuración del CMS
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Despliegue
- [SEO_STRATEGY.md](docs/SEO_STRATEGY.md) - Estrategia SEO

## 🌍 Internacionalización

El sitio soporta 4 idiomas:

- 🇪🇸 Español (default)
- 🇬🇧 Inglés
- 🇫🇷 Francés
- 🇩🇪 Alemán

Las rutas siguen el patrón: `/{lang}/{page}`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: add amazing feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Commits Convencionales

Este proyecto usa [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Cambios en documentación
- `style:` Cambios de formato
- `refactor:` Refactorización
- `test:` Tests
- `chore:` Mantenimiento

## 📄 Licencia

Copyright © 2024 Scorus Fitness. Todos los derechos reservados.

## 👤 Contacto

- **Web**: [scorusfitness.com](https://scorusfitness.com)
- **Email**: info@scorusfitness.com
- **Instagram**: [@bernatscorus](https://instagram.com/bernatscorus)
- **YouTube**: [@ScorusFitness](https://youtube.com/@ScorusFitness)

