# 📸 GUÍA DE CREACIÓN DE IMÁGENES OG (OPEN GRAPH)

## Especificaciones Técnicas

- **Dimensiones:** 1200 x 630 px (ratio 1.91:1)
- **Formato:** JPG optimizado (WebP como alternativa)
- **Peso máximo:** < 300 KB (idealmente < 200 KB)
- **Zona segura:** 20% de márgenes (evitar texto/elementos importantes en los bordes)

---

## Diseño Común para Todas las Imágenes

### Paleta de Colores Scorus Fitness
- **Negro:** #000000 (fondo principal)
- **Rojo:** #DC2626 / #EF4444 (acentos)
- **Blanco:** #FFFFFF (texto)
- **Gris oscuro:** #1F2937

### Tipografía
- **Principal:** Poppins Black (900) / Bold (700)
- **Secundaria:** Space Mono (para detalles)
- **Estilo:** Uppercase, tracking apretado

### Elementos Comunes
1. **Logo:** Esquina superior izquierda (150x50px aprox.)
2. **Fondo:** Negro sólido o con imagen oscurecida al 60%
3. **Textura:** Opcional: líneas diagonales rojas sutiles
4. **Marca de agua:** "SCORUSFITNESS.COM" en la esquina inferior derecha

---

## Imágenes a Crear

### 1. `og-home.jpg`
**Título:** "SCORUS FITNESS"  
**Subtítulo:** "Entrenamiento Personal | Alicante"  
**Elementos:**
- Imagen de fondo: Bernat entrenando o posando (oscurecida)
- Texto grande centrado en blanco/rojo
- Iconos: Dumbbell 🏋️, Flame 🔥

**Concepto:** Potente, motivador, profesional

---

### 2. `og-services.jpg`
**Título:** "SERVICIOS"  
**Subtítulo:** "Programas Personalizados | Resultados Reales"  
**Elementos:**
- Fondo: Collage de personas entrenando
- Grid de íconos representando servicios (entrenamiento, nutrición, consultoría)
- Estilo minimalista con líneas rojas

**Concepto:** Variedad, profesionalismo, transformación

---

### 3. `og-academy.jpg`
**Título:** "SCORUS ACADEMIA"  
**Subtítulo:** "Formación Profesional | Educación Elite"  
**Elementos:**
- Fondo: Aula/seminario o Bernat enseñando
- Iconos: Libro 📚, Certificado 🎓, Trophy 🏆
- Diseño más "educativo" pero manteniendo la estética fitness

**Concepto:** Conocimiento, crecimiento, excelencia

---

### 4. `og-gym.jpg`
**Título:** "SCORUS GYM"  
**Subtítulo:** "Tu Espacio | Tu Ritmo | Tu Música"  
**Elementos:**
- Fondo: Interior del gimnasio (gym-01.jpg)
- Destacar equipamiento de alta gama
- Estilo "boutique gym"

**Concepto:** Exclusividad, equipamiento premium, espacio personalizado

---

### 5. `og-biography.jpg`
**Título:** "BERNAT SCORUS"  
**Subtítulo:** "Campeón Mundial | Transformación Real"  
**Elementos:**
- Fondo: Foto profesional de Bernat (competición o posando)
- Timeline visual (de principiante a campeón)
- Medallas/trofeos sutiles

**Concepto:** Inspiración, trayectoria, superación

---

### 6. `og-blog.jpg`
**Título:** "BLOG SCORUS"  
**Subtítulo:** "Conocimiento | Nutrición | Entrenamiento"  
**Elementos:**
- Fondo: Collage de artículos/categorías
- Iconos: Apple 🍎, Dumbbell 🏋️, Brain 🧠
- Diseño más editorial

**Concepto:** Educación, contenido de valor, expertise

---

### 7. `og-contact.jpg`
**Título:** "CONTÁCTANOS"  
**Subtítulo:** "Empieza Tu Transformación Hoy"  
**Elementos:**
- Fondo: Imagen motivadora (persona entrenando)
- CTA visual: "¡Reserva tu sesión!"
- Iconos de contacto: Phone 📞, Email 📧, WhatsApp 💬

**Concepto:** Call to action, accesibilidad, motivación

---

## Herramientas Recomendadas

1. **Figma** - Diseño colaborativo (gratis)
2. **Canva Pro** - Plantillas prediseñadas
3. **Photoshop** - Máximo control
4. **Affinity Designer** - Alternativa a Photoshop
5. **Remove.bg** - Eliminar fondos de fotos

---

## Checklist de Calidad

- [ ] Dimensiones correctas (1200x630px)
- [ ] Peso < 300KB
- [ ] Texto legible en móvil (mínimo 40px de altura)
- [ ] Logo de Scorus visible
- [ ] Colores de marca respetados
- [ ] Contraste adecuado (WCAG AA)
- [ ] Sin elementos cortados en los bordes
- [ ] Optimizada con TinyPNG o similar

---

## Ubicación de Archivos

Guardar en: `public/images/og/`

```
public/
└── images/
    └── og/
        ├── og-home.jpg
        ├── og-services.jpg
        ├── og-academy.jpg
        ├── og-gym.jpg
        ├── og-biography.jpg
        ├── og-blog.jpg
        └── og-contact.jpg
```

---

## Implementación en Código

Una vez creadas las imágenes, actualizar cada página para usar su OG image específica:

### Ejemplo: Home
```astro
<Layout
  title="Scorus Fitness | Entrenamiento Personal en Alicante"
  description="..."
  image="/images/og/og-home.jpg"
>
```

### Ejemplo: Servicios
```astro
<Layout
  title="Servicios | Scorus Fitness"
  description="..."
  image="/images/og/og-services.jpg"
>
```

---

## Testing

Después de implementar, testear las imágenes en:

1. **Facebook Sharing Debugger:** https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator:** https://cards-dev.twitter.com/validator
3. **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/

---

**Nota:** Si no tienes recursos para diseñar, puedes usar servicios como:
- Fiverr (5-20€ por imagen)
- 99designs
- O usar las herramientas de IA como Midjourney/DALL-E para generar fondos

