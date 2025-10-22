# 🎬 ANÁLISIS: ANIMACIONES ORGÁNICAS WIX

## ¿POR QUÉ SE SIENTE "ORGÁNICO Y DINÁMICO"?

### 1. TIMING VARIABLE (NO TODO SINCRONIZADO)

```
❌ MALO (Todo junto):
Texto aparece → Objeto aparece → Imagen aparece
(Aburrido, mecánico)

✅ BUENO (Escalonado orgánico):
Texto aparece (0.2s)
  → Imagen entra (0.4s después)
    → Objeto decorativo gira (0.6s después)
      → Todo sigue moviéndose de forma independiente
```

**Efecto:** Sensación de que cada cosa tiene su propia vida

### 2. EASING CURVES (MOVIMIENTO NATURAL)

**NO es lineal:**
```
❌ ease-linear (robótico)
- Movimiento mecánico
- Velocidad constante
- Muerto

✅ ease-out / ease-in-out (orgánico)
- Comienza lento
- Se acelera
- Desacelera al final
- Natural, como la física real
```

**Función ideal en GSAP:**
```javascript
gsap.to(element, {
  duration: 1,
  ease: "power2.out",  // ← CRUCIAL
  x: 100,
  opacity: 1
});
```

**Tipos de easing que Wix usa:**
- `power1.out` - suave entrada
- `power2.out` - más drama
- `power3.out` - máximo drama
- `back.out` - "rebote" suave
- `elastic.out` - efecto resorte

### 3. PARALLAX CON VELOCIDADES DIFERENTES

```
Scroll = 100px

¿Qué pasa?

Fondo:        se mueve 20px  (velocidad 0.2x)
Planetas:     se mueven 60px (velocidad 0.6x)
Texto:        se mueven 80px (velocidad 0.8x)
Asteroides:   se mueven 100px (velocidad 1x)

Resultado: Sensación de profundidad REAL
           Cada layer tiene vida propia
```

**En código:**
```javascript
gsap.to(background, {
  y: scrollAmount * 0.2,
  duration: 0.1,
  ease: "none"
});

gsap.to(planet, {
  y: scrollAmount * 0.6,
  duration: 0.1,
  ease: "none"
});

gsap.to(asteroid, {
  y: scrollAmount * 1,
  duration: 0.1,
  ease: "none"
});
```

### 4. ROTACIONES Y TRANSFORMACIONES COMBINADAS

```
NO es solo: elemento se mueve en X

SÍ es:
- Se mueve en X (derecha/izquierda)
- Se mueve en Y (arriba/abajo)
- Se ROTA (gira)
- SE ESCALA (crece/empequeñece)
- CAMBIA OPACIDAD (aparece/desaparece)
- TODO SIMULTANEAMENTE

Resultado: Movimiento complejo pero natural
```

**Ejemplo de planeta:**
```javascript
gsap.timeline({
  scrollTrigger: {
    trigger: ".planet-section",
    start: "top center",
    end: "bottom center",
    scrub: 1,
    onUpdate: (self) => {
      // Parallax
      planet.style.y = -self.getVelocity() * 0.5 + "px";
    }
  }
})
.to(planet, {
  rotation: 360,      // Gira completo
  scale: 1.2,         // Crece
  opacity: 1,         // Se ve
  x: 100,             // Se mueve derecha
  y: -50,             // Se mueve arriba
  duration: 3,
  ease: "power1.out"
}, 0)
.to(planet, {
  rotation: 720,      // Sigue girando
  scale: 0.9,         // Se empequeñece
  opacity: 0.5,       // Se desvanece
  x: -100,            // Se mueve izquierda
  y: 100,             // Se mueve abajo
  duration: 3,
  ease: "power2.in"
}, 0.5);  // ← Comienza mientras la anterior aún corre
```

### 5. VELOCIDAD DE SCROLL (MOMENTUM)

Wix calcula la **velocidad de scroll** y la usa:

```javascript
let scrollVelocity = gsap.getProperty(window, "scrollY");

gsap.to(element, {
  x: scrollVelocity * 2,  // Se mueve más si scrolleas rápido
  duration: 0.5,
  ease: "power2.out"
});
```

**Efecto:** Los elementos reaccionan a CÓMO scrolleas
- Scroll rápido → movimiento más grande
- Scroll lento → movimiento sutil
- Muy orgánico

### 6. STAGGER DELAYS (ONDAS DE MOVIMIENTO)

```
Elemento 1: aparece en t=0.2s
Elemento 2: aparece en t=0.4s
Elemento 3: aparece en t=0.6s
Elemento 4: aparece en t=0.8s

Efecto VISUAL:
┌──┐
│  │
└──┐ ┌──┐
   │ │  │
   └─┤──┐ ┌──┐
      │  │ │  │
      └──┤─┤──┐ ┌──┐
         │ │  │ │  │
         └─┴──┴─┴──┘

Se siente como una OLA de animación
muy orgánica y fluida
```

**Código:**
```javascript
gsap.to(".element", {
  opacity: 1,
  y: 0,
  duration: 0.8,
  stagger: 0.2,    // ← Delay entre cada una: 0.2s
  ease: "power2.out"
});
```

### 7. BOUNCE/RESORTE (PHYSICS ENGINE)

```javascript
gsap.to(element, {
  x: 100,
  duration: 1,
  ease: "back.out(1.7)"  // ← Efecto rebote
});

// O con elastic:
gsap.to(element, {
  rotation: 360,
  duration: 1.5,
  ease: "elastic.out(1, 0.5)"  // ← Efecto resorte
});
```

**Resultado:** Parece que los objetos tienen PESO y FÍSICA real

### 8. SCRUBBER SMOOTH (NO FRAME JUMPS)

```javascript
ScrollTrigger.create({
  onUpdate: (self) => {
    // Actualizar en CADA frame (suave)
    gsap.to(element, {
      y: self.getVelocity() * -0.2,
      overwrite: "auto",
      duration: 0.2  // ← Smooth interpolation
    });
  }
});
```

**Sin esto:** Los elementos saltan/parpadean
**Con esto:** Movimiento buttery smooth

### 9. OPACITY TRANSITIONS (APARECER/DESAPARECER)

NO es cambio brusco:

```
❌ MALO:
opacity: 0 → 1  (cambio instantáneo)

✅ BUENO:
opacity: 0 → 0.3 → 0.6 → 1
(transición suave a lo largo del scroll)
```

### 10. SCROLL-TRIGGER POSITIONS (TIMING PERFECTO)

```javascript
gsap.to(element, {
  opacity: 1,
  y: 0,
  scrollTrigger: {
    trigger: ".section",
    start: "top 80%",      // Inicia cuando está 80% visible
    end: "top 20%",        // Termina cuando sale
    scrub: 1,              // Suavidad
    markers: false
  }
});
```

**Clave:** Los elementos NO aparecen de golpe en viewport
- Comienzan animación ANTES de verse
- Terminan DESPUÉS de desaparecer
- Sensación de continuidad perfecta

---

## 🎯 RESUMEN: 6 CLAVES PARA ANIMACIONES ORGÁNICAS

| Clave | Cómo | Efecto |
|-------|------|--------|
| **1. Easing** | `power2.out`, `back.out` | Movimiento natural |
| **2. Parallax** | Velocidades diferentes por capa | Profundidad 3D |
| **3. Stagger** | Delays escalonados | Efecto onda |
| **4. Combinación** | Rotate + Scale + Move + Opacity | Complejidad sin caos |
| **5. Velocity** | Reaccionar a velocidad scroll | Interactividad real |
| **6. Smooth** | Interpolación en cada frame | Sin saltos/parpadeos |

---

## 💻 CÓDIGO GSAP COMPLETO (TEMPLATE)

```javascript
// Master timeline que se controla con scroll
const masterTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: ".biography-section",
    start: "top top",
    end: "bottom top",
    scrub: 1,           // Sincroniza con scroll
    markers: false
  }
});

// CAPA 1: Fondo (parallax lento)
masterTimeline.to(
  ".background",
  {
    y: -100,
    opacity: 0.8,
    ease: "none"
  },
  0
);

// CAPA 2: Decorativos (parallax medio)
masterTimeline.to(
  ".decorative-elements",
  {
    y: -60,
    rotation: 180,
    scale: 1.2,
    ease: "power1.out"
  },
  0
);

// CAPA 3: Textos (parallax rápido)
masterTimeline.to(
  ".title",
  {
    y: -30,
    opacity: 1,
    ease: "power2.out"
  },
  0.1
);

// CAPA 4: Imágenes (move + rotate)
masterTimeline.to(
  ".main-image",
  {
    y: 50,
    rotation: 5,
    scale: 1.05,
    ease: "back.out(1.2)"
  },
  0.2
);

// CAPA 5: Asteroides (efecto rebote)
masterTimeline.to(
  ".asteroids",
  {
    y: 100,
    rotation: 360,
    ease: "elastic.out(1, 0.5)"
  },
  0.3
);

// TODO SE MUEVE AL MISMO TIEMPO
// pero con timings y easings diferentes
```

---

## ✨ SENSACIÓN FINAL

El usuario scrollea y SIENTE:
✅ Cada elemento tiene autonomía
✅ Todo se mueve juntos pero diferente
✅ La página "respira" organicamente
✅ Nada se siente forzado o mecánico
✅ Es como si los elementos BAILARAN al scroll
✅ Sensación de control total pero fluida
