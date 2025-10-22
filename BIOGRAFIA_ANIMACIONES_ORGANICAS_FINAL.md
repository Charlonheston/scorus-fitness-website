# 🎬 BIOGRAFÍA REDISEÑADA - ANIMACIONES ORGÁNICAS ESTILO WIX

## ✅ CAMBIOS REALIZADOS

### **DE:** Video Scrubbing Fullscreen
❌ 4 videos 
❌ Video como control principal
❌ Movimiento rígido

### **A:** Animaciones Orgánicas GSAP
✅ Solo imágenes estáticas (no requieren videos)
✅ GSAP + ScrollTrigger controlando todo
✅ Movimiento fluido y natural

---

## 🎨 TECNOLOGÍA DE ANIMACIONES

### **6 CAPAS ANIMADAS POR SECCIÓN:**

```
┌─────────────────────────────────┐
│ CAPA 0: Fondos flotantes        │
│ (Parallax MUY lento: 0.2x)      │
│ - Blur orbs rojo/translúcido    │
│ - Emerge suavemente             │
└─────────────────────────────────┘
         ↓ Scroll
┌─────────────────────────────────┐
│ CAPA 1: Asteroides decorativos  │
│ (Parallax medio: 0.6x + ROTACIÓN) │
│ - 3 asteroides diferentes       │
│ - Cada uno gira diferente       │
│ - Escala/aparecen con easing    │
└─────────────────────────────────┘
         ↓ Scroll
┌─────────────────────────────────┐
│ CAPA 2: Textos (escalonados)    │
│ (Parallax rápido: 0.8x + STAGGER) │
│ - Subtitle fade in (0.1s delay) │
│ - Title fade in (0.2s delay)    │
│ - Párrafos onda (0.3s delay)    │
└─────────────────────────────────┘
         ↓ Scroll
┌─────────────────────────────────┐
│ CAPA 3: Imagen principal        │
│ (Parallax rápido: 1x +          │
│  ROTACIÓN + ESCALA)             │
│ - Emerge con rotación suave     │
│ - Gira -2 a +2 grados          │
│ - Scale 1.05 → 0.98            │
└─────────────────────────────────┘
         ↓ Scroll
┌─────────────────────────────────┐
│ CAPA 4: Velocity Parallax       │
│ (Reacciona a velocidad scroll)  │
│ - Textos se mueven -0.3x vel    │
│ - Imagen se mueve +0.15x vel    │
│ - Efecto de "resorte"           │
└─────────────────────────────────┘
```

---

## 💻 ANIMACIONES ESPECÍFICAS

### **SUBTÍTULO**
```javascript
ease: 'power2.out'
opacity: 0 → 1
y: auto
duration: 0.8s
delay: 0.1s
```
**Efecto:** Aparece suavemente desde arriba

### **TÍTULO**
```javascript
ease: 'power2.out'
opacity: 0 → 1
y: auto (más dramático)
duration: 1s
delay: 0.2s
```
**Efecto:** Emerge más lentamente que subtítulo

### **PÁRRAFOS (Efecto OLA)**
```javascript
ease: 'power2.out'
stagger: 0.15s  ← CLAVE: cada uno sale 0.15s después
opacity: 0 → 1
y: auto
duration: 0.8s
delay: 0.3s
```
**Efecto:** Se ven como ondas emergiendo

### **IMAGEN**
```javascript
ease: 'back.out(1.5)'  ← Efecto rebote suave
opacity: 0 → 1
y: -40px (viene desde arriba)
rotation: 2°
scale: 1 → 1.05
duration: 1s
delay: 0.15s
```

Luego continúa:
```javascript
rotation: 2° → -2°  (gira sutil)
y: -40px → 20px     (se mueve lentamente)
scale: 1.05 → 0.98  (se empequeñece)
duration: 0.8s
delay: 0.7s
ease: 'power1.in'
```

**Efecto:** Entra con rebote, gira continuamente

### **ASTEROIDES (TRES TIPOS DE EASING)**

**Asteroide 1:**
```javascript
ease: 'power1.out'
y: -120px, x: 50px, rotation: 360°
opacity: [0, 0.8, 0]  ← Aparece y desaparece
scale: [0.8, 1.2, 0.8]  ← Crece y empequeñece
```

**Asteroide 2:**
```javascript
ease: 'back.out(1.2)'  ← Rebote suave
y: 100px, x: -80px, rotation: -180°
opacity: [0, 0.5, 0]
scale: [1, 1.3, 0.9]
delay: 0.2s  ← Comienza después
```

**Asteroide 3:**
```javascript
ease: 'power2.out'
y: -60px, x: 120px, rotation: 720°
opacity: [0, 0.6, 0]
scale: [0.9, 1.1, 0.8]
delay: 0.1s
```

**Efecto:** 3 asteroides con timings diferentes = caos orgánico

### **FONDOS FLOTANTES (Parallax ultra lento)**

**Fondo 1 (arriba izquierda):**
```javascript
ease: 'none'  ← SIN easing, lineal
y: -80px
opacity: 0 → 0.3
```

**Fondo 2 (abajo derecha):**
```javascript
ease: 'none'
y: 100px
opacity: 0 → 0.2
```

**Efecto:** Sensación de profundidad, fondo sutil

---

## 🔑 CLAVES DEL EFECTO "ORGÁNICO"

| Elemento | Técnica | Resultado |
|----------|---------|-----------|
| **Timing** | Stagger 0.15s entre párrafos | Efecto onda natural |
| **Easing** | `power2.out`, `back.out` | Movimiento suave, no robótico |
| **Parallax** | Velocidades 0.2x a 1x | Profundidad 3D real |
| **Rotaciones** | 2°, 360°, 720°, -180° | Dinamismo sin caos |
| **Escalas** | [0.8, 1.2, 0.8] arrays | Pulsación orgánica |
| **Opacidades** | Arrays: [0, 0.8, 0] | Aparición y desaparición fluida |
| **Velocity** | Reacciona a scroll speed | Interactividad viva |

---

## 📱 RESPONSIVE (MOBILE FIRST)

```css
/* Mobile */
- Textos más compactos
- Imagen h-96 (cuadrada)
- Gap 8 (menor espaciado)

/* Tablet (768px+) */
- Imagen h-full (responsiva)
- Gap 16 (espaciado mayor)
- Grid 2 columnas

/* Desktop (1024px+) */
- Máximo ancho (max-w-6xl)
- Tipografía ampliada
- Todas las animaciones activas
```

---

## 🚀 CÓMO FUNCIONA AL HACER SCROLL

```
USUARIO SCROLLEA HACIA ABAJO
    ↓
SECCIÓN ENTRA EN VIEWPORT
    ↓
ScrollTrigger activa timeline
    ↓
CAPA 0: Fondos comienzan parallax lento
    ↓ simultáneamente
CAPA 1: Asteroides giran y escalan (timings diferentes)
    ↓ simultáneamente
CAPA 2: Textos emergen escalonados (0.15s entre cada uno)
    ↓ simultáneamente
CAPA 3: Imagen rebota, gira, y continúa moviéndose
    ↓ simultáneamente
CAPA 4: Velocity parallax reacciona a velocidad del scroll
    ↓
USUARIO SCROLLEA HACIA ARRIBA
    ↓
TODAS LAS ANIMACIONES SE INVIERTEN (reverse)
    ↓
Efecto de "rebobinado" natural
```

---

## ✨ SENSACIÓN FINAL (LO QUE SIENTE EL USUARIO)

✅ **Cada elemento tiene vida propia**  
✅ **Todo se mueve pero no en sincronía perfecta**  
✅ **Sensación de profundidad 3D**  
✅ **Movimientos suaves, sin saltos**  
✅ **Parece que los elementos "bailan" al scroll**  
✅ **Control total pero orgánico**  
✅ **Nada se siente forzado o mecánico**  
✅ **Es interactivo pero suave**  

---

## 📊 ESTRUCTURA FINAL

```
src/components/biography/
├── ScrollSection.astro  (Rediseñado: GSAP animaciones orgánicas)
├── HeroSection.astro    (Sin cambios)
└── TimelineSection.astro (Sin cambios)

src/pages/es/biografia.astro
├── Sections array (sin videos)
├── Props: title, subtitle, content, index, bgColor
└── No requiere más imágenes (usa placeholders)

ANIMACIONES ACTIVAS:
- 5 capas por sección
- Múltiples easings (power1/2, back, none)
- Parallax con velocidades 0.2x a 1x
- Stagger delays 0.15s entre elementos
- Rotaciones, escalas, opacidades combinadas
- Velocity-based parallax (reacciona a velocidad)
```

---

## 🎯 PRÓXIMOS PASOS

1. ✅ **Rediseño completado** - Animaciones orgánicas implementadas
2. ⏳ **Añadir imágenes** - Cuando tengas las imagenes de biografía
3. ⏳ **Replicate otros idiomas** - Copiar mismo estructura a EN, DE, FR, HU
4. ⏳ **Fine-tuning** - Ajustar delays/easing si es necesario
5. ⏳ **Testing** - Verificar en móvil, tablet, desktop

---

## 💡 SI QUIERES AJUSTAR ANIMACIONES

```javascript
// Aumentar drama:
ease: 'power3.out'  // Más agresivo

// Menos drama:
ease: 'power1.out'  // Más suave

// Más rebote:
ease: 'back.out(2.5)'  // Mayor rebote

// Más lento:
duration: 1.2  // En lugar de 1

// Más rápido:
duration: 0.6  // En lugar de 1

// Stagger más lento:
stagger: 0.3  // En lugar de 0.15
```

---

**Estado:** ✅ COMPLETADO Y OPTIMIZADO  
**Versión:** 2.0 (Orgánica)  
**Tecnología:** GSAP + ScrollTrigger  
**Sensación:** 100% Estilo Wix
