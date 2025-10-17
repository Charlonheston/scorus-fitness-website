# 🎨 Sistema de Botones Reutilizables - Scorus Fitness

Componentes de botones diseñados siguiendo las **mejores tendencias de UI/UX 2025**:
- ✨ Animaciones sutiles CSS-only (sin afectar SEO)
- 📱 Mobile-first responsive
- ♿ Accesibles (WCAG 2.1 AA)
- 🎯 Optimizados para fitness/deportes
- 🔄 100% reutilizables

---

## 📦 Componentes Disponibles

### 1️⃣ **ButtonPrimary** 
CTA principal con shine effect y scale hover

#### Cuándo usar:
- CTAs principales
- Formularios de contacto  
- Acciones importantes

#### Props:
```typescript
href: string          // URL destino (requerido)
text: string          // Texto del botón (requerido)
icon?: boolean        // Mostrar flecha (default: true)
size?: 'sm'|'md'|'lg' // Tamaño (default: 'md')
class?: string        // Clases adicionales
```

#### Ejemplo:
```astro
import ButtonPrimary from '@components/ui/ButtonPrimary.astro';

<ButtonPrimary 
  href="/contacto" 
  text="Comenzar Ahora"
  size="lg"
/>
```

---

### 2️⃣ **ButtonSecondary**
Botón secundario con glassmorphism o outline

#### Cuándo usar:
- Acciones secundarias
- Enlaces alternativos
- Navegación complementaria

#### Props:
```typescript
href: string                // URL destino (requerido)
text: string                // Texto del botón (requerido)
icon?: boolean              // Mostrar flecha (default: false)
size?: 'sm'|'md'|'lg'       // Tamaño (default: 'md')
variant?: 'glass'|'outline' // Estilo (default: 'glass')
class?: string              // Clases adicionales
```

#### Ejemplos:
```astro
import ButtonSecondary from '@components/ui/ButtonSecondary.astro';

<!-- Glassmorphism (fondos oscuros/hero) -->
<ButtonSecondary 
  href="/servicios" 
  text="Ver Servicios"
  variant="glass"
  size="lg"
/>

<!-- Outline (fondos claros) -->
<ButtonSecondary 
  href="/info" 
  text="Más Información"
  variant="outline"
/>
```

---

### 3️⃣ **ButtonGhost**
Botón minimalista con animated underline

#### Cuándo usar:
- Enlaces de "leer más"
- Navegación sutil
- Acciones terciarias

#### Props:
```typescript
href: string                    // URL destino (requerido)
text: string                    // Texto del botón (requerido)
icon?: boolean                  // Mostrar flecha (default: true)
color?: 'red'|'white'|'black'  // Color texto (default: 'red')
class?: string                  // Clases adicionales
```

#### Ejemplos:
```astro
import ButtonGhost from '@components/ui/ButtonGhost.astro';

<!-- Sobre fondo oscuro -->
<ButtonGhost 
  href="/biografia" 
  text="Conoce Mi Historia"
  color="white"
/>

<!-- Sobre fondo claro -->
<ButtonGhost 
  href="/blog/post-1" 
  text="Leer Más"
  color="red"
/>
```

---

## 🎨 Guía de Uso por Contexto

### Hero Section:
```astro
<ButtonPrimary href="/contacto" text="Comenzar Ahora" size="lg" />
<ButtonSecondary href="/servicios" text="Ver Servicios" variant="glass" size="lg" />
```

### Secciones internas:
```astro
<ButtonPrimary href="/accion" text="Texto CTA" />
<ButtonGhost href="/info" text="Leer Más" />
```

### CTAs finales:
```astro
<ButtonPrimary 
  href="/contacto" 
  text="Contáctanos" 
  size="lg"
  class="!bg-white !text-black hover:!bg-black hover:!text-white"
/>
```

---

## 🎯 Características de Diseño 2025

### ✨ Shine Effect (ButtonPrimary)
Efecto de brillo que recorre el botón al hacer hover
- Sin JavaScript
- CSS puro
- No afecta SEO

### 🌊 Glassmorphism (ButtonSecondary)
Backdrop blur con transparencia
- Perfecto para overlays
- Moderno y elegante
- Compatible con fondos complejos

### 📏 Animated Underline (ButtonGhost)
Subrayado animado que crece en hover
- Minimalista
- Alta conversión
- Ideal para lectura

### 🎪 Scale & Shadow
Todos los botones tienen:
- Scale subtle (1.02) en hover
- Shadow expansion
- Smooth transitions (300ms)

---

## ♿ Accesibilidad

Todos los componentes incluyen:
- ✅ Focus visible con outline
- ✅ Estados hover/active/focus
- ✅ Contraste WCAG AA (mínimo 4.5:1)
- ✅ Keyboard navigation
- ✅ Screen reader friendly

---

## 🔄 Actualización Global

**Para cambiar todos los botones del sitio:**

1. Edita el componente en `src/components/ui/`
2. Guarda
3. Astro regenera automáticamente

**Ejemplo:** Cambiar el color del ButtonPrimary:
```css
/* src/components/ui/ButtonPrimary.astro */
.btn-primary {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  /* Cambia a: */
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}
```

Todos los botones se actualizan automáticamente en toda la web ✅

---

## 📊 Rendimiento

- **Sin JavaScript** → 0kb de JS añadido
- **CSS puro** → Animaciones GPU-accelerated
- **SEO friendly** → Enlaces estándar `<a>` con estilos
- **Lighthouse score** → 100/100

---

## 🎨 Paleta de Colores

```css
Rojo Principal:  #dc2626 (red-600)
Rojo Oscuro:     #b91c1c (red-700)
Blanco:          #ffffff
Negro:           #000000
Transparencias:  rgba(255,255,255,0.1-0.2)
```

---

## 📱 Responsive

Todos los botones son mobile-first:
- `sm`: Móvil
- `md`: Tablet  
- `lg`: Desktop

Usa el prop `size` para ajustar según el contexto.

---

## ✅ Checklist de Implementación

Cuando uses botones en una nueva página:

- [ ] Importar componente al inicio del archivo
- [ ] Usar props correctos (href + text mínimo)
- [ ] Elegir size apropiado según contexto
- [ ] Verificar contraste de color sobre fondo
- [ ] Probar en mobile, tablet y desktop
- [ ] Verificar accesibilidad con teclado

---

**¿Dudas?** Revisa los ejemplos en `src/pages/es/index.astro` ✨

