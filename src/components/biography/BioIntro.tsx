import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

interface Props {
  videoMp4?: string;
  videoWebm?: string;
  poster?: string;
  framesPattern?: string; // p.ej. '/videos/biography/intro-frames/frame_{index}.webp'
  framesCount?: number;   // p.ej. 600
  frames2Pattern?: string; // Frames del segundo video (training)
  frames2Count?: number;   // Total de frames del segundo video
}

export default function BioIntro({ videoMp4, videoWebm, poster = '/images/hero/bernat-hero.webp', framesPattern, framesCount, frames2Pattern, frames2Count }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleLeftRef = useRef<HTMLSpanElement>(null);
  const titleRightRef = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null); // Segundo video (training)
  const video2OverlayRef = useRef<HTMLDivElement>(null); // Overlay del segundo video
  const nextTitleInnerRef = useRef<HTMLDivElement>(null);
  // H2 posterior a Tabs: "El Sacrificio de la Competición"
  const compTitleBlockRef = useRef<HTMLDivElement>(null);
  const compTitleTextRef = useRef<HTMLHeadingElement>(null);
  const compTopBarRef = useRef<HTMLDivElement>(null);
  const compBottomBarRef = useRef<HTMLDivElement>(null);
  // Párrafo posterior (ventana 3:4) que empuja el H2 hacia arriba
  const compParaBlockRef = useRef<HTMLDivElement>(null);
  const compParaWrapperRef = useRef<HTMLDivElement>(null);
  const compParaContainerRef = useRef<HTMLDivElement>(null);
  const compParaTextRef = useRef<HTMLDivElement>(null);
  // Target dinámico para mantener el H2 encima del párrafo cuando entra
  let compLiftTargetPx = 120;

  // Canvas flipbook (primer video)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useCanvas, setUseCanvas] = useState(false);
  const imageCacheRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const currentFrameRef = useRef<number>(0);
  const drawingRef = useRef<boolean>(false);

  // Canvas flipbook (segundo video - training)
  const canvas2Ref = useRef<HTMLCanvasElement>(null);
  const [useCanvas2, setUseCanvas2] = useState(false);
  const imageCache2Ref = useRef<Map<number, HTMLImageElement>>(new Map());
  const currentFrame2Ref = useRef<number>(0);
  const drawing2Ref = useRef<boolean>(false);

  // Citas
  const quoteRef = useRef<HTMLDivElement>(null);
  const quote2Ref = useRef<HTMLDivElement>(null);
  const quote2TextRef = useRef<HTMLParagraphElement>(null);
  const quote2FullText = 'El cuerpo logra lo que la mente cree.';
  
  // Tabs Netflix (controlados por scroll)
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tab1Ref = useRef<HTMLButtonElement>(null); // Progresión
  const tab2Ref = useRef<HTMLButtonElement>(null); // Workout
  const tab3Ref = useRef<HTMLButtonElement>(null); // Nutrición
  const tabTextRef = useRef<HTMLParagraphElement>(null);
  const tabButtonsContainerRef = useRef<HTMLDivElement>(null); // Contenedor de botones para centrado
  const [activeTab, setActiveTab] = useState<'progresion' | 'workout' | 'nutricion'>('progresion');
  
  const tabsContent = {
    progresion: 'Desde mis inicios en el culturismo, supe que la clave del éxito es la disciplina y el esfuerzo constante. Con una metodología basada en la experiencia y el aprendizaje, mi misión es ayudarte a conseguir resultados reales.',
    workout: 'Con una carrera marcada por la superación y el rendimiento, mis programas están diseñados para que alcances tu máximo potencial con un enfoque personalizado y estructurado.',
    nutricion: 'El fitness es mucho más que levantar pesas. La alimentación es la base de una transformación duradera y en Scorus Fitness ofrecemos planes nutricionales adaptados a cada persona.',
  };

  // Bloque siguiente eliminado temporalmente (H2/imagen/párrafo)
  const nextTitleRef = useRef<HTMLHeadingElement>(null);
  const nextTitleBlockRef = useRef<HTMLDivElement>(null);
  const nextBodyRef = useRef<HTMLDivElement>(null);
  const nextBodyStaticRef = useRef<HTMLParagraphElement>(null);
  const nextImageRef = useRef<HTMLDivElement>(null);
  const nextParagraphsRef = useRef<HTMLDivElement>(null);
  const nextParagraphsContainerRef = useRef<HTMLDivElement>(null);
  const nextBodyFullText = `Bernat nació el 6 de julio de 1979 en Marosvásárhely, Transilvania, pero desde muy pequeño se trasladó con su familia a Budapest, Hungría, donde pasó la mayor parte de su infancia. Su entorno familiar estaba lleno de deportistas de élite: su abuelo y sus tíos fueron campeones en diversas disciplinas, por lo que el deporte siempre estuvo presente en su vida. Desde los 6 años, practicó diversas actividades físicas como natación, gimnasia, karate, fútbol, baloncesto y atletismo, pero ninguno de estos deportes despertó en él una verdadera vocación. Sin embargo, su atracción por los cuerpos musculosos y bien desarrollados crecía con cada película de acción que veía. Arnold Schwarzenegger, Sylvester Stallone y Jean-Claude Van Damme eran sus ídolos, y soñaba con construir un físico impresionante como el de ellos.`;
  const paragraphsFullText = `Desde los 6 años, practicó diversas actividades físicas como natación, gimnasia, karate, fútbol, baloncesto y atletismo, pero ninguno de estos deportes despertó en él una verdadera vocación. Sin embargo, su atracción por los cuerpos musculosos y bien desarrollados crecía con cada película de acción que veía. Arnold Schwarzenegger, Sylvester Stallone y Jean-Claude Van Damme eran sus ídolos, y soñaba con construir un físico impresionante como el de ellos.\n\nEl punto de inflexión llegó en 1994, cuando asistió a su primer evento de culturismo. Ver en directo a leyendas como Flex Wheeler, Milos Sarcev y Robby Robinson lo impactó profundamente. En ese momento, supo que quería dedicar su vida al entrenamiento y al desarrollo físico.\n\nSin embargo, había un problema: su genética no parecía la ideal para este deporte. Con solo 50 kg de peso, un diámetro de brazo de 28 cm y un pecho de 80 cm, su familia y amigos le decían que no tenía la estructura necesaria para el culturismo. Pero él no se dejó desanimar. Su determinación y su visión estaban claras: iba a demostrar que el esfuerzo y la constancia podían superar cualquier obstáculo.`;

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!containerRef.current) return;

    // En mobile: añadir padding-top cuando el header se fija (scroll > 50px)
    const isMobileDevice = window.matchMedia('(max-width: 767px)').matches;
    if (isMobileDevice) {
      const handleHeaderOffset = () => {
        const scrollY = window.scrollY || window.pageYOffset;
        const headerHeight = 64; // altura del header fijo en mobile
        if (containerRef.current) {
          if (scrollY > 50) {
            containerRef.current.style.paddingTop = `${headerHeight}px`;
          } else {
            containerRef.current.style.paddingTop = '0px';
          }
        }
      };
      window.addEventListener('scroll', handleHeaderOffset, { passive: true });
      handleHeaderOffset(); // ejecutar al cargar
    }

    // Estados iniciales para evitar flashes al cargar
    if (nextTitleRef.current) gsap.set(nextTitleRef.current, { y: 0 });
    if (nextImageRef.current) gsap.set(nextImageRef.current, { x: '100vw' });
    if (nextBodyRef.current) {
      nextBodyRef.current.textContent = '';
    }
    if (nextBodyStaticRef.current) {
      nextBodyStaticRef.current.textContent = '';
    }
    if (nextParagraphsContainerRef.current) gsap.set(nextParagraphsContainerRef.current, { x: '100vw' });
    if (nextParagraphsRef.current) {
      nextParagraphsRef.current.textContent = '';
    }
    if (quote2Ref.current) gsap.set(quote2Ref.current, { y: '-120vh', opacity: 1 });
    if (quote2TextRef.current) quote2TextRef.current.textContent = '';
    if (tabsContainerRef.current) gsap.set(tabsContainerRef.current, { scale: 0.1, opacity: 0 });
    
    // Asegurar opacidad completa de los tabs individuales desde el inicio
    if (tab1Ref.current) gsap.set(tab1Ref.current, { opacity: 1 });
    if (tab2Ref.current) gsap.set(tab2Ref.current, { opacity: 1 });
    if (tab3Ref.current) gsap.set(tab3Ref.current, { opacity: 1 });

    // Asegurar visibilidad del H2
    if (nextTitleRef.current) gsap.set(nextTitleRef.current, { opacity: 1 });

    // Entrada suave
    gsap.fromTo(
      [titleLeftRef.current, titleRightRef.current, subtitleRef.current, bodyRef.current],
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.08,
      }
    );

    // Recorrido para scrubbing
    const scrollScreens = 12;
    const totalScroll = window.innerHeight * scrollScreens;
    const scrollEl = document.scrollingElement || document.documentElement;

    // Intro sale rápido 0–20%
    gsap.to(titleLeftRef.current, {
      x: '-100vw',
      ease: 'none',
      scrollTrigger: {
        trigger: scrollEl as Element,
        start: 'top top',
        end: `+=${totalScroll * 0.2}`,
        scrub: true,
      },
    });

    gsap.to(titleRightRef.current, {
      x: '100vw',
      ease: 'none',
      scrollTrigger: {
        trigger: scrollEl as Element,
        start: 'top top',
        end: `+=${totalScroll * 0.2}`,
        scrub: true,
      },
    });

    gsap.to(subtitleRef.current, {
      x: '-120vw',
      ease: 'none',
      scrollTrigger: {
        trigger: scrollEl as Element,
        start: `+=${totalScroll * 0.02} top`,
        end: `+=${totalScroll * 0.2}`,
        scrub: true,
      },
    });

    gsap.to(bodyRef.current, {
      x: '120vw',
      ease: 'none',
      scrollTrigger: {
        trigger: scrollEl as Element,
        start: `+=${totalScroll * 0.05} top`,
        end: `+=${totalScroll * 0.2}`,
        scrub: true,
      },
    });

    // Cita: una sola timeline 10–16% (entra y sale) en desktop; en móvil la extendemos unos “snaps” más
    if (quoteRef.current) gsap.set(quoteRef.current, { y: '-120vh', opacity: 1 });
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const quoteEndFactor = isMobile ? 0.20 : 0.16; // valores más conservadores
    const quoteTl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollEl as Element,
        start: `+=${totalScroll * 0.12} top`,
        end: `+=${totalScroll * quoteEndFactor}`,
        scrub: true,
      },
    });
    quoteTl
      .to(quoteRef.current, { y: 0, ease: 'power3.out', duration: 0.5 })
      .to(quoteRef.current, { y: '-120vh', ease: 'power3.in', duration: 0.5 });

    // Parámetros del flip del H2
    const TITLE_FLIP_START = quoteEndFactor + (isMobile ? 0.1 : 0.11 - 0.02);  // móvil un poco más tarde
    const TITLE_FLIP_DISTANCE_PX = isMobile ? 240 : 300;                   // móvil ~2.4 notches, desktop ~3
    const TITLE_FLIP_ANGLE = 90;                                                          // flip marcado

    // Estado inicial H2 (preparado para flip, visible y centrado; sin opacidad)
    if (nextTitleBlockRef.current) {
      gsap.set(nextTitleBlockRef.current, { opacity: 1 });
      const spansUp = nextTitleBlockRef.current.querySelectorAll('.flip-up');
      const spansDown = nextTitleBlockRef.current.querySelectorAll('.flip-down');
      gsap.set(spansUp, { rotateX: TITLE_FLIP_ANGLE, transformPerspective: 1000, transformOrigin: 'bottom center' });
      gsap.set(spansDown, { rotateX: -TITLE_FLIP_ANGLE, transformPerspective: 1000, transformOrigin: 'top center' });
    }

    // Flip del H2 justo después de la cita
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${totalScroll * TITLE_FLIP_START} top`,
      end: `+=${TITLE_FLIP_DISTANCE_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!nextTitleBlockRef.current) return;
        const spansUp = nextTitleBlockRef.current.querySelectorAll('.flip-up');
        const spansDown = nextTitleBlockRef.current.querySelectorAll('.flip-down');
        const p = self.progress;
        gsap.to(spansUp, { rotateX: gsap.utils.mapRange(0, 1, TITLE_FLIP_ANGLE, 0)(p), ease: 'none', overwrite: 'auto' });
        gsap.to(spansDown, { rotateX: gsap.utils.mapRange(0, 1, -TITLE_FLIP_ANGLE, 0)(p), ease: 'none', overwrite: 'auto' });
      },
    });

    // Desplazamiento del H2 tras terminar el flip: subir SOLO ~100px y quedarse fijo
    const moveStartPx = totalScroll * TITLE_FLIP_START + TITLE_FLIP_DISTANCE_PX; // justo al terminar flip
    const LIFT_MAX_PX = 100;                               // cuánto sube desde el centro (px)
    const LIFT_SCROLL_PX = isMobile ? 200 : 240;           // cuánto scroll se usa para completar la subida
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${moveStartPx} top`,
      end: `+=${LIFT_SCROLL_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!nextTitleInnerRef.current) return;
        const y = -LIFT_MAX_PX * self.progress; // desde 0px hasta -100px y se queda ahí
        gsap.set(nextTitleInnerRef.current, { y });
      },
    });

    // Escritura del párrafo: empieza junto a la subida del H2 y se escribe con el scroll
    const TYPE_SCROLL_PX = isMobile ? 1000 : 1000;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${moveStartPx} top`,
      end: `+=${TYPE_SCROLL_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!nextBodyRef.current) return;
        const total = nextBodyFullText.length;
        const chars = Math.max(0, Math.min(total, Math.floor(self.progress * total)));
        nextBodyRef.current.textContent = nextBodyFullText.slice(0, chars);
      },
      onLeaveBack: () => {
        if (nextBodyRef.current) nextBodyRef.current.textContent = '';
      },
    });

    // Desplazamiento lateral del H2 y párrafo hacia la izquierda (salir del viewport)
    const HOLD_SCROLL_PX = isMobile ? 300 : 350; // esperar ~3-4 notches antes de salir
    const slideOutStartPx = moveStartPx + TYPE_SCROLL_PX + HOLD_SCROLL_PX; // esperar tras typing
    const SLIDE_OUT_SCROLL_PX = isMobile ? 200 : 250; // recorrido de scroll para salir
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${slideOutStartPx} top`,
      end: `+=${SLIDE_OUT_SCROLL_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!nextTitleInnerRef.current) return;
        const x = -window.innerWidth * self.progress; // desplazar desde 0 hasta -100vw
        gsap.set(nextTitleInnerRef.current, { x });
        // Imagen entra desde la derecha al mismo tiempo
        if (nextImageRef.current) {
          const imgX = window.innerWidth * (1 - self.progress); // desde +100vw hasta 0
          gsap.set(nextImageRef.current, { x: imgX });
        }
      },
      onLeaveBack: () => {
        if (nextTitleInnerRef.current) gsap.set(nextTitleInnerRef.current, { x: 0 });
        if (nextImageRef.current) gsap.set(nextImageRef.current, { x: '100vw' });
      },
    });

    // Empujar imagen hacia la izquierda (salir del viewport) tras un hold adicional
    const IMAGE_HOLD_PX = isMobile ? 300 : 350; // esperar ~3-4 notches con imagen centrada
    const imageSlideOutStartPx = slideOutStartPx + SLIDE_OUT_SCROLL_PX + IMAGE_HOLD_PX;
    const IMAGE_SLIDE_OUT_PX = isMobile ? 200 : 250;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${imageSlideOutStartPx} top`,
      end: `+=${IMAGE_SLIDE_OUT_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!nextImageRef.current) return;
        const x = -window.innerWidth * self.progress; // desde 0 hasta -100vw
        gsap.set(nextImageRef.current, { x });
        // Nuevo contenedor de párrafos entra desde la derecha al mismo tiempo
        if (nextParagraphsContainerRef.current) {
          const pX = window.innerWidth * (1 - self.progress); // desde +100vw hasta 0
          gsap.set(nextParagraphsContainerRef.current, { x: pX });
        }
      },
      onLeaveBack: () => {
        if (nextImageRef.current) gsap.set(nextImageRef.current, { x: 0 });
        if (nextParagraphsContainerRef.current) gsap.set(nextParagraphsContainerRef.current, { x: '100vw' });
      },
    });

    // Escritura de los párrafos + desplazamiento interno (desaparecen por arriba del contenedor)
    const PARAGRAPHS_TYPE_SCROLL_PX = isMobile ? 1200 : 1500;
    const paragraphsScrollStartPx = imageSlideOutStartPx + IMAGE_SLIDE_OUT_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${paragraphsScrollStartPx} top`,
      end: `+=${PARAGRAPHS_TYPE_SCROLL_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!nextParagraphsRef.current || !nextParagraphsContainerRef.current) return;
        const total = paragraphsFullText.length;
        const chars = Math.floor(self.progress * total);
        nextParagraphsRef.current.textContent = paragraphsFullText.slice(0, chars);
        
        // Desplazar el texto hacia arriba dentro de la ventana Netflix
        // El texto sube progresivamente, desapareciendo por arriba del contenedor
        const innerContainer = nextParagraphsContainerRef.current.querySelector('.overflow-hidden') as HTMLElement;
        const containerHeight = innerContainer?.offsetHeight || 0;
        const contentHeight = nextParagraphsRef.current.scrollHeight;
        const maxScroll = Math.max(0, contentHeight - containerHeight + 100); // +100 para asegurar que desaparece completamente
        const translateY = -maxScroll * self.progress;
        gsap.set(nextParagraphsRef.current, { y: translateY });
      },
      onLeaveBack: () => {
        if (nextParagraphsRef.current) {
          nextParagraphsRef.current.textContent = '';
          gsap.set(nextParagraphsRef.current, { y: 0 });
        }
      },
    });

    // Desplazar el contenedor de párrafos hacia abajo
    const PARAGRAPHS_HOLD_PX = isMobile ? 300 : 350; // esperar un poco antes de bajar
    const paragraphsSlideDownStartPx = paragraphsScrollStartPx + PARAGRAPHS_TYPE_SCROLL_PX + PARAGRAPHS_HOLD_PX;
    const PARAGRAPHS_SLIDE_DOWN_PX = isMobile ? 200 : 250;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${paragraphsSlideDownStartPx} top`,
      end: `+=${PARAGRAPHS_SLIDE_DOWN_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!nextParagraphsContainerRef.current) return;
        const y = window.innerHeight * self.progress; // desde 0 hasta +100vh (hacia abajo)
        gsap.set(nextParagraphsContainerRef.current, { y });
      },
      onLeaveBack: () => {
        if (nextParagraphsContainerRef.current) gsap.set(nextParagraphsContainerRef.current, { y: 0 });
      },
    });

    // Nueva cita baja desde arriba (primero la caja, luego escritura)
    const quote2StartPx = paragraphsSlideDownStartPx + PARAGRAPHS_SLIDE_DOWN_PX;
    const QUOTE2_ENTRY_PX = isMobile ? 300 : 400; // entrada de la caja (más lento)
    const QUOTE2_TYPE_PX = isMobile ? 400 : 500; // escritura
    const QUOTE2_HOLD_PX = isMobile ? 400 : 500; // mantener fija varios notches
    
    // Entrada de la caja desde arriba (más lento)
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${quote2StartPx} top`,
      end: `+=${QUOTE2_ENTRY_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!quote2Ref.current) return;
        const q2Y = -window.innerHeight * 1.2 * (1 - self.progress); // desde -120vh hasta 0
        gsap.set(quote2Ref.current, { y: q2Y });
      },
      onLeaveBack: () => {
        if (quote2Ref.current) gsap.set(quote2Ref.current, { y: '-120vh' });
        if (quote2TextRef.current) quote2TextRef.current.textContent = '';
      },
    });

    // Efecto de escritura del texto de la cita (dentro del div)
    const quote2TypeStartPx = quote2StartPx + QUOTE2_ENTRY_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${quote2TypeStartPx} top`,
      end: `+=${QUOTE2_TYPE_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!quote2TextRef.current) return;
        const total = quote2FullText.length;
        const chars = Math.floor(self.progress * total);
        quote2TextRef.current.textContent = quote2FullText.slice(0, chars);
      },
      onLeaveBack: () => {
        if (quote2TextRef.current) quote2TextRef.current.textContent = '';
      },
    });

    // Salida de la cita: texto a la izquierda, contenedor a la derecha
    const quote2ExitStartPx = quote2TypeStartPx + QUOTE2_TYPE_PX + QUOTE2_HOLD_PX;
    const QUOTE2_EXIT_PX = isMobile ? 250 : 300;
    const TABS_ZOOM_PX = isMobile ? 250 : 300;
    
    // Separación: contenedor div a la derecha, texto (p) a la izquierda
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${quote2ExitStartPx} top`,
      end: `+=${QUOTE2_EXIT_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!quote2Ref.current || !quote2TextRef.current) return;
        // Contenedor completo va a la derecha
        const containerX = window.innerWidth * self.progress;
        gsap.set(quote2Ref.current, { x: containerX });
        // Texto (párrafo) va a la izquierda (mucho más rápido para salir completamente)
        const textX = -window.innerWidth * 2.5 * self.progress; // 2.5x para desaparecer totalmente
        gsap.set(quote2TextRef.current, { x: textX });
      },
      onLeaveBack: () => {
        if (quote2Ref.current) gsap.set(quote2Ref.current, { x: 0 });
        if (quote2TextRef.current) gsap.set(quote2TextRef.current, { x: 0 });
      },
    });

    // Tabs con zoom (de muy pequeño a tamaño normal)
    const tabsZoomStartPx = quote2ExitStartPx + QUOTE2_EXIT_PX;
    
    // Control de tabs por scroll: ~7 notches por transición
    const TAB_TRANSITION_PX = isMobile ? 525 : 700; // 7 notches por transición
    const tabsScrollStartPx = tabsZoomStartPx + TABS_ZOOM_PX;
    
    // CARRUSEL 3D TIPO COVERFLOW: Los botones rotan sobre un eje central
    // El activo al frente, los otros a los lados y ligeramente atrás
    const SIDE_OFFSET = isMobile ? 7 : 25;        // Separación horizontal izq/der (extremos)
    const CENTER_SIDE_OFFSET = isMobile ? 7 : 25;  // Separación cuando el centro está activo (más juntos)
    const DEPTH_OFFSET = isMobile ? 7 : 25;        // Profundidad (atrás en Z)
    const SIDE_ROTATION = 40;                        // Rotación Y de botones laterales
    
    // Posiciones fijas tipo coverflow:
    // Centro: x=0, z=-50 (ligeramente adelante), rotateY=0, scale=1.15
    // Izquierda: x=-SIDE_OFFSET, z=DEPTH_OFFSET (atrás), rotateY=+SIDE_ROTATION, scale=0.85
    // Derecha: x=+SIDE_OFFSET, z=DEPTH_OFFSET (atrás), rotateY=-SIDE_ROTATION, scale=0.85
    
    // Estado inicial: Tab1 al centro (frente), Tab2 derecha, Tab3 izquierda
    if (tab1Ref.current && tab2Ref.current && tab3Ref.current) {
      // Tab1: CENTRO (activo)
      gsap.set(tab1Ref.current, { 
        x: 0, 
        z: -50,
        scale: 1.15, 
        opacity: 1,
        rotateY: 0
      });
      // Tab2: DERECHA (inactivo)
      gsap.set(tab2Ref.current, { 
        x: SIDE_OFFSET, 
        z: DEPTH_OFFSET,
        scale: 0.85, 
        opacity: 0.6,
        rotateY: -SIDE_ROTATION
      });
      // Tab3: IZQUIERDA (inactivo)
      gsap.set(tab3Ref.current, { 
        x: -SIDE_OFFSET, 
        z: DEPTH_OFFSET,
        scale: 0.85, 
        opacity: 0.6,
        rotateY: SIDE_ROTATION
      });
    }
    
    // Zoom de entrada
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${tabsZoomStartPx} top`,
      end: `+=${TABS_ZOOM_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!tabsContainerRef.current) return;
        const scale = 0.1 + (0.9 * self.progress);
        const opacity = self.progress;
        gsap.set(tabsContainerRef.current, { scale, opacity });
        
        // Mantener posiciones coverflow durante entrada
        if (tab1Ref.current && tab2Ref.current && tab3Ref.current) {
          gsap.set(tab1Ref.current, { x: 0, z: -50, scale: 1.15, opacity: 1, rotateY: 0 });
          gsap.set(tab2Ref.current, { x: SIDE_OFFSET, z: DEPTH_OFFSET, scale: 0.85, opacity: 0.6, rotateY: -SIDE_ROTATION });
          gsap.set(tab3Ref.current, { x: -SIDE_OFFSET, z: DEPTH_OFFSET, scale: 0.85, opacity: 0.6, rotateY: SIDE_ROTATION });
        }
      },
      onLeaveBack: () => {
        if (tabsContainerRef.current) gsap.set(tabsContainerRef.current, { scale: 0.1, opacity: 0 });
        setActiveTab('progresion');
      },
    });

    // Control de tabs y texto con scroll (botones fijos, solo texto y color cambian)
    const text1 = tabsContent.progresion;
    const text2 = tabsContent.workout;
    const text3 = tabsContent.nutricion;
    
    // Duración de escritura (~5 notches) y pausa (~2 notches)
    const TYPING_PX = isMobile ? 375 : 500; 
    const PAUSE_PX = isMobile ? 150 : 200;  
    
    let currentScrollPx = tabsScrollStartPx;
    
    // Fase 1: Escribir texto de Progresión (tab1 grande)
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${currentScrollPx} top`,
      end: `+=${TYPING_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!tabTextRef.current) return;
        const chars = Math.floor(self.progress * text1.length);
        tabTextRef.current.textContent = text1.slice(0, chars);
      },
      onLeaveBack: () => {
        if (tabTextRef.current) tabTextRef.current.textContent = '';
      },
    });
    
    currentScrollPx += TYPING_PX + PAUSE_PX;
    
    // Transición 1: Progresión → Workout (rotación coverflow)
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${currentScrollPx} top`,
      end: `+=${TAB_TRANSITION_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!tab1Ref.current || !tab2Ref.current || !tab3Ref.current || !tabTextRef.current) return;
        
        const progress = self.progress >= 0.5 ? 1 : 0; // Cambio abrupto
        
        // Estado 1 (Progresión): Tab1 centro, Tab2 derecha, Tab3 izquierda
        // Estado 2 (Workout): Tab1 izquierda, Tab2 centro, Tab3 derecha→izquierda (wrap)
        
        if (progress === 1) {
          // WORKOUT activo (centro) - usar offset más pequeño para mantener juntos
          gsap.set(tab1Ref.current, { x: -CENTER_SIDE_OFFSET, z: DEPTH_OFFSET, scale: 0.85, opacity: 0.6, rotateY: SIDE_ROTATION });
          gsap.set(tab2Ref.current, { x: 0, z: -50, scale: 1.15, opacity: 1, rotateY: 0 });
          gsap.set(tab3Ref.current, { x: CENTER_SIDE_OFFSET, z: DEPTH_OFFSET, scale: 0.85, opacity: 0.6, rotateY: -SIDE_ROTATION });
        } else {
          // PROGRESIÓN activo (extremo)
          gsap.set(tab1Ref.current, { x: 0, z: -50, scale: 1.15, opacity: 1, rotateY: 0 });
          gsap.set(tab2Ref.current, { x: SIDE_OFFSET, z: DEPTH_OFFSET, scale: 0.85, opacity: 0.6, rotateY: -SIDE_ROTATION });
          gsap.set(tab3Ref.current, { x: -SIDE_OFFSET, z: DEPTH_OFFSET, scale: 0.85, opacity: 0.6, rotateY: SIDE_ROTATION });
        }
        
        // Cambiar estado y texto
        if (progress === 1) {
          setActiveTab('workout');
          tabTextRef.current.textContent = '';
        } else {
          setActiveTab('progresion');
          if (self.progress < 0.3) {
            tabTextRef.current.textContent = text1;
          } else if (self.progress < 0.5) {
            const remaining = Math.floor((1 - ((self.progress - 0.3) / 0.2)) * text1.length);
            tabTextRef.current.textContent = text1.slice(0, remaining);
          }
        }
      },
      onLeaveBack: () => {
        setActiveTab('progresion');
        if (tab1Ref.current && tab2Ref.current && tab3Ref.current) {
          // PROGRESIÓN activo (extremo)
          gsap.set(tab1Ref.current, { x: 0, z: -50, scale: 1.15, opacity: 1, rotateY: 0 });
          gsap.set(tab2Ref.current, { x: SIDE_OFFSET, z: DEPTH_OFFSET, scale: 0.85, opacity: 0.6, rotateY: -SIDE_ROTATION });
          gsap.set(tab3Ref.current, { x: -SIDE_OFFSET, z: DEPTH_OFFSET, scale: 0.85, opacity: 0.6, rotateY: SIDE_ROTATION });
        }
        if (tabTextRef.current) tabTextRef.current.textContent = text1;
      },
    });
    
    currentScrollPx += TAB_TRANSITION_PX;
    
    // Fase 2: Escribir texto de Workout
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${currentScrollPx} top`,
      end: `+=${TYPING_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!tabTextRef.current) return;
        const chars = Math.floor(self.progress * text2.length);
        tabTextRef.current.textContent = text2.slice(0, chars);
      },
      onLeaveBack: () => {
        if (tabTextRef.current) tabTextRef.current.textContent = '';
      },
    });
    
    currentScrollPx += TYPING_PX + PAUSE_PX;
    
    // Transición 2: Workout → Nutrición (rotación coverflow)
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${currentScrollPx} top`,
      end: `+=${TAB_TRANSITION_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!tab1Ref.current || !tab2Ref.current || !tab3Ref.current || !tabTextRef.current) return;
        
        const progress = self.progress >= 0.5 ? 1 : 0;
        
        // Estado 2 (Workout): Tab1 izquierda, Tab2 centro, Tab3 derecha
        // Estado 3 (Nutrición): Tab1 derecha→izquierda (wrap), Tab2 izquierda, Tab3 centro
        
        if (progress === 1) {
          // NUTRICIÓN activo
          gsap.set(tab1Ref.current, { x: SIDE_OFFSET, z: DEPTH_OFFSET, scale: 0.85, opacity: 0.6, rotateY: -SIDE_ROTATION });
          gsap.set(tab2Ref.current, { x: -SIDE_OFFSET, z: DEPTH_OFFSET, scale: 0.85, opacity: 0.6, rotateY: SIDE_ROTATION });
          gsap.set(tab3Ref.current, { x: 0, z: -50, scale: 1.15, opacity: 1, rotateY: 0 });
        } else {
          // WORKOUT activo
          gsap.set(tab1Ref.current, { x: -SIDE_OFFSET, z: DEPTH_OFFSET, scale: 0.85, opacity: 0.6, rotateY: SIDE_ROTATION });
          gsap.set(tab2Ref.current, { x: 0, z: -50, scale: 1.15, opacity: 1, rotateY: 0 });
          gsap.set(tab3Ref.current, { x: SIDE_OFFSET, z: DEPTH_OFFSET, scale: 0.85, opacity: 0.6, rotateY: -SIDE_ROTATION });
        }
        
        // Cambiar estado y texto
        if (progress === 1) {
          setActiveTab('nutricion');
          tabTextRef.current.textContent = '';
        } else {
          setActiveTab('workout');
          if (self.progress < 0.3) {
            tabTextRef.current.textContent = text2;
          } else if (self.progress < 0.5) {
            const remaining = Math.floor((1 - ((self.progress - 0.3) / 0.2)) * text2.length);
            tabTextRef.current.textContent = text2.slice(0, remaining);
          }
        }
      },
      onLeaveBack: () => {
        setActiveTab('workout');
        if (tab1Ref.current && tab2Ref.current && tab3Ref.current) {
          gsap.set(tab1Ref.current, { x: -SIDE_OFFSET, z: DEPTH_OFFSET, scale: 0.85, opacity: 0.6, rotateY: SIDE_ROTATION });
          gsap.set(tab2Ref.current, { x: 0, z: -50, scale: 1.15, opacity: 1, rotateY: 0 });
          gsap.set(tab3Ref.current, { x: SIDE_OFFSET, z: DEPTH_OFFSET, scale: 0.85, opacity: 0.6, rotateY: -SIDE_ROTATION });
        }
        if (tabTextRef.current) tabTextRef.current.textContent = text2;
      },
    });
    
    currentScrollPx += TAB_TRANSITION_PX;
    
    // Fase 3: Escribir texto de Nutrición
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${currentScrollPx} top`,
      end: `+=${TYPING_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!tabTextRef.current) return;
        const chars = Math.floor(self.progress * text3.length);
        tabTextRef.current.textContent = text3.slice(0, chars);
      },
      onLeaveBack: () => {
        if (tabTextRef.current) tabTextRef.current.textContent = '';
      },
    });
    
    // Guardar el inicio de Nutrición para calcular el final exacto del typing
    const nutritionTypingStartPx = currentScrollPx;
    currentScrollPx += TYPING_PX + PAUSE_PX;

    // Desaparición del módulo de Tabs tras terminar de escribir Nutrición + 4 notches
    // No rompe el recorrido: sólo se activa cuando el texto de Nutrición se ha escrito completo
    const NOTCH_PX = isMobile ? 75 : 100;
    const EXIT_AFTER_NOTCHES = 4;
    const TABS_EXIT_PX = NOTCH_PX * 8; // duración de la salida (más lenta para apreciarse mejor)
    const tabsExitStartPx = nutritionTypingStartPx + TYPING_PX + (NOTCH_PX * EXIT_AFTER_NOTCHES);

    // Preparación de piezas para la "desintegración" sin usar opacidad
    let shatterPrepared = false;
    let textPieces: HTMLElement[] = [];
    let buttonPieces: HTMLElement[] = [];
    let vectors: Array<{ el: HTMLElement; vx: number; vy: number; vr: number; scaleEnd: number }>[] = [] as any;
    
    // Utilidad: obtener texto plano actual (ignorando spans) y comprobar si está totalmente escrito
    const getPlainText = (): string => {
      if (!tabTextRef.current) return '';
      if (tabTextRef.current.childNodes.length === 0) return tabTextRef.current.textContent || '';
      let acc = '';
      tabTextRef.current.childNodes.forEach((n) => { acc += (n.textContent || ''); });
      return acc;
    };
    const isFullyTypedText = (): boolean => getPlainText().length >= text3.length;

    const prepareShatter = () => {
      if (shatterPrepared) return;
      shatterPrepared = true;
      // Restaurar a texto plano antes de fragmentar
      if (tabTextRef.current) {
        const plain = getPlainText();
        tabTextRef.current.textContent = plain || text3;
      }
      // Dividir el texto en spans (caracteres) para animar cada pieza (si no hay contenido, usar texto completo de Nutrición)
      if (tabTextRef.current) {
        const text = (tabTextRef.current.textContent || text3);
        tabTextRef.current.textContent = '';
        const frag = document.createDocumentFragment();
        text.split('').forEach((ch) => {
          const span = document.createElement('span');
          // Preservar espacios visibles con NBSP para evitar colapsos
          span.textContent = ch === ' ' ? '\u00A0' : ch;
          span.style.display = 'inline-block';
          span.style.willChange = 'transform';
          frag.appendChild(span);
          textPieces.push(span);
        });
        tabTextRef.current.appendChild(frag);
      }
      // Piezas de botones: cada botón completo como una pieza
      if (tabButtonsContainerRef.current) {
        const btns = Array.from(tabButtonsContainerRef.current.querySelectorAll('button')) as HTMLElement[];
        buttonPieces = btns;
        buttonPieces.forEach((b) => {
          b.style.willChange = 'transform';
        });
      }
    };

    // Generar vectores aleatorios consistentes por pieza (direcciones distintas)
    const getPieceVectors = () => {
      const out: Array<{ el: HTMLElement; vx: number; vy: number; vr: number; scaleEnd: number }> = [];
      const makeVec = (el: HTMLElement, baseAngleDeg?: number) => {
        const angle = baseAngleDeg != null ? (baseAngleDeg + (Math.random() * 20 - 10)) : Math.random() * 360;
        const rad = (angle * Math.PI) / 180;
        const magnitude = isMobile ? 500 + Math.random() * 400 : 700 + Math.random() * 600; // distancia final
        const vx = Math.cos(rad) * magnitude;
        const vy = Math.sin(rad) * magnitude;
        const vr = (Math.random() * 120 - 60); // rotación final
        const scaleEnd = 1 + Math.random() * 0.25; // leve escala
        out.push({ el, vx, vy, vr, scaleEnd });
      };
      // Direcciones controladas para los 3 botones: izq-arriba, arriba, der-arriba
      if (buttonPieces.length) {
        const presets = [-135, -90, -45];
        buttonPieces.forEach((b, i) => makeVec(b, presets[i % presets.length]));
      }
      textPieces.forEach((s) => makeVec(s));
      return out;
    };

    let cachedVectors: Array<{ el: HTMLElement; vx: number; vy: number; vr: number; scaleEnd: number }> | null = null;

    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${tabsExitStartPx} top`,
      end: `+=${TABS_EXIT_PX}`,
      scrub: true,
      onEnterBack: () => {
        // Al volver desde abajo, mostrar el contenedor para permitir la animación inversa
        if (tabsContainerRef.current) {
          gsap.set(tabsContainerRef.current, { visibility: 'visible' });
        }
      },
      onUpdate: (self) => {
        if (!tabsContainerRef.current || !tabTextRef.current) return;
        const fullyTyped = isFullyTypedText();
        if (!fullyTyped) return;
        if (!shatterPrepared) {
          prepareShatter();
          cachedVectors = getPieceVectors();
        }
        const p = self.progress; // 0 → 1
        // Pieza por pieza: mover a lo largo de su vector y rotar sin usar opacidad
        if (cachedVectors) {
          cachedVectors.forEach(({ el, vx, vy, vr, scaleEnd }) => {
            const x = vx * p;
            const y = vy * p;
            const rot = vr * p;
            const sc = 1 + (scaleEnd - 1) * p;
            (el as HTMLElement).style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${sc})`;
          });
        }
        // Botonera: que mantenga el centro mientras sus piezas vuelan
        if (tabButtonsContainerRef.current) {
          gsap.set(tabButtonsContainerRef.current, { transform: `translate3d(-50%, -60%, 0)` });
        }
      },
      onLeave: () => {
        if (tabsContainerRef.current) {
          gsap.set(tabsContainerRef.current, { visibility: 'hidden' });
        }
      },
      onLeaveBack: () => {
        if (tabsContainerRef.current) {
          gsap.set(tabsContainerRef.current, { visibility: 'visible' });
        }
        if (tabButtonsContainerRef.current) {
          gsap.set(tabButtonsContainerRef.current, { clearProps: 'transform' });
        }
        // No reseteamos instantáneamente para permitir animación inversa con el scrub
        // El reset total sólo si regresamos antes del inicio de la animación
      }
    });

    // ================= Párrafo posterior: entra empujando al H2 desde abajo =================
    const COMP_PARA = `Durante más de una década, Bernat vivió por y para el culturismo. Competía, entrenaba, perfeccionaba su técnica y compartía experiencias con algunos de los atletas más importantes del mundo. Pero, como todo en la vida, llegó un momento en el que sintió que necesitaba dar un paso atrás para centrarse en otro aspecto esencial: su familia.\n\nEn 2012, tras muchos años de competición al más alto nivel, decidió alejarse de los escenarios y dedicar su tiempo a construir un futuro junto a su pareja. Dos años después, en 2014, nació su primer hijo, y en 2016, llegó su hija. Fueron años en los que el culturismo pasó a un segundo plano, pues la prioridad absoluta era criar y cuidar de su familia.\n\nDurante más de una década, Bernat vivió por y para el culturismo. Competía, entrenaba, perfeccionaba su técnica y compartía experiencias con algunos de los atletas más importantes del mundo. Pero, como todo en la vida, llegó un momento en el que sintió que necesitaba dar un paso atrás para centrarse en otro aspecto esencial: su familia.\n\nEn 2012, tras muchos años de competición al más alto nivel, decidió alejarse de los escenarios y dedicar su tiempo a construir un futuro junto a su pareja. Dos años después, en 2014, nació su primer hijo, y en 2016, llegó su hija. Fueron años en los que el culturismo pasó a un segundo plano, pues la prioridad absoluta era criar y cuidar de su familia.`;

    const PARA_ENTER_PX = NOTCH_PX * 8; // duración de entrada del párrafo
    const paraStartPx = tabsExitStartPx + TABS_EXIT_PX; // tras desaparecer tabs y entrar H2

    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${paraStartPx} top`,
      end: `+=${PARA_ENTER_PX}`,
      scrub: true,
      onEnter: () => {
        if (compParaBlockRef.current) gsap.set(compParaBlockRef.current, { visibility: 'visible' });
        if (compParaTextRef.current) compParaTextRef.current.textContent = '';
        if (compParaWrapperRef.current) gsap.set(compParaWrapperRef.current, { y: '100vh' });
        if (compParaContainerRef.current) gsap.set(compParaContainerRef.current, { y: 0 });
        // Calcular lift para mantener H2 encima del párrafo centrado
        try {
          const rect = compParaContainerRef.current?.getBoundingClientRect();
          if (rect) {
            const EXTRA_GAP = isMobile ? 16 : 24; // espacio adicional para separar H2 y div
            compLiftTargetPx = Math.round(rect.height / 2 + (isMobile ? 24 : 40) + EXTRA_GAP);
          }
        } catch {}
      },
      onEnterBack: () => {
        if (compParaBlockRef.current) gsap.set(compParaBlockRef.current, { visibility: 'visible' });
        if (compParaWrapperRef.current) gsap.set(compParaWrapperRef.current, { y: '100vh' });
        if (compParaContainerRef.current) gsap.set(compParaContainerRef.current, { y: 0 });
        if (compParaTextRef.current) compParaTextRef.current.textContent = '';
        try {
          const rect = compParaContainerRef.current?.getBoundingClientRect();
          if (rect) {
            const EXTRA_GAP = isMobile ? 16 : 24; // espacio adicional para separar H2 y div
            compLiftTargetPx = Math.round(rect.height / 2 + (isMobile ? 24 : 40) + EXTRA_GAP);
          }
        } catch {}
      },
      onUpdate: (self) => {
        const p = self.progress; // 0 → 1
        // Empujar el H2 y barras hacia arriba para quedar encima del párrafo
        const lift = -compLiftTargetPx * p;
        if (compTitleTextRef.current) gsap.set(compTitleTextRef.current, { y: lift });
        if (compTopBarRef.current) gsap.set(compTopBarRef.current, { y: lift });
        if (compBottomBarRef.current) gsap.set(compBottomBarRef.current, { y: lift });
        // Párrafo sube desde abajo hasta centro (wrapper mueve glow y caja juntos)
        if (compParaWrapperRef.current) {
          const vh = window.innerHeight;
          const y = vh * (1 - p);
          gsap.set(compParaWrapperRef.current, { y });
        }
        // Sin texto: mantener vacío el contenido del párrafo
        if (compParaTextRef.current) compParaTextRef.current.textContent = '';
      },
      onLeaveBack: () => {
        if (compParaBlockRef.current) gsap.set(compParaBlockRef.current, { visibility: 'hidden' });
        if (compParaWrapperRef.current) gsap.set(compParaWrapperRef.current, { y: '100vh' });
        if (compTitleTextRef.current) gsap.set(compTitleTextRef.current, { y: 0 });
        if (compTopBarRef.current) gsap.set(compTopBarRef.current, { y: 0 });
        if (compBottomBarRef.current) gsap.set(compBottomBarRef.current, { y: 0 });
        if (compParaTextRef.current) compParaTextRef.current.textContent = '';
      }
    });

    // Escritura tipo máquina cuando el div ya está centrado
    const paraTypeStartPx = paraStartPx + PARA_ENTER_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${paraTypeStartPx} top`,
      end: `+=${TYPE_SCROLL_PX}`,
      scrub: true,
      onEnter: () => {
        if (compParaBlockRef.current) gsap.set(compParaBlockRef.current, { visibility: 'visible' });
        if (compParaTextRef.current) compParaTextRef.current.textContent = '';
      },
      onUpdate: (self) => {
        if (!compParaTextRef.current) return;
        const total = COMP_PARA.length;
        const chars = Math.floor(self.progress * total);
        compParaTextRef.current.textContent = COMP_PARA.slice(0, chars);
      },
      onLeaveBack: () => {
        if (compParaTextRef.current) compParaTextRef.current.textContent = '';
      }
    });

    // Scroll interno del texto dentro de la ventana 3:4 (cuando ya está centrado)
    // Duración dinámica de scroll interno basada en la altura real del contenido
    // Eliminado cálculo no usado de duración dinámica (controlamos por píxeles recorridos)
    const createParaScrollTrigger = () => ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${paraTypeStartPx} top`,
      // Usar un tramo extremadamente largo y mapear desplazamiento por píxeles al movimiento interno
      end: `+=100000`,
      scrub: true,
      onUpdate: (self) => {
        if (!compParaTextRef.current || !compParaContainerRef.current) return;
        const inner = compParaContainerRef.current.querySelector('.overflow-hidden') as HTMLElement | null;
        const containerHeight = inner?.offsetHeight || compParaContainerRef.current.clientHeight || 0;
        const contentHeight = compParaTextRef.current.scrollHeight || 0;
        const maxScroll = Math.max(0, contentHeight - containerHeight);
        // Desplazamiento interno proporcional a píxeles de scroll de página recorridos (aún más rápido)
        const INTERNAL_SPEED = isMobile ? 30 : 24;
        const traveled = Math.max(0, self.scroll() - (self.start as number));
        const desired = traveled * INTERNAL_SPEED;
        const translateY = -Math.min(maxScroll, desired);
        gsap.set(compParaTextRef.current, { y: translateY });
      },
      onLeaveBack: () => {
        if (compParaTextRef.current) gsap.set(compParaTextRef.current, { y: 0 });
      }
    });

    // Crear trigger y recrearlo si cambia el alto (por ejemplo, cuando termina de escribir)
    let paraScrollTrigger = createParaScrollTrigger();
    const recalcAndRefresh = () => {
      try {
        paraScrollTrigger.kill();
      } catch {}
      paraScrollTrigger = createParaScrollTrigger();
      ScrollTrigger.refresh();
    };

    // Recalcular y refrescar varias veces para capturar cambios de altura durante y después del tipeo
    const timeouts: number[] = [] as any;
    [50, 300, 800, 1600, 3000, 6000, 9000].forEach((t) => {
      const id = window.setTimeout(recalcAndRefresh, t);
      (timeouts as any).push(id);
    });

    // (El tipeo del párrafo se sincroniza en el onUpdate del trigger de entrada)

    // Reset duro si el scroll vuelve antes del inicio de la animación (evita "salto")
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${tabsExitStartPx - 1} top`,
      end: `+=1`,
      onEnterBack: () => {
        // Estamos antes del inicio: restaurar piezas a su estado base
        textPieces.forEach((s) => { s.style.transform = ''; });
        buttonPieces.forEach((b) => { b.style.transform = ''; });
        if (tabTextRef.current) {
          // Volver a texto plano para que el typing pueda actuar correctamente
          tabTextRef.current.textContent = getPlainText();
        }
        shatterPrepared = false;
        textPieces = [];
        buttonPieces = [];
        cachedVectors = null;
      }
    });

    // ================= H2 "El Sacrificio de la Competición" - ENTRADA ESPECTACULAR =================
    const COMP_TITLE = 'El Sacrificio de la Competición';
    let compPrepared = false;
    let compPieces: HTMLElement[] = [];
    let compVectors: Array<{ el: HTMLElement; vx: number; vy: number; vr: number; scaleStart: number }>|null = null;

    const prepareCompTitle = () => {
      if (compPrepared) return;
      compPrepared = true;
      if (!compTitleTextRef.current) return;
      // Fragmentar en spans preservando espacios
      const frag = document.createDocumentFragment();
      COMP_TITLE.split('').forEach((ch) => {
        const span = document.createElement('span');
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        span.style.display = 'inline-block';
        span.style.willChange = 'transform';
        frag.appendChild(span);
        compPieces.push(span);
      });
      compTitleTextRef.current.innerHTML = '';
      compTitleTextRef.current.appendChild(frag);
      // Vectores: desde fuera hacia el centro en distintas direcciones
      compVectors = compPieces.map((el) => {
        const angle = Math.random() * 360;
        const rad = (angle * Math.PI) / 180;
        const magnitude = isMobile ? 600 + Math.random() * 400 : 900 + Math.random() * 600;
        const vx = Math.cos(rad) * magnitude;
        const vy = Math.sin(rad) * magnitude;
        const vr = (Math.random() * 60 - 30);
        const scaleStart = 0.8 + Math.random() * 0.2; // 0.8–1.0
        // Situar piezas fuera inicialmente (hacia su vector)
        (el as HTMLElement).style.transform = `translate(${vx}px, ${vy}px) rotate(${vr}deg) scale(${scaleStart})`;
        return { el, vx, vy, vr, scaleStart };
      });
    };

    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${tabsExitStartPx} top`,
      end: `+=${TABS_EXIT_PX}`,
      scrub: true,
      onEnter: () => {
        if (compTitleBlockRef.current) gsap.set(compTitleBlockRef.current, { visibility: 'visible' });
        prepareCompTitle();
        // reset barras
        if (compTopBarRef.current) gsap.set(compTopBarRef.current, { scaleX: 0 });
        if (compBottomBarRef.current) gsap.set(compBottomBarRef.current, { scaleX: 0 });
      },
      onEnterBack: () => {
        if (compTitleBlockRef.current) gsap.set(compTitleBlockRef.current, { visibility: 'visible' });
        prepareCompTitle();
        if (compTopBarRef.current) gsap.set(compTopBarRef.current, { scaleX: 0 });
        if (compBottomBarRef.current) gsap.set(compBottomBarRef.current, { scaleX: 0 });
      },
      onUpdate: (self) => {
        if (!compVectors) return;
        const p = self.progress; // 0 → 1
        const inv = 1 - p;
        // Cada pieza viaja desde su vector hasta el centro (0) y endereza rotación
        compVectors.forEach(({ el, vx, vy, vr, scaleStart }) => {
          const x = vx * inv;
          const y = vy * inv;
          const rot = vr * inv;
          const sc = scaleStart + (1 - scaleStart) * p;
          (el as HTMLElement).style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${sc})`;
        });
        // Barras: la superior crece desde la izquierda, la inferior desde la derecha
        if (compTopBarRef.current) gsap.set(compTopBarRef.current, { scaleX: p, transformOrigin: 'left center' });
        if (compBottomBarRef.current) gsap.set(compBottomBarRef.current, { scaleX: p, transformOrigin: 'right center' });
      },
      onLeaveBack: () => {
        // Si subimos del todo, ocultar y resetear para futuras entradas
        if (compTitleBlockRef.current) gsap.set(compTitleBlockRef.current, { visibility: 'hidden' });
        compPieces.forEach((s) => { s.style.transform = ''; });
        compPrepared = false;
        compPieces = [];
        compVectors = null;
        if (compTopBarRef.current) gsap.set(compTopBarRef.current, { scaleX: 0 });
        if (compBottomBarRef.current) gsap.set(compBottomBarRef.current, { scaleX: 0 });
      }
    });
    
    // ============ TRANSICIÓN AL SEGUNDO VIDEO ============
    
    const VIDEO_TRANSITION_PX = isMobile ? 800 : 1000; // Duración de la transición entre videos (más lenta = más scroll)
    const VIDEO2_SCRUB_PX = isMobile ? 4000 : 5000;    // Duración del scrubbing del segundo video
    
    // Inicializar segundo video, canvas2 y overlay abajo (fuera del viewport)
    if (video2Ref.current) {
      gsap.set(video2Ref.current, { y: '100vh' }); // Empieza abajo
    }
    if (canvas2Ref.current) {
      gsap.set(canvas2Ref.current, { y: '100vh' }); // Canvas2 también empieza abajo
    }
    if (video2OverlayRef.current) {
      gsap.set(video2OverlayRef.current, { y: '100vh' }); // Empieza abajo
    }
    
    // Transición PUSH: segundo video empuja al primero hacia arriba
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${currentScrollPx} top`,
      end: `+=${VIDEO_TRANSITION_PX}`,
      scrub: true,
      onUpdate: (self) => {
        const vh = window.innerHeight;
        
        // Primer video sube (es empujado hacia arriba)
        if (videoRef.current) {
          gsap.set(videoRef.current, { y: -vh * self.progress });
        }
        
        // Canvas también sube (si está activo)
        if (canvasRef.current && useCanvas) {
          gsap.set(canvasRef.current, { y: -vh * self.progress });
        }
        
        // Segundo video sube desde abajo (empuja)
        if (video2Ref.current) {
          gsap.set(video2Ref.current, { y: vh * (1 - self.progress) });
        }
        
        // Canvas2 también sube (para segundo video con frames)
        if (canvas2Ref.current) {
          gsap.set(canvas2Ref.current, { y: vh * (1 - self.progress) });
        }
        
        // Overlay del segundo video también sube
        if (video2OverlayRef.current) {
          gsap.set(video2OverlayRef.current, { y: vh * (1 - self.progress) });
        }
      },
      onLeaveBack: () => {
        const vh = window.innerHeight;
        
        // Restaurar primer video a posición original
        if (videoRef.current) gsap.set(videoRef.current, { y: 0 });
        if (canvasRef.current && useCanvas) gsap.set(canvasRef.current, { y: 0 });
        
        // Segundo video y canvas2 vuelven abajo
        if (video2Ref.current) gsap.set(video2Ref.current, { y: vh });
        if (canvas2Ref.current) gsap.set(canvas2Ref.current, { y: vh });
        if (video2OverlayRef.current) gsap.set(video2OverlayRef.current, { y: vh });
      },
    });
    
    currentScrollPx += VIDEO_TRANSITION_PX;
    
    // ============ FUNCIONES CANVAS 2 (definidas primero) ============

    const drawToCanvas2 = (img: HTMLImageElement) => {
      const canvas = canvas2Ref.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      const cw = (canvas.width = window.innerWidth);
      const ch = (canvas.height = window.innerHeight);
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const sw = iw * scale;
      const sh = ih * scale;
      const dx = (cw - sw) / 2;
      const dy = (ch - sh) / 2;
      ctx.clearRect(0, 0, cw, ch);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, dx, dy, sw, sh);
    };

    // Submuestreo móvil: saltar frames (p. ej., x3)
    const frameStepMobile2 = 4;
    const effectiveFrameStep2 = isMobile ? frameStepMobile2 : 1;
    const effectiveFrames2Count = frames2Count ? Math.floor(((frames2Count - 1) / effectiveFrameStep2)) + 1 : undefined;

    const loadFrame2 = (index: number) => new Promise<HTMLImageElement>((resolve, reject) => {
      if (!frames2Pattern || !frames2Count) return reject('no-pattern');
      const cached = imageCache2Ref.current.get(index);
      if (cached) return resolve(cached);
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      // Índice lógico → número de frame real (saltando en móvil)
      const frameNumber = 108000 + ((index - 1) * effectiveFrameStep2);
      const paddedNumber = String(frameNumber).padStart(8, '0');
      img.src = isMobile
        ? `/images/about/biography/training-frames/mobile-webp/Timeline 1_${paddedNumber}.webp`
        : `/images/about/biography/training-frames/Timeline 1_${paddedNumber}.webp`;
      img.onload = () => { imageCache2Ref.current.set(index, img); resolve(img); };
      img.onerror = (e) => reject(e);
    });

    const preloadAround2 = (center: number) => {
      if (!frames2Count) return;
      const radius = 8;
      for (let i = Math.max(1, center - radius); i <= Math.min(frames2Count, center + radius); i++) {
        if (!imageCache2Ref.current.has(i)) {
          loadFrame2(i).catch(() => {});
        }
      }
    };

    const tryEnableCanvas2 = async () => {
      if (!frames2Pattern || !frames2Count) return false;
      try {
        const first = await loadFrame2(1);
        drawToCanvas2(first);
        preloadAround2(1);
        setUseCanvas2(true);
        return true;
      } catch {
        setUseCanvas2(false);
        return false;
      }
    };
    
    // ============ SCRUBBING DEL SEGUNDO VIDEO (CANVAS O VIDEO FALLBACK) ============
    
    const video2StartPx = currentScrollPx;

    const setupCanvas2Scrub = () => {
      if (!useCanvas2 || !frames2Count) return;
      const onUpdate = (self: ScrollTrigger) => {
        const total2 = effectiveFrames2Count ?? frames2Count;
        const idx = Math.max(1, Math.min(total2!, Math.round(self.progress * (total2! - 1)) + 1));
        if (idx === currentFrame2Ref.current) return;
        currentFrame2Ref.current = idx;
        if (drawing2Ref.current) return;
        drawing2Ref.current = true;
        loadFrame2(idx)
          .then((img) => {
            drawToCanvas2(img);
            preloadAround2(idx);
            drawing2Ref.current = false;
          })
          .catch(() => { drawing2Ref.current = false; });
      };

      ScrollTrigger.create({
        trigger: scrollEl as Element,
        start: `+=${video2StartPx} top`,
        end: `+=${VIDEO2_SCRUB_PX}`,
        scrub: 0.1,
        onUpdate,
      });
    };

    // Intentar habilitar canvas2, si falla usar video fallback
    (async () => {
      const enabled2 = await tryEnableCanvas2();
      if (enabled2) {
        setupCanvas2Scrub();
      } else {
        // FALLBACK: Video scrubbing suavizado
        const targetTimeRef2 = { t: 0 } as { t: number };
        const currentTimeRef2 = { t: 0 } as { t: number };
        
        const setupVideo2Scrub = () => {
          const video = video2Ref.current;
          if (!video || isNaN(video.duration) || !isFinite(video.duration) || video.duration === 0) return;
          
          video.pause();
          targetTimeRef2.t = 0;
          currentTimeRef2.t = 0;
          video.currentTime = 0;
          
          ScrollTrigger.create({
            trigger: scrollEl as Element,
            start: `+=${video2StartPx} top`,
            end: `+=${VIDEO2_SCRUB_PX}`,
            scrub: 0.1,
            onUpdate: (self) => {
              targetTimeRef2.t = self.progress * video.duration;
            },
          });
          
          const LERP_FACTOR = 0.15;
          const FRAME_TIME = 1 / 30;
          
          gsap.ticker.add(() => {
            if (!video2Ref.current) return;
            currentTimeRef2.t += (targetTimeRef2.t - currentTimeRef2.t) * LERP_FACTOR;
            const diff = Math.abs(currentTimeRef2.t - video.currentTime);
            if (diff > FRAME_TIME) {
              const step = Math.min(diff, FRAME_TIME);
              const direction = currentTimeRef2.t > video.currentTime ? 1 : -1;
              video.currentTime += step * direction;
            } else if (diff > 0.001) {
              video.currentTime = currentTimeRef2.t;
            }
          });
        };
        
        if (video2Ref.current) {
          const onLoadedMeta2 = () => setupVideo2Scrub();
          if (video2Ref.current.readyState >= 1) {
            setupVideo2Scrub();
          } else {
            video2Ref.current.addEventListener('loadedmetadata', onLoadedMeta2);
          }
        }
      }
    })();
    
    currentScrollPx += VIDEO2_SCRUB_PX;

    // En móvil: ocultar antes al hacer scroll hacia arriba (margen de retroceso)
    const BACK_HIDE_MARGIN = isMobile ? 0.8 : 1;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${totalScroll * (TITLE_FLIP_START + BACK_HIDE_MARGIN)} top`,
      end: `+=${totalScroll}`,
      onEnterBack: () => {
        if (nextTitleBlockRef.current) gsap.set(nextTitleBlockRef.current, { opacity: 0 });
      },
    });

    // (Typing control movido a bloques desktop/mobile)

    const drawToCanvas = (img: HTMLImageElement) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      const cw = (canvas.width = window.innerWidth);
      const ch = (canvas.height = window.innerHeight);
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const sw = iw * scale;
      const sh = ih * scale;
      const dx = (cw - sw) / 2;
      const dy = (ch - sh) / 2;
      ctx.clearRect(0, 0, cw, ch);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, dx, dy, sw, sh);
    };

    // Submuestreo móvil: saltar frames (p. ej., x3)
    const frameStepMobile = 4;
    const effectiveFrameStep = isMobileDevice ? frameStepMobile : 1;
    const effectiveFramesCount = framesCount ? Math.floor(((framesCount - 1) / effectiveFrameStep)) + 1 : undefined;

    const loadFrame = (index: number) => new Promise<HTMLImageElement>((resolve, reject) => {
      if (!framesPattern || !framesCount) return reject('no-pattern');
      const cached = imageCacheRef.current.get(index);
      if (cached) return resolve(cached);
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      // Índice lógico → número de frame real (saltando en móvil)
      const frameNumber = 86400 + ((index - 1) * effectiveFrameStep);
      const paddedNumber = String(frameNumber).padStart(8, '0');
      img.src = isMobileDevice
        ? `/images/about/biography/frames/mobile-webp/Timeline 1_${paddedNumber}.webp`
        : `/images/about/biography/frames/Timeline 1_${paddedNumber}.webp`;
      img.onload = () => { imageCacheRef.current.set(index, img); resolve(img); };
      img.onerror = (e) => reject(e);
    });

    const preloadAround = (center: number) => {
      if (!framesCount) return;
      const radius = 8;
      for (let i = Math.max(1, center - radius); i <= Math.min(framesCount, center + radius); i++) {
        if (!imageCacheRef.current.has(i)) {
          loadFrame(i).catch(() => {});
        }
      }
    };

    const tryEnableCanvas = async () => {
      if (!framesPattern || !framesCount) return false;
      try {
        const first = await loadFrame(1);
        drawToCanvas(first);
        preloadAround(1);
        setUseCanvas(true);
        return true;
      } catch {
        setUseCanvas(false);
        return false;
      }
    };

    const setupCanvasScrub = () => {
      if (!useCanvas || !framesCount) return;
      const onUpdate = (self: ScrollTrigger) => {
        const total = effectiveFramesCount ?? framesCount;
        const idx = Math.max(1, Math.min(total!, Math.round(self.progress * (total! - 1)) + 1));
        if (idx === currentFrameRef.current) return;
        currentFrameRef.current = idx;
        if (drawingRef.current) return;
        drawingRef.current = true;
        loadFrame(idx)
          .then((img) => {
            drawToCanvas(img);
            preloadAround(idx);
            drawingRef.current = false;
          })
          .catch(() => { drawingRef.current = false; });
      };

      ScrollTrigger.create({
        trigger: scrollEl as Element,
        start: 'top top',
        end: `+=${totalScroll}`,
        scrub: true,
        onUpdate,
      });
    };

    (async () => {
      const enabled = await tryEnableCanvas();
      if (enabled) {
        setupCanvasScrub();
      } else {
        const targetTimeRef = { t: 0 } as { t: number };

        const setupVideoScrub = () => {
          const video = videoRef.current;
          if (!video || isNaN(video.duration) || !isFinite(video.duration) || video.duration === 0) return;
          video.pause();
          targetTimeRef.t = 0;
          ScrollTrigger.create({
            trigger: scrollEl as Element,
            start: 'top top',
            end: `+=${totalScroll}`,
            scrub: 0.1,
            onUpdate: (self) => {
              const targetTime = self.progress * video.duration;
              gsap.to(targetTimeRef, {
                t: targetTime,
                duration: 0.08,
                ease: 'none',
                overwrite: 'auto',
                onUpdate: () => {
                  try { if (video) video.currentTime = targetTimeRef.t; } catch (_) {}
                },
              });
            },
          });
        };

        const onLoadedMeta = () => {
          // Forzar mostrar primer frame del vídeo en cuanto carga
          try {
            if (videoRef.current) {
              videoRef.current.pause();
              videoRef.current.currentTime = 0.001;
            }
          } catch (_) {}
          setupVideoScrub();
        };
        const onError = () => {};
        if (videoRef.current) {
          if (videoRef.current.readyState >= 1) setupVideoScrub();
          videoRef.current.addEventListener('loadedmetadata', onLoadedMeta);
          videoRef.current.addEventListener('error', onError);
        }
      }
    })();

    const handleResize = () => {
      if (useCanvas) {
      const img = imageCacheRef.current.get(currentFrameRef.current);
      if (img) drawToCanvas(img);
      }
      if (useCanvas2) {
        const img2 = imageCache2Ref.current.get(currentFrame2Ref.current);
        if (img2) drawToCanvas2(img2);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      window.removeEventListener('resize', handleResize);
    };
  }, [framesPattern, framesCount, frames2Pattern, frames2Count, useCanvas, useCanvas2]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-40 flex h-screen w-full items-center justify-center bg-black text-white overflow-hidden transition-[padding] duration-300 ease-out">
      {/* Fondo de respaldo oculto para evitar flash */}
      <div
        className="hidden absolute inset-0 -z-40 bg-center bg-cover"
        style={{ backgroundImage: `url(${poster})`, filter: 'brightness(0.6)' }}
      />

      {/* Canvas flipbook para primer video (desktop) */}
      {(framesPattern && framesCount) && (
        <canvas ref={canvasRef} className="absolute inset-0 -z-20 w-full h-full" style={{ display: useCanvas ? 'block' : 'none' }} />
      )}

      {/* Video de fondo (fallback para móvil o cuando no hay frames) */}
      {(videoMp4 || videoWebm) && (
        <video
          ref={videoRef}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          muted
          playsInline
          preload="auto"
          style={{ display: useCanvas ? 'none' : 'block' }}
        >
          {videoWebm && <source src={videoWebm} type="video/webm" />}
          {videoMp4 && <source src={videoMp4} type="video/mp4" />}
        </video>
      )}

      {/* Canvas flipbook para segundo video (training - desktop) */}
      {(frames2Pattern && frames2Count) && (
        <canvas ref={canvas2Ref} className="absolute inset-0 -z-19 w-full h-full" style={{ display: useCanvas2 ? 'block' : 'none' }} />
      )}

      {/* Segundo video de fondo (training) - fallback para móvil */}
      <video
        ref={video2Ref}
        className="absolute inset-0 -z-19 h-full w-full object-cover"
        muted
        playsInline
        preload="auto"
        style={{ display: useCanvas2 ? 'none' : 'block' }}
      >
        <source src="/videos/biography/bernat-training.webm" type="video/webm" />
        <source src="/videos/biography/bernat-training.mp4" type="video/mp4" />
      </video>

      {/* Overlay oscuro sutil para el segundo video */}
      <div ref={video2OverlayRef} className="absolute inset-0 -z-18 bg-black/40" />

      {/* Overlay para contraste (primer video) */}
      <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.65))' }} />

      {/* Cita centrada (primera) */}
      <div ref={quoteRef} className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none will-change-transform">
        <div className="pointer-events-none relative mx-4 md:mx-0 w-full max-w-3xl">
          <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[6px] bg-[linear-gradient(135deg,rgba(229,9,20,0.6),rgba(255,255,255,0.08),rgba(229,9,20,0.6))]" />
          <div className="relative rounded-3xl border border-white/10 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.6)] px-6 py-8 md:px-12 md:py-12 text-center">
            <div className="absolute top-0 left-0 h-1.5 w-28 md:w-40 bg-red-600 rounded-tr-3xl rounded-tl-3xl" />
            <div className="pointer-events-none absolute -top-6 -left-4 text-8xl md:text-9xl font-black text-white/5 select-none" aria-hidden="true">"</div>
            <p className="text-xl md:text-3xl leading-relaxed text-gray-100 font-semibold">
              «El éxito no es un accidente. Es trabajo duro, perseverancia, aprendizaje, sacrificio y, sobre todo, amor por lo que haces.»
            </p>
            <span className="mt-4 block text-sm md:text-base tracking-widest uppercase text-gray-400">— Arnold Schwarzenegger</span>
          </div>
        </div>
      </div>

      {/* Párrafo post-Tabs en ventana 3:4 */}
      <div ref={compParaBlockRef} className="fixed inset-0 z-[62] flex items-center justify-center pointer-events-none" style={{ visibility: 'hidden' }}>
        <div ref={compParaWrapperRef} className="relative w-full max-w-sm md:max-w-md aspect-[3/4] will-change-transform">
          <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[6px] bg-[linear-gradient(135deg,rgba(229,9,20,0.6),rgba(255,255,255,0.08),rgba(229,9,20,0.6))]" />
          <div ref={compParaContainerRef} className="relative rounded-3xl border border-white/10 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.6)] h-full overflow-hidden">
            <div className="absolute top-0 left-0 h-1.5 w-28 md:w-40 bg-red-600 rounded-tr-3xl rounded-tl-3xl z-10" />
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/70 via-black/50 to-transparent z-10 pointer-events-none rounded-t-3xl" />
            <div className="px-6 py-8 md:px-8 md:py-10 h-full overflow-hidden">
              <div ref={compParaTextRef} className="text-sm md:text-base leading-relaxed text-gray-100 whitespace-pre-wrap will-change-transform"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Segunda cita centrada (Ronnie Coleman) - baja desde arriba con efecto de escritura */}
      <div ref={quote2Ref} className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none will-change-transform">
        <div className="pointer-events-none relative mx-4 md:mx-0 w-full max-w-3xl will-change-transform">
          <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[6px] bg-[linear-gradient(135deg,rgba(229,9,20,0.6),rgba(255,255,255,0.08),rgba(229,9,20,0.6))]" />
          <div className="relative rounded-3xl border border-white/10 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.6)] px-6 py-8 md:px-12 md:py-12 text-center">
            <div className="absolute top-0 left-0 h-1.5 w-28 md:w-40 bg-red-600 rounded-tr-3xl rounded-tl-3xl" />
            <div className="pointer-events-none absolute -top-6 -left-4 text-8xl md:text-9xl font-black text-white/5 select-none" aria-hidden="true">"</div>
            <p ref={quote2TextRef} className="text-xl md:text-3xl leading-relaxed text-gray-100 font-semibold will-change-transform">
              «<span className="typing-text"></span>»
            </p>
            <span className="mt-4 block text-sm md:text-base tracking-widest uppercase text-gray-400">— Ronnie Coleman</span>
          </div>
        </div>
      </div>

      {/* Contenido inicial (Bernat Scorus) */}
      <div className="container relative z-10 max-w-3xl px-4 text-center select-none">
        <h2 className="mb-4 text-5xl md:text-7xl font-black uppercase tracking-tight leading-none">
          <span ref={titleLeftRef} className="inline-block will-change-transform">Bernat </span>
          <span ref={titleRightRef} className="inline-block text-red-600 will-change-transform">Scorus</span>
        </h2>
        <h3 ref={subtitleRef} className="mb-6 text-sm md:text-base font-semibold uppercase tracking-widest text-red-500 will-change-transform">
          De la Superación Personal a la Excelencia en el Fitness
        </h3>
        <p ref={bodyRef} className="mx-auto max-w-2xl text-sm md:text-lg leading-relaxed text-gray-200 will-change-transform">
          Mi nombre es Bernat Richard Scorus y llevo más de 25 años ayudando a personas a transformar sus cuerpos y mejorar su rendimiento físico. Desde muy joven supe que el culturismo y el fitness eran mi verdadera pasión, y a lo largo de mi carrera he logrado convertirme en Campeón del Mundo de Culturismo, Subcampeón de Mister Universo y Subcampeón de Mr. Olympia Masters Amateur.
        </p>
      </div>

      {/* Nuevo bloque: solo H2 (sobre el vídeo) */}
      <div ref={nextTitleBlockRef} className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
        <div ref={nextTitleInnerRef} className="container max-w-5xl px-4 md:px-8 will-change-transform">
          <h2 ref={nextTitleRef} className="text-center text-3xl md:text-5xl font-black uppercase tracking-tight text-white will-change-transform">
            <span className="flip-up inline-block">El</span>
            <span className="flip-down inline-block ml-2">Sacrificio</span>
            <span className="flip-up inline-block ml-3">Infancia</span>
            <span className="flip-down inline-block ml-3">y</span>
            <span className="flip-up inline-block ml-3 text-transparent bg-clip-text [background-image:linear-gradient(90deg,rgba(229,9,20,1),rgba(229,9,20,1))]">Primeros</span>
            <span className="flip-down inline-block ml-2 text-transparent bg-clip-text [background-image:linear-gradient(90deg,rgba(229,9,20,1),rgba(229,9,20,1))]">Pasos</span>
            <span className="flip-up inline-block ml-2 text-transparent bg-clip-text [background-image:linear-gradient(90deg,rgba(229,9,20,1),rgba(229,9,20,1))]">en</span>
            <span className="flip-down inline-block ml-2 text-transparent bg-clip-text [background-image:linear-gradient(90deg,rgba(229,9,20,1),rgba(229,9,20,1))]">el</span>
            <span className="flip-up inline-block ml-2 text-transparent bg-clip-text [background-image:linear-gradient(90deg,rgba(229,9,20,1),rgba(229,9,20,1))]">Deporte</span>
          </h2>
          <div className="mt-4 max-w-3xl mx-auto text-base md:text-lg leading-relaxed text-gray-100 text-left">
            <span ref={nextBodyRef}></span>
          </div>
        </div>
      </div>

      {/* H2 Post-Tabs: El Sacrificio de la Competición (estética espectacular) */}
      <div ref={compTitleBlockRef} className="fixed inset-0 z-[61] flex items-center justify-center pointer-events-none" style={{ visibility: 'hidden' }}>
        <div className="container max-w-5xl px-4 md:px-8">
          <div className="relative mx-auto max-w-fit">
            {/* Glow de fondo radial rojo */}
            <div className="pointer-events-none absolute -inset-16 -z-10 blur-3xl bg-[radial-gradient(ellipse_at_center,rgba(229,9,20,0.25),transparent_60%)]" />
            {/* Barra superior acento rojo (crece desde la izquierda) */}
            <div ref={compTopBarRef} className="pointer-events-none absolute -top-4 left-0 right-0 mx-auto h-1 w-full max-w-5xl origin-left scale-x-0 rounded-full bg-gradient-to-r from-red-600 to-red-400" />
            {/* Título con gradiente y glow sutil */}
            <h2
              ref={compTitleTextRef}
              className="text-center text-lg sm:text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight whitespace-nowrap will-change-transform text-white drop-shadow-[0_0_30px_rgba(229,9,20,0.35)]"
            />
            {/* Subrayado dinámico */}
            {/* Barra inferior acento rojo (crece desde la derecha) */}
            <div ref={compBottomBarRef} className="pointer-events-none mx-auto mt-3 h-1 w-full max-w-4xl origin-right scale-x-0 rounded-full bg-gradient-to-r from-red-600 via-red-500 to-red-400" />
          </div>
        </div>
      </div>

      {/* Imagen bernat-young.webp entrando desde la derecha */}
      <div ref={nextImageRef} className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none will-change-transform px-6 md:px-0">
        <div className="relative w-full max-w-md md:max-w-lg">
          <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[6px] bg-[linear-gradient(135deg,rgba(229,9,20,0.6),rgba(255,255,255,0.08),rgba(229,9,20,0.6))]" />
          <div className="relative rounded-3xl border border-white/10 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="absolute top-0 left-0 h-1.5 w-28 md:w-40 bg-red-600 rounded-tr-3xl rounded-tl-3xl" />
            <img src="/images/about/biography/bernat-young.webp" alt="Bernat joven" className="w-full h-auto object-cover" />
          </div>
        </div>
      </div>

      {/* Nuevo contenedor de párrafos con scroll interno (ventana Netflix con proporción 3:4) */}
      <div ref={nextParagraphsContainerRef} className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none will-change-transform px-6 md:px-0">
        <div className="relative w-full max-w-sm md:max-w-md aspect-[3/4]">
          <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[6px] bg-[linear-gradient(135deg,rgba(229,9,20,0.6),rgba(255,255,255,0.08),rgba(229,9,20,0.6))]" />
          <div className="relative rounded-3xl border border-white/10 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.6)] h-full overflow-hidden">
            <div className="absolute top-0 left-0 h-1.5 w-28 md:w-40 bg-red-600 rounded-tr-3xl rounded-tl-3xl z-10" />
            {/* Gradiente de fade superior para smooth disappear */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/70 via-black/50 to-transparent z-10 pointer-events-none rounded-t-3xl" />
            <div className="px-6 py-8 md:px-8 md:py-10 h-full overflow-hidden">
              <div ref={nextParagraphsRef} className="text-sm md:text-base leading-relaxed text-gray-100 whitespace-pre-wrap will-change-transform"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Netflix (carrusel 3D circular) */}
      <div ref={tabsContainerRef} className="fixed inset-0 z-[60] pointer-events-none will-change-transform px-4 md:px-8" style={{ perspective: '1000px' }}>
        {/* Contenedor con perspectiva 3D */}
        <div ref={tabButtonsContainerRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] md:-translate-y-1/2 flex flex-row items-center justify-center gap-1 md:gap-1.5" style={{ transformStyle: 'preserve-3d' }}>
          {/* Botón Progresión */}
          <button
            ref={tab1Ref}
            className={`relative px-4 py-6 md:px-10 md:py-12 rounded-3xl transition-colors duration-300 overflow-hidden will-change-transform ${
              activeTab === 'progresion'
                ? 'bg-gradient-to-br from-red-600 via-red-500 to-red-700 shadow-[0_0_60px_rgba(229,9,20,0.8),inset_0_0_20px_rgba(255,255,255,0.1)]'
                : 'bg-gradient-to-br from-black/90 via-black/80 to-black/90 backdrop-blur-xl border-2 border-white/30'
            }`}
          >
            {/* Efecto de pulso en activo */}
            {activeTab === 'progresion' && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            )}
            
              <div className="relative flex flex-col items-center gap-1 md:gap-4">
                <svg className={`w-6 h-6 md:w-14 md:h-14 transition-all duration-500 ${activeTab === 'progresion' ? 'text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-gray-300'}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className={`text-[10px] md:text-xl font-black uppercase tracking-wider ${activeTab === 'progresion' ? 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]' : 'text-gray-300'}`}>
                  Progresión
                </span>
              </div>
          </button>

          {/* Botón Workout */}
          <button
            ref={tab2Ref}
            className={`relative px-4 py-6 md:px-10 md:py-12 rounded-3xl transition-colors duration-300 overflow-hidden will-change-transform ${
              activeTab === 'workout'
                ? 'bg-gradient-to-br from-red-600 via-red-500 to-red-700 shadow-[0_0_60px_rgba(229,9,20,0.8),inset_0_0_20px_rgba(255,255,255,0.1)]'
                : 'bg-gradient-to-br from-black/90 via-black/80 to-black/90 backdrop-blur-xl border-2 border-white/30'
            }`}
          >
            {activeTab === 'workout' && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            )}
            
              <div className="relative flex flex-col items-center gap-1 md:gap-4">
                <svg className={`w-6 h-6 md:w-14 md:h-14 transition-all duration-500 ${activeTab === 'workout' ? 'text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-gray-300'}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                <span className={`text-[10px] md:text-xl font-black uppercase tracking-wider ${activeTab === 'workout' ? 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]' : 'text-gray-300'}`}>
                  Workout
                </span>
              </div>
          </button>

          {/* Botón Nutrición */}
          <button
            ref={tab3Ref}
            className={`relative px-4 py-6 md:px-10 md:py-12 rounded-3xl transition-colors duration-300 overflow-hidden will-change-transform ${
              activeTab === 'nutricion'
                ? 'bg-gradient-to-br from-red-600 via-red-500 to-red-700 shadow-[0_0_60px_rgba(229,9,20,0.8),inset_0_0_20px_rgba(255,255,255,0.1)]'
                : 'bg-gradient-to-br from-black/90 via-black/80 to-black/90 backdrop-blur-xl border-2 border-white/30'
            }`}
          >
            {activeTab === 'nutricion' && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            )}
            
              <div className="relative flex flex-col items-center gap-1 md:gap-4">
                <svg className={`w-6 h-6 md:w-14 md:h-14 transition-all duration-500 ${activeTab === 'nutricion' ? 'text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-gray-300'}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className={`text-[10px] md:text-xl font-black uppercase tracking-wider ${activeTab === 'nutricion' ? 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]' : 'text-gray-300'}`}>
                  Nutrición
                </span>
              </div>
          </button>
        </div>

        {/* Texto SEPARADO - POSICIÓN FIJA ABSOLUTA DEBAJO DE LOS BOTONES */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-12 md:translate-y-40 w-full max-w-3xl px-4">
          <p ref={tabTextRef} className="text-center text-sm md:text-xl leading-relaxed text-white font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"></p>
        </div>
      </div>
    </div>
  );
}
