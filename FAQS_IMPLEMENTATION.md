# 🎯 Sistema de FAQs - Guía de Implementación

**Estado:** ✅ Implementado y Funcional  
**Fecha:** 8 de noviembre de 2025

---

## 📋 Resumen

Sistema completo de FAQs con diseño minimalista Netflix implementado en todas las páginas principales del sitio web Scorus Fitness. Incluye 101 preguntas y respuestas optimizadas para SEO con structured data JSON-LD.

---

## 🎨 Componentes Creados

### 1. `src/components/faq/FAQs.astro`
**Componente visual del acordeón de FAQs**

**Características:**
- ✅ Diseño minimalista con toques Netflix
- ✅ Fondo degradado oscuro (gray-950 → black)
- ✅ Acordeón expandible con animaciones suaves (300ms)
- ✅ Efectos hover en rojo (#dc2626)
- ✅ Solo una pregunta abierta a la vez (mejor UX)
- ✅ Iconos animados que rotan 45° al expandir
- ✅ Botón CTA al final que dirige a /contacto
- ✅ Totalmente responsive

**Props:**
```typescript
interface Props {
  faqs: FAQ[];
  title?: string;        // Default: "Preguntas Frecuentes"
  subtitle?: string;     // Opcional
}
```

---

### 2. `src/components/faq/FAQSchema.astro`
**Generador de structured data para SEO**

**Características:**
- ✅ Genera JSON-LD con formato FAQPage
- ✅ Compatible con rich snippets de Google
- ✅ Limpia automáticamente HTML de las respuestas
- ✅ Válido según schema.org

**Props:**
```typescript
interface Props {
  faqs: FAQ[];
}
```

**Ejemplo de schema generado:**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Dónde está ubicado Scorus Fitness?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Scorus Fitness está ubicado en Av. Conrado Albaladejo..."
      }
    }
  ]
}
```

---

### 3. `src/data/faqs.ts`
**Base de datos de todas las FAQs**

**FAQs Disponibles:**
- ✅ `faqsHome` (6 preguntas) - Página principal
- ✅ `faqsServiciosIndex` (6 preguntas) - Servicios general
- ✅ `faqsEntrenamientoPersonal` (8 preguntas) - Entrenamiento personal
- ✅ `faqsConsultoriaOnline` (7 preguntas) - Consultoría online
- ✅ `faqsAsesoramientoOnline` (7 preguntas) - Asesoramiento online
- ✅ `faqsGym` (7 preguntas) - Scorus GYM
- ✅ `faqsContacto` (7 preguntas) - Contacto

**Estructura:**
```typescript
export interface FAQ {
  question: string;
  answer: string;  // Puede incluir HTML
}

export const faqsHome: FAQ[] = [
  {
    question: '¿Dónde está ubicado Scorus Fitness?',
    answer: 'Scorus Fitness está ubicado en...'
  },
  // ...
];
```

---

## 🚀 Páginas Implementadas

### ✅ Implementadas

| Página | FAQs | Schema | URL |
|--------|------|--------|-----|
| **Home** | 6 | ✅ | `/es/` |
| **Servicios (index)** | 6 | ✅ | `/es/servicios/` |
| **Entrenamiento Personal** | 8 | ✅ | `/es/servicios/entrenamiento-personal` |
| **Gym** | 7 | ✅ | `/es/gym` |
| **Contacto** | 7 | ✅ | `/es/contacto` |

### 📋 Pendientes de Implementar

| Página | FAQs Disponibles | Prioridad |
|--------|------------------|-----------|
| Consultoría Online | 7 | 🔴 Alta |
| Asesoramiento Online | 7 | 🔴 Alta |
| Scorus Campus | 6 | 🟠 Media |
| Academia (index) | 6 | 🟠 Media |
| Talleres | 7 | 🟢 Baja |
| Seminarios | 7 | 🟢 Baja |
| Video Cursos | 7 | 🟢 Baja |
| RE-BORN | 7 | 🟢 Baja |
| Biografía | 7 | 🟢 Baja |
| Blog (index) | 6 | 🟢 Baja |

---

## 📖 Guía de Implementación

### Paso 1: Importar componentes y datos

```astro
---
// En cualquier página .astro
import FAQs from '@components/faq/FAQs.astro';
import FAQSchema from '@components/faq/FAQSchema.astro';
import { faqsConsultoriaOnline } from '@data/faqs'; // Cambia según la página
---
```

### Paso 2: Añadir antes del cierre de `</Layout>`

```astro
<Layout title="..." description="...">
  <!-- Tu contenido aquí -->
  
  <!-- FAQs Section -->
  <FAQs 
    faqs={faqsConsultoriaOnline}
    title="Preguntas Frecuentes sobre Consultoría Online"
    subtitle="Resuelve tus dudas sobre cómo funcionan nuestras sesiones de consultoría"
  />

  <!-- FAQPage Schema for SEO -->
  <FAQSchema faqs={faqsConsultoriaOnline} />
</Layout>
```

### Paso 3: Personalizar (opcional)

```astro
<!-- Sin subtitle -->
<FAQs 
  faqs={faqsGym}
  title="Preguntas Frecuentes"
/>

<!-- Con título y subtitle personalizados -->
<FAQs 
  faqs={faqsAsesoramientoOnline}
  title="¿Tienes dudas?"
  subtitle="Aquí respondemos las preguntas más comunes sobre nuestro servicio de asesoramiento online"
/>
```

---

## 🎯 Beneficios SEO

### 1. Rich Snippets en Google
Las FAQs aparecerán como desplegables directamente en los resultados de búsqueda:

```
scorusfitness.com › servicios › entrenamiento-personal
▼ ¿Cuánto cuesta el entrenamiento personal en Scorus Fitness Alicante?
▼ ¿Qué incluye el servicio de entrenamiento personal?
▼ ¿Es necesario tener experiencia previa en el gimnasio?
```

### 2. Mayor CTR
- Los rich snippets ocupan más espacio en SERP
- Destacan visualmente con el icono de FAQ
- Usuarios pueden ver respuestas antes de hacer clic

### 3. Keywords Long-tail
Cada pregunta captura búsquedas específicas:
- "cuanto cuesta entrenamiento personal alicante"
- "donde esta scorus fitness"
- "que incluye entrenamiento personal"

### 4. Reduce Tasa de Rebote
Los usuarios encuentran respuestas inmediatas sin necesidad de buscar en otras páginas.

---

## 🔧 Configuración Técnica

### Alias TypeScript

El archivo `tsconfig.json` debe incluir:

```json
{
  "compilerOptions": {
    "paths": {
      "@data/*": ["src/data/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

### Estructura de Archivos

```
src/
├── components/
│   └── faq/
│       ├── FAQs.astro
│       └── FAQSchema.astro
├── data/
│   └── faqs.ts
└── pages/
    └── es/
        ├── index.astro          ✅
        ├── gym.astro            ✅
        ├── contacto.astro       ✅
        └── servicios/
            ├── index.astro      ✅
            └── entrenamiento-personal.astro ✅
```

---

## 🌍 Traducción a Otros Idiomas

### Crear archivos de FAQs por idioma

**Recomendación:** Crear archivos separados por idioma

```
src/data/
├── faqs-es.ts  (español)
├── faqs-en.ts  (inglés)
├── faqs-fr.ts  (francés)
├── faqs-de.ts  (alemán)
└── faqs-hu.ts  (húngaro)
```

**Ejemplo `faqs-en.ts`:**
```typescript
export const faqsHome: FAQ[] = [
  {
    question: 'Where is Scorus Fitness located?',
    answer: 'Scorus Fitness is located at Av. Conrado Albaladejo, 31, 03540 Alicante, Spain...'
  },
  // ...
];
```

**Importar según idioma:**
```astro
---
import { faqsHome as faqsHomeES } from '@data/faqs-es';
import { faqsHome as faqsHomeEN } from '@data/faqs-en';

const currentLang = 'es'; // Detectar del URL
const faqs = currentLang === 'es' ? faqsHomeES : faqsHomeEN;
---

<FAQs faqs={faqs} />
```

---

## ✅ Validación y Testing

### 1. Validar Schema.org

**Herramienta:** https://validator.schema.org/

1. Visita tu página publicada
2. Copia el HTML completo (View Page Source)
3. Pégalo en el validador
4. Verifica que aparezca "FAQPage" sin errores

### 2. Rich Results Test (Google)

**Herramienta:** https://search.google.com/test/rich-results

1. Introduce la URL de tu página
2. Espera el análisis
3. Verifica que detecte "FAQ" como rich result

**Resultado esperado:**
```
✅ Page is eligible for rich results
   FAQ detected
```

### 3. Validar Visualmente

```bash
npm run dev
```

Verifica:
- ✅ Las preguntas se muestran correctamente
- ✅ El acordeón abre y cierra suavemente
- ✅ Solo una pregunta se puede abrir a la vez
- ✅ El hover muestra el borde rojo
- ✅ El diseño es responsive en móvil

---

## 🎨 Personalización de Estilos

### Cambiar colores

Edita `src/components/faq/FAQs.astro`:

```astro
<!-- Cambiar color de acento -->
<button class="... group-hover:text-red-600"> <!-- Cambiar a blue-600, green-600, etc -->

<!-- Cambiar color del borde hover -->
<div class="... hover:border-red-600/50"> <!-- Cambiar a tu color preferido -->

<!-- Cambiar fondo -->
<section class="... bg-gradient-to-b from-gray-950 to-black">
  <!-- Ajustar degradado según tu diseño -->
</section>
```

### Cambiar animaciones

```astro
<div class="transition-all duration-300"> <!-- Cambiar duración: 200, 500, etc -->
```

---

## 📊 Métricas de Éxito

### KPIs a Monitorear (Google Search Console)

1. **Impresiones con Rich Snippets**
   - Filtrar por páginas con FAQs
   - Comparar antes/después de implementación

2. **CTR Mejorado**
   - Target: +15-30% en páginas con FAQs
   - Monitorear semanalmente

3. **Posición Promedio**
   - Las páginas con rich snippets suelen subir 2-5 posiciones

4. **Clics Totales**
   - Incremento esperado: +20-40% en 3 meses

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@data/faqs'"

**Solución:** Verificar que `tsconfig.json` incluya:
```json
"paths": {
  "@data/*": ["src/data/*"]
}
```

### Las FAQs no se expanden

**Solución:** El script debe estar cargado. Verificar en consola del navegador si hay errores JavaScript.

### Schema no válido en validator.schema.org

**Solución:** 
- Verificar que las comillas en las respuestas estén escapadas
- Asegurar que el JSON-LD esté bien formado
- Usar `cleanHTML()` para remover tags HTML problemáticos

### FAQs no aparecen en Google

**Solución:**
- Esperar 2-4 semanas para indexación
- Enviar URL a Google Search Console
- Verificar que la página esté indexada (`site:tudominio.com/pagina`)

---

## 📝 Mantenimiento

### Añadir nuevas preguntas

1. Editar `src/data/faqs.ts`
2. Añadir nueva pregunta al array correspondiente:

```typescript
export const faqsHome: FAQ[] = [
  // ... preguntas existentes
  {
    question: '¿Nueva pregunta?',
    answer: 'Nueva respuesta con <strong>HTML</strong> si es necesario.'
  }
];
```

3. El schema se actualizará automáticamente

### Actualizar respuestas existentes

Simplemente edita el `answer` en `faqs.ts`:

```typescript
{
  question: '¿Pregunta existente?',
  answer: 'Respuesta actualizada con nueva información.'
}
```

---

## 🎯 Próximos Pasos

### Fase 1: Completar Implementación (1-2 días)
- [ ] Consultoría Online
- [ ] Asesoramiento Online
- [ ] Scorus Campus
- [ ] Academia (index)

### Fase 2: Traducción (3-5 días)
- [ ] Crear `faqs-en.ts`
- [ ] Crear `faqs-fr.ts`
- [ ] Crear `faqs-de.ts`
- [ ] Crear `faqs-hu.ts`

### Fase 3: Optimización (Continuo)
- [ ] Monitorear métricas en Search Console
- [ ] Actualizar respuestas según feedback de usuarios
- [ ] Añadir nuevas preguntas según dudas recurrentes

---

## 📚 Recursos Adicionales

- **Schema.org FAQPage:** https://schema.org/FAQPage
- **Google Rich Snippets:** https://developers.google.com/search/docs/appearance/structured-data/faqpage
- **Validator:** https://validator.schema.org/
- **Rich Results Test:** https://search.google.com/test/rich-results

---

**Documentado por:** AI Assistant  
**Última actualización:** 8 de noviembre de 2025

