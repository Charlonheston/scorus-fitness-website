# Extracción Manual de Frames - Video Training

Ya que no tienes `ffmpeg` instalado, aquí tienes **3 opciones** para extraer los frames:

## Opción 1: Instalar FFmpeg (Recomendado)

### Windows:
1. Descarga FFmpeg desde: https://www.gyan.dev/ffmpeg/builds/
2. Descarga la versión "ffmpeg-release-essentials.zip"
3. Extrae el ZIP
4. Copia los archivos `ffmpeg.exe` y `ffprobe.exe` a `C:\Windows\System32\`
5. Reinicia el terminal
6. Ejecuta: `node scripts/extract-training-frames.mjs`

## Opción 2: Usar Herramienta Online

1. Ve a: https://ezgif.com/video-to-jpg
2. Sube el video: `public/videos/biography/bernat-training.webm`
3. Configura:
   - Frames to extract: **150**
   - Output format: **WebP**
   - Quality: **85%**
4. Descarga el ZIP con los frames
5. Extrae los frames en: `public/images/about/biography/training-frames/`
6. Renombra los archivos a: `frame-001.webp`, `frame-002.webp`, etc.

## Opción 3: Usar Script JavaScript en el Navegador

1. Abre Chrome/Edge
2. Ve a: `http://localhost:4321/es/biografia` (o donde esté tu página)
3. Abre DevTools (F12) > Console
4. Pega y ejecuta este código:

```javascript
// Este script extrae frames de un video y los descarga automáticamente
const video = document.createElement('video');
video.src = '/videos/biography/bernat-training.webm';
video.muted = true;
video.playsInline = true;

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

let frameCount = 0;
const totalFrames = 150;

video.addEventListener('loadedmetadata', () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  const duration = video.duration;
  const interval = duration / totalFrames;
  
  let currentTime = 0;
  
  const extractFrame = () => {
    if (frameCount >= totalFrames) {
      console.log('✅ Extracción completa!');
      return;
    }
    
    video.currentTime = currentTime;
    
    video.onseeked = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `frame-${String(frameCount + 1).padStart(3, '0')}.webp`;
        a.click();
        URL.revokeObjectURL(url);
        
        frameCount++;
        currentTime += interval;
        
        console.log(`Frame ${frameCount}/${totalFrames} extraído`);
        
        setTimeout(extractFrame, 500); // Esperar 500ms entre frames
      }, 'image/webp', 0.85);
    };
  };
  
  extractFrame();
});

video.load();
```

5. Los frames se descargarán automáticamente
6. Mueve todos los frames a: `public/images/about/biography/training-frames/`

---

**¿Qué opción prefieres?**

- **Opción 1** es la mejor para futuros proyectos
- **Opción 2** es la más rápida (5 minutos)
- **Opción 3** es totalmente automática pero descarga 150 archivos individuales

