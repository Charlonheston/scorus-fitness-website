# 🌐 Sistema de Traducciones

## Estructura de Archivos

```
public/locales/
├── es/  🇪🇸 Español (Default)
│   ├── common.json      ← Nav, Footer, CTAs compartidos
│   ├── home.json        ← Página principal
│   ├── services.json    ← (Pendiente) Servicios
│   ├── academy.json     ← (Pendiente) Academia
│   ├── gym.json         ← (Pendiente) Gimnasio
│   ├── bio.json         ← (Pendiente) Biografía
│   └── contact.json     ← (Pendiente) Contacto
│
├── en/  🇬🇧 English
│   ├── common.json      ✅ Completado
│   ├── home.json        ✅ Completado
│   └── ...              ⏳ Pendiente
│
├── fr/  🇫🇷 Français
│   ├── common.json      ✅ Completado
│   ├── home.json        ✅ Completado
│   └── ...              ⏳ Pendiente
│
└── de/  🇩🇪 Deutsch
    ├── common.json      ✅ Completado
    ├── home.json        ✅ Completado
    └── ...              ⏳ Pendiente
```

## 📋 Estado de Traducción

### ✅ Completados
- `common.json` - ES, EN, FR, DE
- `home.json` - ES, EN, FR, DE

### ⏳ Pendientes
- `services.json`
- `academy.json`
- `gym.json`
- `bio.json`
- `contact.json`

## 🚀 Cómo Usar

Ver guía completa en:
- **Documentación completa:** [`/docs/I18N.md`](../../docs/I18N.md)
- **Guía rápida:** [`/docs/I18N_QUICK_START.md`](../../docs/I18N_QUICK_START.md)

### Ejemplo Básico

```astro
---
import { t } from 'astro-i18next';
---

<h1>{t('home:hero.title')}</h1>
```

## 🎯 Namespaces vs Archivos

| Namespace  | Archivo          | Contenido                    |
|------------|------------------|------------------------------|
| `common`   | `common.json`    | Nav, footer, botones         |
| `home`     | `home.json`      | Página principal             |
| `services` | `services.json`  | Todos los servicios          |
| `academy`  | `academy.json`   | Academia y programas         |
| `gym`      | `gym.json`       | Gimnasio                     |
| `bio`      | `bio.json`       | Biografía                    |
| `contact`  | `contact.json`   | Formulario de contacto       |

## 📝 Añadir Nueva Traducción

1. **Editar JSON en los 4 idiomas:**
   ```bash
   public/locales/es/common.json
   public/locales/en/common.json
   public/locales/fr/common.json
   public/locales/de/common.json
   ```

2. **Usar en componente:**
   ```astro
   {t('common:nueva_key')}
   ```

3. **Reiniciar servidor:**
   ```bash
   npm run dev
   ```

## ⚠️ Importante

- Todos los archivos JSON deben tener la **misma estructura** en todos los idiomas
- Usar siempre el formato `namespace:key.subkey`
- NO hardcodear texto, siempre usar `t()`
- Probar en los 4 idiomas antes de considerar completado

