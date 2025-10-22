# 🎬 Video Scrubbing Fullscreen - Biografía

## ¿Cómo funciona? (Estilo Apple)

Cada sección es **una escena cinematográfica completa** donde:

1. **Video fullscreen** ocupa toda la sección (100% width/height)
2. **Scroll down** → Video avanza frame by frame (forward)
3. **Scroll up** → Video retrocede (reverse) 
4. **Scroll parado** → Video congelado en ese frame
5. **Textos emergen** sobre el video con efectos parallax
6. **Textos desaparecen** cuando sales de la sección

### Experiencia del usuario:

```
Usuario hace scroll
    ↓
Video se reproduce (controlado por scroll)
    ↓
Textos/contenido emerge sobre el video
    ↓
Construcción de la web a medida que scrollea
    ↓
Sensación épica de control total
```

## Arquitectura técnica

```typescript
// Video Scrubbing (GSAP + ScrollTrigger)
gsap.fromTo(video, 
  { currentTime: 0 },
  {
    currentTime: video.duration,
    scrollTrigger: {
      start: 'top top',      // Comienza cuando entra en pantalla
      end: 'bottom top',     // Termina cuando sale de pantalla
      scrub: 1               // Sincronización 1:1 con scroll
    }
  }
);
```

## Videos necesarios (SOLO 4)

```
public/videos/biography/
├── bernat-intro.mp4        (8-12 seg)
├── bernat-training.mp4     (8-12 seg)
├── bernat-competition.mp4  (8-12 seg)
└── bernat-gym.mp4          (8-12 seg)
```

## Especificaciones recomendadas

| Parámetro | Valor | Por qué |
|-----------|-------|--------|
| **Duración** | 8-12 segundos | Tiempo para scroll smooth |
| **Bitrate** | 3000-4000 kbps | Calidad vs rendimiento |
| **Formato** | MP4 + WebM | Máxima compatibilidad |
| **Resolución** | 1920x1080 mínimo | Fullscreen quality |
| **Frame rate** | 24-30 fps | Suficiente para scrubbing fluid |
| **Audio** | ❌ Sin audio (muted) | Mejor UX |
| **Codec video** | H.264 (MP4), VP9 (WebM) | Compatible navegadores |

## Propiedades HTML del video

```html
<video
  data-video-scrub={index}
  class="absolute inset-0 h-full w-full object-cover"
  muted
  playsinline
  preload="metadata"
>
  <source src="video.webm" type="video/webm" />
  <source src="video.mp4" type="video/mp4" />
</video>
```

## Ventajas del diseño

✅ **Experiencia cinematográfica** - El usuario controla el "película"  
✅ **Mobile-friendly** - Funciona perfecto con scroll táctil  
✅ **Responsive** - Se adapta a cualquier pantalla  
✅ **Rendimiento** - Solo 4 videos + GSAP  
✅ **Interactividad** - Usuario es el "director"  
✅ **Sensación épica** - Como las webs de Apple, Nike, etc.

## Cómo crear los videos con IA

### Prompt para cada video:

**bernat-intro.mp4:**
```
"Professional cinematic intro, bodybuilder entering gym, dramatic lighting,
4K, smooth slow motion, epic entrance, 10 seconds, no cuts"
```

**bernat-training.mp4:**
```
"Intense training montage, heavy weights, dumbbells, dynamic movements,
4K, slow motion, professional lighting, 10 seconds, no audio"
```

**bernat-competition.mp4:**
```
"Champion on stage, professional lighting, posing routine,
4K, slow motion, dramatic effect, 10 seconds"
```

**bernat-gym.mp4:**
```
"Premium gym interior, atmospheric lighting, empty gym or with athlete,
4K, cinematic, calm and inspiring, 10 seconds"
```

## Flujo de secciones

```
┌─────────────────────────┐
│ HERO (Video fijo)       │
│ Bernat Scorus intro     │
└─────────────────────────┘
         ↓ SCROLL
┌─────────────────────────┐
│ SECTION 1 (Fullscreen)  │
│ Video: bernat-intro     │
│ Texto: La Infancia      │
│ Duración: ~2 pantallas  │
└─────────────────────────┘
         ↓ SCROLL
┌─────────────────────────┐
│ SECTION 2 (Fullscreen)  │
│ Video: bernat-training  │
│ Texto: Descubrimiento   │
│ Duración: ~2 pantallas  │
└─────────────────────────┘
         ... (y más secciones)
```

## Notas importantes

⚠️ **Video preload**: `preload="metadata"` para mejor rendimiento  
⚠️ **Sine wave easing**: `scrub: 1` es ideal (sin lag perceptible)  
⚠️ **Mobile optimization**: Videos se cargan lazy después del hero  
⚠️ **Fallback**: Siempre incluir formato MP4 + WebM  

## Compatibilidad

✅ Chrome/Edge 88+  
✅ Firefox 85+  
✅ Safari 14.1+  
✅ iOS Safari 14+  
✅ Android Chrome 88+  

## Performance tips

1. **Comprime videos** con HandBrake (máx 5MB cada uno)
2. **Usa WebM** en navegadores modernos (menor peso)
3. **Preload solo el siguiente video** (lazy loading)
4. **Test en móvil 4G** para asegurar smooth scrolling
