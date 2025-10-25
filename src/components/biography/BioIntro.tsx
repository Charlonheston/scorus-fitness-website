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
  // Opcional: permitir proporcionar frames del tercer video (challenge)
  frames3Pattern?: string;
  frames3Count?: number;
  frames3Start?: number;  // Número base del primer frame (p.ej. 86400)
  // Opcional: permitir proporcionar frames del cuarto video (final)
  frames4Pattern?: string;
  frames4Count?: number;
  frames4Start?: number;  // Número base del primer frame (p.ej. 86400)
}

export default function BioIntro({ videoMp4, videoWebm, poster = '/images/hero/bernat-hero.webp', framesPattern, framesCount, frames2Pattern, frames2Count, frames3Pattern, frames3Count, frames3Start, frames4Pattern, frames4Count, frames4Start }: Props) {
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

  // Canvas flipbook (tercer video - challenge)
  const canvas3Ref = useRef<HTMLCanvasElement>(null);
  const [useCanvas3, setUseCanvas3] = useState(false);
  const imageCache3Ref = useRef<Map<number, HTMLImageElement>>(new Map());
  const currentFrame3Ref = useRef<number>(0);
  const drawing3Ref = useRef<boolean>(false);
  const video3OverlayRef = useRef<HTMLDivElement>(null); // Overlay del tercer video

  // Canvas flipbook (cuarto video - final)
  const canvas4Ref = useRef<HTMLCanvasElement>(null);
  const [useCanvas4, setUseCanvas4] = useState(false);
  const imageCache4Ref = useRef<Map<number, HTMLImageElement>>(new Map());
  const currentFrame4Ref = useRef<number>(0);
  const drawing4Ref = useRef<boolean>(false);
  const video4OverlayRef = useRef<HTMLDivElement>(null); // Overlay del cuarto video

  // Citas
  const quoteRef = useRef<HTMLDivElement>(null);
  const quote2Ref = useRef<HTMLDivElement>(null);
  const quote2TextRef = useRef<HTMLParagraphElement>(null);
  const quote2FullText = 'El cuerpo logra lo que la mente cree.';
  const quote3Ref = useRef<HTMLDivElement>(null);
  const quote3TextRef = useRef<HTMLParagraphElement>(null);
  const quote3FullText = 'Ser padre me enseñó que el mayor desafío no siempre está en el gimnasio, sino en ser el mejor ejemplo para mis hijos.';
  
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
  
  // Nuevo párrafo post-cita 3
  const fatherParaRef = useRef<HTMLDivElement>(null);
  const fatherParaTextRef = useRef<HTMLParagraphElement>(null);
  const fatherParaFullText = `Durante este periodo, Bernat apenas tuvo tiempo para entrenar como lo hacía antes. La rutina de ser padre a tiempo completo lo absorbió completamente, y aunque nunca dejó el fitness por completo, su físico y mentalidad cambiaron. Pero en el fondo, su espíritu competitivo seguía vivo.`;

  // Frase del hijo (zoom out desde el centro)
  const sonChallengeRef = useRef<HTMLDivElement>(null);
  const sonChallengeTextRef = useRef<HTMLHeadingElement>(null);
  const sonChallengeText = '¿Por qué no compites otra vez, papá? ¡Compite!';

  // Párrafo tras la frase del hijo (aparece desde abajo)
  const sonParaRef = useRef<HTMLDivElement>(null);
  const sonParaTextRef = useRef<HTMLParagraphElement>(null);
  const sonParaFullText = 'Estas palabras resonaron en su mente como un desafío personal. Era el empujón que necesitaba para volver a los escenarios y demostrar que aún tenía mucho que ofrecer.';

  // Imagen de competición (entra desde abajo empujando)
  const compImageRef = useRef<HTMLDivElement>(null);

  // H2 Scorus GYM - aparece desde todos los lados
  const gymTitleRef = useRef<HTMLDivElement>(null);
  const gymTitleTextRef = useRef<HTMLHeadingElement>(null);
  const gymSubtitleRef = useRef<HTMLDivElement>(null); // "Scorus GYM"
  const gymBarRef = useRef<HTMLDivElement>(null); // Barra roja decorativa
  const gymTitleText = 'Títulos y Logros Internacionales';
  const gymLinesRef = useRef<HTMLDivElement>(null); // Líneas diagonales de fondo
  const gymIntroParaRef = useRef<HTMLDivElement>(null); // Párrafo introductorio que aparece con zoom out
  const nabbaChampRef = useRef<HTMLDivElement>(null); // Título NABBA 2006 que aparece con zoom in
  const mrUniversoRef = useRef<HTMLDivElement>(null); // Título Mr. Universo 2009 que aparece con zoom in
  const arnoldClassicRef = useRef<HTMLDivElement>(null); // Título Arnold Classic que aparece con zoom in
  const benWeiderRef = useRef<HTMLDivElement>(null); // Título Ben Weider Classic que aparece con zoom in
  const familyParaRef = useRef<HTMLDivElement>(null); // Párrafo sobre familia y regreso 2018
  const triumphTitleRef = useRef<HTMLDivElement>(null); // H2 "El Regreso Triunfal"
  const triumphTitleTextRef = useRef<HTMLHeadingElement>(null); // Texto del H2 que se fragmenta
  const motivationPhraseRef = useRef<HTMLDivElement>(null); // Frase de motivación renovada
  const goldMedalRef = useRef<HTMLDivElement>(null); // Medalla de Oro primera temporada
  const silverBronzeMedalsRef = useRef<HTMLDivElement>(null); // Medallas de Plata y Bronce
  const bestBodybuilderRef = useRef<HTMLDivElement>(null); // Tercer Mejor Culturista del Año

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
    // Canvas3 (video challenge): mantener fuera de pantalla y oculto inicialmente
    if (canvas3Ref.current) gsap.set(canvas3Ref.current, { x: '100vw', visibility: 'hidden' });
    if (video3OverlayRef.current) gsap.set(video3OverlayRef.current, { x: '100vw', visibility: 'hidden' });
    // Canvas4 (video final): mantener fuera de pantalla a la IZQUIERDA y oculto inicialmente
    if (canvas4Ref.current) gsap.set(canvas4Ref.current, { x: '-100vw', visibility: 'hidden' });
    if (video4OverlayRef.current) gsap.set(video4OverlayRef.current, { x: '-100vw', visibility: 'hidden' });
    
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
      // Tramo infinito para siempre tener control
      end: `+=999999`,
      scrub: true,
      onUpdate: (self) => {
        if (!compParaTextRef.current || !compParaContainerRef.current) return;
        
        // Recalcular dinámicamente altura en cada frame para capturar cambios durante tipeo
        const container = compParaContainerRef.current.querySelector('.overflow-hidden') as HTMLElement | null;
        const containerHeight = container?.clientHeight || compParaContainerRef.current.clientHeight || window.innerHeight * 0.75;
        const contentHeight = compParaTextRef.current.scrollHeight || compParaTextRef.current.offsetHeight || 0;
        const maxScroll = Math.max(0, contentHeight - containerHeight + 40); // +40 padding extra para asegurar
        
        // Desplazamiento proporcional a scroll recorrido, sin límite artificial de velocidad
        const traveled = Math.max(0, (self.scroll() as number) - (self.start as number));
        const SPEED = isMobile ? 0.8 : 0.6; // factor más conservador: 1px scroll → 0.6-0.8px desplazamiento interno
        const desired = traveled * SPEED;
        
        // Aplicar desplazamiento sin limitar estrictamente (dejamos margen extra)
        const translateY = -Math.min(maxScroll * 1.2, desired); // 20% extra por si acaso
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

    // ================= EXPLOSIÓN DEL H2 Y DIV DEL PÁRRAFO =================
    const COMP_EXIT_PX = NOTCH_PX * 8; // duración de la explosión
    const compExitStartPx = paraTypeStartPx + TYPE_SCROLL_PX + (NOTCH_PX * 4); // tras terminar tipeo + hold

    let compExitPrepared = false;
    let compExitH2Pieces: HTMLElement[] = [];
    let compExitParaPieces: HTMLElement[] = [];
    let compExitBarsPieces: HTMLElement[] = [];
    let compExitVectors: Array<{ el: HTMLElement; vx: number; vy: number; vr: number; scaleEnd: number }> | null = null;

    const prepareCompExplosion = () => {
      if (compExitPrepared) return;
      compExitPrepared = true;
      
      // Fragmentar H2 en caracteres (reusar o crear nuevo)
      if (compTitleTextRef.current) {
        const h2Text = compTitleTextRef.current.textContent || COMP_TITLE;
        compTitleTextRef.current.textContent = '';
        const frag = document.createDocumentFragment();
        h2Text.split('').forEach((ch) => {
          const span = document.createElement('span');
          span.textContent = ch === ' ' ? '\u00A0' : ch;
          span.style.display = 'inline-block';
          span.style.willChange = 'transform';
          frag.appendChild(span);
          compExitH2Pieces.push(span);
        });
        compTitleTextRef.current.appendChild(frag);
      }

      // Fragmentar párrafo en palabras (para no ser tan pesado)
      if (compParaTextRef.current) {
        const paraText = compParaTextRef.current.textContent || '';
        compParaTextRef.current.textContent = '';
        const frag = document.createDocumentFragment();
        const words = paraText.split(/(\s+)/); // mantener espacios
        words.forEach((word) => {
          const span = document.createElement('span');
          span.textContent = word;
          span.style.display = 'inline';
          span.style.willChange = 'transform';
          frag.appendChild(span);
          if (word.trim()) compExitParaPieces.push(span);
        });
        compParaTextRef.current.appendChild(frag);
      }

      // Barras como piezas
      if (compTopBarRef.current) {
        compTopBarRef.current.style.willChange = 'transform';
        compExitBarsPieces.push(compTopBarRef.current);
      }
      if (compBottomBarRef.current) {
        compBottomBarRef.current.style.willChange = 'transform';
        compExitBarsPieces.push(compBottomBarRef.current);
      }
      
      // Div del párrafo también como pieza (wrapper completo)
      if (compParaWrapperRef.current) {
        compParaWrapperRef.current.style.willChange = 'transform';
        compExitBarsPieces.push(compParaWrapperRef.current);
      }
    };

    const getCompExitVectors = () => {
      const out: Array<{ el: HTMLElement; vx: number; vy: number; vr: number; scaleEnd: number }> = [];
      const makeVec = (el: HTMLElement) => {
        const angle = Math.random() * 360;
        const rad = (angle * Math.PI) / 180;
        const magnitude = isMobile ? 700 + Math.random() * 500 : 1000 + Math.random() * 800;
        const vx = Math.cos(rad) * magnitude;
        const vy = Math.sin(rad) * magnitude;
        const vr = (Math.random() * 180 - 90);
        const scaleEnd = 0.5 + Math.random() * 0.5;
        out.push({ el, vx, vy, vr, scaleEnd });
      };
      
      compExitH2Pieces.forEach(makeVec);
      compExitParaPieces.forEach(makeVec);
      compExitBarsPieces.forEach(makeVec);
      
      return out;
    };

    // Estado inicial de la tercera cita
    if (quote3Ref.current) gsap.set(quote3Ref.current, { scale: 0.1, opacity: 0 });
    if (quote3TextRef.current) quote3TextRef.current.textContent = '';

    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${compExitStartPx} top`,
      end: `+=${COMP_EXIT_PX}`,
      scrub: true,
      onEnter: () => {
        prepareCompExplosion();
        compExitVectors = getCompExitVectors();
        // Mostrar cita 3 y preparar texto
        if (quote3Ref.current) gsap.set(quote3Ref.current, { visibility: 'visible', scale: 0.1, opacity: 0 });
        if (quote3TextRef.current) quote3TextRef.current.textContent = quote3FullText;
      },
      onEnterBack: () => {
        if (compTitleBlockRef.current) gsap.set(compTitleBlockRef.current, { visibility: 'visible' });
        if (compParaBlockRef.current) gsap.set(compParaBlockRef.current, { visibility: 'visible' });
        if (quote3Ref.current) gsap.set(quote3Ref.current, { visibility: 'visible', scale: 0.1, opacity: 0 });
        if (quote3TextRef.current) quote3TextRef.current.textContent = quote3FullText;
      },
      onUpdate: (self) => {
        const p = self.progress; // 0 → 1
        
        // Explosión de H2 y párrafo
        if (compExitVectors) {
          compExitVectors.forEach(({ el, vx, vy, vr, scaleEnd }) => {
            const x = vx * p;
            const y = vy * p;
            const rot = vr * p;
            const sc = 1 + (scaleEnd - 1) * p;
            (el as HTMLElement).style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${sc})`;
          });
        }

        // Zoom in de la cita 3 desde el centro (al mismo tiempo que explota)
        if (quote3Ref.current) {
          const scale = 0.1 + (0.9 * p); // de 0.1 a 1
          const opacity = p;
          gsap.set(quote3Ref.current, { scale, opacity });
        }
      },
      onLeave: () => {
        if (compTitleBlockRef.current) gsap.set(compTitleBlockRef.current, { visibility: 'hidden' });
        if (compParaBlockRef.current) gsap.set(compParaBlockRef.current, { visibility: 'hidden' });
      },
      onLeaveBack: () => {
        // Reset para animación reversa
        compExitH2Pieces.forEach((s) => { s.style.transform = ''; });
        compExitParaPieces.forEach((s) => { s.style.transform = ''; });
        compExitBarsPieces.forEach((s) => { s.style.transform = ''; });
        compExitPrepared = false;
        compExitH2Pieces = [];
        compExitParaPieces = [];
        compExitBarsPieces = [];
        compExitVectors = null;
        if (quote3Ref.current) gsap.set(quote3Ref.current, { scale: 0.1, opacity: 0 });
        if (quote3TextRef.current) quote3TextRef.current.textContent = '';
      }
    });

    // Desplazar cita 3 hacia la derecha tras un hold
    const QUOTE3_SLIDE_PX = NOTCH_PX * 5;
    const quote3SlideStartPx = compExitStartPx + COMP_EXIT_PX + (NOTCH_PX * 3); // hold de 3 notches
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${quote3SlideStartPx} top`,
      end: `+=${QUOTE3_SLIDE_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!quote3Ref.current) return;
        const p = self.progress; // 0 → 1
        const x = window.innerWidth * p; // desplazar desde 0 hasta +100vw (derecha)
        gsap.set(quote3Ref.current, { x });
      },
      onLeaveBack: () => {
        if (quote3Ref.current) gsap.set(quote3Ref.current, { x: 0 });
      }
    });

    // Párrafo "Durante este periodo" - escritura desde el centro
    const FATHER_PARA_TYPE_PX = TYPE_SCROLL_PX; // mismo ritmo de tipeo
    const fatherParaStartPx = quote3SlideStartPx; // empieza cuando la cita comienza a salir
    
    // Estado inicial
    if (fatherParaRef.current) gsap.set(fatherParaRef.current, { visibility: 'hidden', opacity: 0, scale: 0.9 });
    if (fatherParaTextRef.current) fatherParaTextRef.current.textContent = '';

    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${fatherParaStartPx} top`,
      end: `+=${FATHER_PARA_TYPE_PX}`,
      scrub: true,
      onEnter: () => {
        if (fatherParaRef.current) gsap.set(fatherParaRef.current, { visibility: 'visible', opacity: 1, scale: 1 });
        if (fatherParaTextRef.current) fatherParaTextRef.current.textContent = '';
      },
      onEnterBack: () => {
        if (fatherParaRef.current) gsap.set(fatherParaRef.current, { visibility: 'visible', opacity: 1, scale: 1 });
        if (fatherParaTextRef.current) fatherParaTextRef.current.textContent = '';
      },
      onUpdate: (self) => {
        if (!fatherParaTextRef.current) return;
        const total = fatherParaFullText.length;
        const chars = Math.floor(self.progress * total);
        fatherParaTextRef.current.textContent = fatherParaFullText.slice(0, chars);
      },
      onLeaveBack: () => {
        if (fatherParaRef.current) gsap.set(fatherParaRef.current, { visibility: 'hidden', opacity: 0, scale: 0.9 });
        if (fatherParaTextRef.current) fatherParaTextRef.current.textContent = '';
      }
    });

    // Desplazar párrafo "Durante este periodo" hacia la izquierda tras terminar de escribir
    const FATHER_PARA_SLIDE_PX = NOTCH_PX * 5;
    const fatherParaSlideStartPx = fatherParaStartPx + FATHER_PARA_TYPE_PX + (NOTCH_PX * 2); // hold de 2 notches
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${fatherParaSlideStartPx} top`,
      end: `+=${FATHER_PARA_SLIDE_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!fatherParaRef.current) return;
        const p = self.progress; // 0 → 1
        const x = -window.innerWidth * p; // desplazar desde 0 hasta -100vw (izquierda)
        gsap.set(fatherParaRef.current, { x });
      },
      onLeave: () => {
        if (fatherParaRef.current) gsap.set(fatherParaRef.current, { visibility: 'hidden' });
      },
      onLeaveBack: () => {
        if (fatherParaRef.current) {
          gsap.set(fatherParaRef.current, { x: 0, visibility: 'visible' });
        }
      }
    });

    // ================= FRASE DEL HIJO - APARICIÓN CON ZOOM OUT DESDE EL CENTRO =================
    const SON_CHALLENGE_IN_PX = NOTCH_PX * 6;
    const sonChallengeStartPx = fatherParaSlideStartPx; // empieza cuando el párrafo comienza a salir

    // Estado inicial de la frase
    const setSonChallengeHTML = () => {
      if (!sonChallengeTextRef.current) return;
      const outlinedHTML = sonChallengeText.replace(/compites|papá|Compite/gi, (m) => (
        `<span style="color:transparent;-webkit-text-stroke:2px rgb(220,38,38);text-shadow:0 0 20px rgba(220,38,38,0.5)">${m}</span>`
      ));
      sonChallengeTextRef.current.innerHTML = outlinedHTML;
    };
    if (sonChallengeRef.current) gsap.set(sonChallengeRef.current, { visibility: 'hidden', scale: 0.1, opacity: 0 });
    setSonChallengeHTML();

    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${sonChallengeStartPx} top`,
      end: `+=${SON_CHALLENGE_IN_PX}`,
      scrub: true,
      onEnter: () => {
        if (sonChallengeRef.current) gsap.set(sonChallengeRef.current, { visibility: 'visible' });
        setSonChallengeHTML();
      },
      onEnterBack: () => {
        if (sonChallengeRef.current) gsap.set(sonChallengeRef.current, { visibility: 'visible' });
        setSonChallengeHTML();
      },
      onUpdate: (self) => {
        if (!sonChallengeRef.current) return;
        const p = self.progress; // 0 → 1
        const scale = 0.1 + 0.9 * p; // 0.1 → 1
        const opacity = p;          // 0 → 1
        gsap.set(sonChallengeRef.current, { scale, opacity, x: 0, y: 0, transformOrigin: 'center center' });
      },
      onLeaveBack: () => {
        if (sonChallengeRef.current) gsap.set(sonChallengeRef.current, { visibility: 'hidden', scale: 0.1, opacity: 0 });
      }
    });

    // Hold y salida hacia arriba de la frase del hijo
    const SON_CHALLENGE_HOLD_PX = NOTCH_PX * 3;
    const SON_CHALLENGE_SLIDE_PX = NOTCH_PX * 5;
    const sonChallengeSlideStartPx = sonChallengeStartPx + SON_CHALLENGE_IN_PX + SON_CHALLENGE_HOLD_PX;

    // Hold (mantener centrado)
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${sonChallengeStartPx + SON_CHALLENGE_IN_PX} top`,
      end: `+=${SON_CHALLENGE_HOLD_PX}`,
      scrub: true,
      onUpdate: () => {
        if (sonChallengeRef.current) gsap.set(sonChallengeRef.current, { x: 0, y: 0 });
      },
      onLeaveBack: () => {
        if (sonChallengeRef.current) gsap.set(sonChallengeRef.current, { x: 0, y: 0 });
      }
    });

    // Salida hacia arriba del viewport
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${sonChallengeSlideStartPx} top`,
      end: `+=${SON_CHALLENGE_SLIDE_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!sonChallengeRef.current) return;
        const p = self.progress; // 0 → 1
        const y = -window.innerHeight * p; // 0 → -100vh
        gsap.set(sonChallengeRef.current, { y });
      },
      onLeaveBack: () => {
        if (sonChallengeRef.current) gsap.set(sonChallengeRef.current, { y: 0 });
      }
    });

    // ================= PÁRRAFO TRAS LA FRASE - ENTRA DESDE ABAJO =================
    const SON_PARA_ENTER_PX = NOTCH_PX * 4; // entrada desde la derecha
    const SON_PARA_HOLD_PX = NOTCH_PX * 5; // tiempo de lectura ~5 notches
    const SON_PARA_SLIDE_PX = NOTCH_PX * 4; // salida hacia la izquierda
    const sonParaStartPx = sonChallengeSlideStartPx; // empieza a la vez que el H2 sube

    // Estado inicial
    if (sonParaRef.current) gsap.set(sonParaRef.current, { visibility: 'hidden' });
    if (sonParaTextRef.current) sonParaTextRef.current.textContent = '';
    // Asegurar que la imagen esté oculta durante la fase del párrafo
    if (compImageRef.current) gsap.set(compImageRef.current, { visibility: 'hidden', x: 0, y: 0 });

    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${sonParaStartPx} top`,
      end: `+=${SON_PARA_ENTER_PX}`,
      scrub: true,
      onEnter: () => {
        if (sonParaRef.current) gsap.set(sonParaRef.current, { visibility: 'visible' });
        if (compImageRef.current) gsap.set(compImageRef.current, { visibility: 'hidden' });
      },
      onEnterBack: () => {
        if (sonParaRef.current) gsap.set(sonParaRef.current, { visibility: 'visible' });
        if (compImageRef.current) gsap.set(compImageRef.current, { visibility: 'hidden' });
      },
      onUpdate: (self) => {
        if (!sonParaRef.current || !sonParaTextRef.current) return;
        const p = self.progress; // 0 → 1
        const vw = window.innerWidth;
        // Entrada: párrafo desde +100vw (derecha) → 0, imagen aún oculta
        const xPara = vw * (1 - p);
        gsap.set(sonParaRef.current, { x: xPara, y: 0 });
        const total = sonParaFullText.length;
        const chars = Math.floor(p * total);
        sonParaTextRef.current.textContent = sonParaFullText.slice(0, chars);
      },
      onLeaveBack: () => {
        if (sonParaRef.current) gsap.set(sonParaRef.current, { visibility: 'hidden', y: window.innerHeight });
        if (compImageRef.current) gsap.set(compImageRef.current, { visibility: 'hidden', y: window.innerHeight });
        if (sonParaTextRef.current) sonParaTextRef.current.textContent = '';
      }
    });

    // BLAST del H2 (frase del hijo): cuando empieza el párrafo, disparar hacia arriba rápido
    const SON_BLAST_PX = NOTCH_PX * 2;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${sonParaStartPx} top`,
      end: `+=${SON_BLAST_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!sonChallengeRef.current) return;
        const p = self.progress; // 0 → 1
        const y = -window.innerHeight * 1.2 * p; // 0 → -120vh
        const sc = 1 + 0.05 * p; // leve impulso
        gsap.set(sonChallengeRef.current, { y, scale: sc });
      },
      onLeaveBack: () => {
        if (sonChallengeRef.current) gsap.set(sonChallengeRef.current, { y: 0, scale: 1 });
      }
    });

    // HOLD: mantener ambos centrados para lectura
    const sonParaHoldStartPx = sonParaStartPx + SON_PARA_ENTER_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${sonParaHoldStartPx} top`,
      end: `+=${SON_PARA_HOLD_PX}`,
      scrub: true,
      onUpdate: () => {
        if (sonParaRef.current) gsap.set(sonParaRef.current, { x: 0, y: 0 });
      },
      onLeaveBack: () => {
        if (sonParaRef.current) gsap.set(sonParaRef.current, { x: 0, y: 0 });
      }
    });

    // SLIDE OUT: el párrafo sale hacia la izquierda
    const sonParaSlideStartPx = sonParaHoldStartPx + SON_PARA_HOLD_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${sonParaSlideStartPx} top`,
      end: `+=${SON_PARA_SLIDE_PX}`,
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress; // 0 → 1
        const vw = window.innerWidth;
        if (sonParaRef.current) {
          const xPara = -vw * p; // 0 → -100vw
          gsap.set(sonParaRef.current, { x: xPara });
        }
      },
      onLeaveBack: () => {
        if (sonParaRef.current) gsap.set(sonParaRef.current, { x: 0 });
      }
    });

    // ========== Imagen: entra desde la derecha, hold 5 notches, sale a la izquierda ==========
    const IMG_ENTER_PX = NOTCH_PX * 4;
    const IMG_HOLD_PX = NOTCH_PX * 5;
    const IMG_SLIDE_PX = NOTCH_PX * 4;
    const imgStartPx = sonParaSlideStartPx; // empieza cuando el párrafo comienza a salir

    // Entrada
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${imgStartPx} top`,
      end: `+=${IMG_ENTER_PX}`,
      scrub: true,
      onEnter: () => { if (compImageRef.current) gsap.set(compImageRef.current, { visibility: 'visible' }); },
      onEnterBack: () => { if (compImageRef.current) gsap.set(compImageRef.current, { visibility: 'visible' }); },
      onUpdate: (self) => {
        if (!compImageRef.current) return;
        const p = self.progress;
        const vw = window.innerWidth;
        const xImg = vw * (1 - p); // +100vw → 0
        gsap.set(compImageRef.current, { x: xImg, y: 0 });
      },
      onLeaveBack: () => { if (compImageRef.current) gsap.set(compImageRef.current, { x: 0, y: 0, visibility: 'hidden' }); }
    });

    // Hold
    const imgHoldStartPx = imgStartPx + IMG_ENTER_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${imgHoldStartPx} top`,
      end: `+=${IMG_HOLD_PX}`,
      scrub: true,
      onUpdate: () => { if (compImageRef.current) gsap.set(compImageRef.current, { x: 0, y: 0 }); },
      onLeaveBack: () => { if (compImageRef.current) gsap.set(compImageRef.current, { x: 0, y: 0 }); }
    });

    // Colapso con zoom-in y desaparición tras 6 notches
    const IMG_COLLAPSE_PX = NOTCH_PX * 6;
    const imgCollapseStartPx = imgHoldStartPx + IMG_HOLD_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${imgCollapseStartPx} top`,
      end: `+=${IMG_COLLAPSE_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!compImageRef.current) return;
        const p = self.progress; // 0 → 1
        const scale = 1 + 1.0 * p; // zoom-in hasta 2.0x
        const rotate = 12 * p;     // giro leve hasta 12°
        const opacity = 1 - p;     // desvanecer a 0
        gsap.set(compImageRef.current, { scale, rotate, opacity, transformOrigin: 'center center' });
      },
      onLeave: () => { if (compImageRef.current) gsap.set(compImageRef.current, { visibility: 'hidden' }); },
      onLeaveBack: () => { if (compImageRef.current) gsap.set(compImageRef.current, { scale: 1, opacity: 1, visibility: 'visible' }); }
    });

    // ====== H2 Scorus GYM: aparición desde todos los lados ======
    const GYM_ENTRY_PX = NOTCH_PX * 5;  // Fase de entrada (barrido lento y controlado)
    const GYM_STATIC_PX = NOTCH_PX * 5; // Fase estática (nada se mueve)
    const GYM_EXIT_PX = NOTCH_PX * 5;   // Fase de salida (barrido lento y controlado)
    const GYM_IN_PX = GYM_ENTRY_PX + GYM_STATIC_PX + GYM_EXIT_PX; // Total: 15 notchs
    const gymStartPx = imgCollapseStartPx; // empieza cuando la imagen comienza a colapsar

    let gymPieces: HTMLElement[] = [];
    let gymPiecesVectors: Array<{ el: HTMLElement; x0: number; y0: number; rot0: number; edge: number }> = [];
    
    const prepareGymTitle = () => {
      if (!gymTitleTextRef.current) return;
      const text = gymTitleText;
      gymTitleTextRef.current.textContent = '';
      const frag = document.createDocumentFragment();
      gymPieces = [];
      gymPiecesVectors = [];
      
      // Calcular posiciones de origen para cada palabra
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      
      text.split(' ').forEach((word, wi) => {
        // Agregar espacio antes de cada palabra excepto la primera
        if (wi > 0) {
          const spaceSpan = document.createElement('span');
          spaceSpan.textContent = '\u00A0'; // non-breaking space
          spaceSpan.style.display = 'inline-block';
          frag.appendChild(spaceSpan);
        }
        const span = document.createElement('span');
        span.textContent = word;
        span.style.display = 'inline-block';
        span.style.willChange = 'transform, opacity';
        frag.appendChild(span);
        gymPieces.push(span);
        
        // Guardar el vector de origen para esta palabra
        const edge = wi % 4; // 0 top, 1 right, 2 bottom, 3 left
        let x0 = 0, y0 = 0;
        if (edge === 0) { x0 = (Math.random() - 0.5) * vw; y0 = -vh * 0.8; }
        if (edge === 1) { x0 = vw * 0.8; y0 = (Math.random() - 0.5) * vh; }
        if (edge === 2) { x0 = (Math.random() - 0.5) * vw; y0 = vh * 0.8; }
        if (edge === 3) { x0 = -vw * 0.8; y0 = (Math.random() - 0.5) * vh; }
        const rot0 = (edge === 1 || edge === 3 ? 15 : -15);
        
        gymPiecesVectors.push({ el: span, x0, y0, rot0, edge });
      });
      gymTitleTextRef.current.appendChild(frag);
    };

    if (gymTitleRef.current) gsap.set(gymTitleRef.current, { visibility: 'hidden' });
    // gymIntroParaRef ya tiene opacity: 0 y transform: scale(1.5) en el style inline
    if (gymLinesRef.current) {
      gsap.set(gymLinesRef.current, { opacity: 1 }); // Siempre visible, el barrido se hace con translate
      // Líneas 1-4 (arriba-izquierda) empiezan fuera con valores negativos
      gymLinesRef.current.style.setProperty('--translate-1', '-100');
      gymLinesRef.current.style.setProperty('--translate-2', '-80');
      gymLinesRef.current.style.setProperty('--translate-3', '-90');
      gymLinesRef.current.style.setProperty('--translate-4', '-70');
      // Líneas 5-7 (abajo-derecha) empiezan fuera con valores negativos (se vuelven positivos con el -1 del transform)
      gymLinesRef.current.style.setProperty('--translate-5', '-100');
      gymLinesRef.current.style.setProperty('--translate-6', '-80');
      gymLinesRef.current.style.setProperty('--translate-7', '-90');
    }

    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${gymStartPx} top`,
      end: `+=${GYM_IN_PX}`,
      scrub: true,
      onEnter: () => {
        if (gymTitleRef.current) gsap.set(gymTitleRef.current, { visibility: 'visible' });
        if (gymLinesRef.current) gymLinesRef.current.style.opacity = '1';
        prepareGymTitle();
      },
      onEnterBack: () => {
        if (gymTitleRef.current) gsap.set(gymTitleRef.current, { visibility: 'visible' });
        if (gymLinesRef.current) gymLinesRef.current.style.opacity = '1';
        prepareGymTitle();
      },
      onUpdate: (self) => {
        if (!gymPieces.length) return;
        const p = self.progress; // 0 → 1
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        
        // Calcular las fases basadas en los NOTCH_PX
        const entryThreshold = GYM_ENTRY_PX / GYM_IN_PX; // ~0.27 (3/11)
        const staticThreshold = (GYM_ENTRY_PX + GYM_STATIC_PX) / GYM_IN_PX; // ~0.73 (8/11)
        
        // Animar las líneas diagonales de fondo con movimientos orgánicos
        if (gymLinesRef.current) {
          let linesOpacity = 1; // Siempre visibles
          let translate1 = 0, translate2 = 0, translate3 = 0, translate4 = 0, translate5 = 0, translate6 = 0, translate7 = 0;
          
          if (p <= entryThreshold) {
            // FASE 1: Entrada con efecto barrido (vienen desde fuera)
            const entryProgress = p / entryThreshold;
            // Líneas 1-4: vienen desde arriba-izquierda (valores negativos → posición negativa)
            translate1 = -100 * (1 - entryProgress); // De -100 a 0: Rápida
            translate2 = -80 * (1 - entryProgress);  // De -80 a 0: Media
            translate3 = -90 * (1 - entryProgress);  // De -90 a 0: Media-rápida
            translate4 = -70 * (1 - entryProgress);  // De -70 a 0: Más lenta
            // Líneas 5-7: vienen desde abajo-derecha (valores negativos * -1 en transform = positivos)
            translate5 = -100 * (1 - entryProgress);  // De -100 a 0 → con -1 = de 100 a 0: Rápida
            translate6 = -80 * (1 - entryProgress);   // De -80 a 0 → con -1 = de 80 a 0: Media
            translate7 = -90 * (1 - entryProgress);   // De -90 a 0 → con -1 = de 90 a 0: Media-rápida
          } else if (p <= staticThreshold) {
            // FASE 2: Estático (5 notchs)
            translate1 = 0;
            translate2 = 0;
            translate3 = 0;
            translate4 = 0;
            translate5 = 0;
            translate6 = 0;
            translate7 = 0;
          } else {
            // FASE 3: Salida con diferentes velocidades (CRUCE - salen por el lado opuesto al que entraron)
            const exitProgress = (p - staticThreshold) / (1 - staticThreshold);
            linesOpacity = 1 - exitProgress;
            // Líneas 1-4 entraron por arriba-izquierda → SALEN hacia abajo-derecha (valores POSITIVOS)
            translate1 = exitProgress * 150; // De 0 a 150 → con multiplicador positivo = abajo-derecha: Muy rápida
            translate2 = exitProgress * 100; // De 0 a 100 → con multiplicador positivo = abajo-derecha: Lenta
            translate3 = exitProgress * 125; // De 0 a 125 → con multiplicador positivo = abajo-derecha: Media-rápida
            translate4 = exitProgress * 90;  // De 0 a 90 → con multiplicador positivo = abajo-derecha: Muy lenta
            // Líneas 5-7 entraron por abajo-derecha → SALEN hacia arriba-izquierda (valores positivos * -1 = negativos)
            translate5 = exitProgress * 140; // De 0 a 140 → con -1 = de 0 a -140 = arriba-izquierda: Rápida
            translate6 = exitProgress * 95;  // De 0 a 95 → con -1 = de 0 a -95 = arriba-izquierda: Lenta
            translate7 = exitProgress * 120; // De 0 a 120 → con -1 = de 0 a -120 = arriba-izquierda: Media
          }
          
          gymLinesRef.current.style.opacity = String(linesOpacity);
          gymLinesRef.current.style.setProperty('--translate-1', `${translate1}`);
          gymLinesRef.current.style.setProperty('--translate-2', `${translate2}`);
          gymLinesRef.current.style.setProperty('--translate-3', `${translate3}`);
          gymLinesRef.current.style.setProperty('--translate-4', `${translate4}`);
          gymLinesRef.current.style.setProperty('--translate-5', `${translate5}`);
          gymLinesRef.current.style.setProperty('--translate-6', `${translate6}`);
          gymLinesRef.current.style.setProperty('--translate-7', `${translate7}`);
        }
        
        // Animar cada palabra con dispersión en entrada y salida
        gymPiecesVectors.forEach((vec) => {
          const { el, x0, y0, rot0 } = vec;
          let x, y, rot, opacity;
          
          if (p <= entryThreshold) {
            // FASE 1: Entrada - dispersión desde bordes hacia el centro
            const entryProgress = p / entryThreshold;
            x = x0 * (1 - entryProgress);
            y = y0 * (1 - entryProgress);
            rot = rot0 * (1 - entryProgress);
            opacity = entryProgress;
          } else if (p <= staticThreshold) {
            // FASE 2: Estático en el centro (5 notchs)
            x = 0;
            y = 0;
            rot = 0;
            opacity = 1;
          } else {
            // FASE 3: Salida - dispersión desde el centro hacia los bordes (efecto inverso a la entrada)
            const exitProgress = (p - staticThreshold) / (1 - staticThreshold);
            x = x0 * exitProgress;
            y = y0 * exitProgress;
            rot = rot0 * exitProgress;
            opacity = 1 - exitProgress;
          }
          
          el.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
          el.style.opacity = String(opacity);
        });
        
        // Animar el subtítulo "Scorus GYM" y la barra roja
        if (gymSubtitleRef.current) {
          let subtitleOpacity = 0;
          if (p <= entryThreshold) {
            subtitleOpacity = p / entryThreshold;
          } else if (p <= staticThreshold) {
            subtitleOpacity = 1;
          } else {
            subtitleOpacity = 1 - ((p - staticThreshold) / (1 - staticThreshold));
          }
          gymSubtitleRef.current.style.opacity = String(subtitleOpacity);
        }
        
        // Animar la barra roja decorativa
        if (gymBarRef.current) {
          let barOpacity = 0;
          if (p <= entryThreshold) {
            barOpacity = p / entryThreshold;
          } else if (p <= staticThreshold) {
            barOpacity = 1;
          } else {
            barOpacity = 1 - ((p - staticThreshold) / (1 - staticThreshold));
          }
          gymBarRef.current.style.opacity = String(barOpacity);
        }
        
        // Animar el párrafo introductorio con zoom out (aparece cuando el H2 desaparece)
        if (gymIntroParaRef.current) {
          let paraOpacity = 0;
          let paraScale = 1.5; // Empieza más grande
          
          if (p > staticThreshold) {
            // Solo aparece en la fase de salida
            const exitProgress = (p - staticThreshold) / (1 - staticThreshold); // 0 → 1
            paraOpacity = exitProgress; // De 0 a 1
            paraScale = 1.5 - (0.5 * exitProgress); // De 1.5 a 1.0 (zoom out)
          }
          
          gymIntroParaRef.current.style.opacity = String(paraOpacity);
          gymIntroParaRef.current.style.transform = `scale(${paraScale})`;
        }
      },
      onLeave: () => {
        // Ocultar las líneas cuando se sale completamente hacia adelante
        if (gymLinesRef.current) {
          gymLinesRef.current.style.opacity = '0';
        }
      },
      onLeaveBack: () => {
        gymPieces.forEach((el) => { (el as HTMLElement).style.transform = ''; (el as HTMLElement).style.opacity = '0'; });
        gymPieces = [];
        gymPiecesVectors = [];
        if (gymTitleRef.current) gsap.set(gymTitleRef.current, { visibility: 'hidden' });
        if (gymSubtitleRef.current) gymSubtitleRef.current.style.opacity = '0';
        if (gymBarRef.current) gymBarRef.current.style.opacity = '0';
        if (gymIntroParaRef.current) {
          gymIntroParaRef.current.style.opacity = '0';
          gymIntroParaRef.current.style.transform = 'scale(1.5)';
        }
        if (gymLinesRef.current) {
          gymLinesRef.current.style.opacity = '1';
          // Reset líneas 1-4 (arriba-izquierda)
          gymLinesRef.current.style.setProperty('--translate-1', '-100');
          gymLinesRef.current.style.setProperty('--translate-2', '-80');
          gymLinesRef.current.style.setProperty('--translate-3', '-90');
          gymLinesRef.current.style.setProperty('--translate-4', '-70');
          // Reset líneas 5-7 (abajo-derecha)
          gymLinesRef.current.style.setProperty('--translate-5', '-100');
          gymLinesRef.current.style.setProperty('--translate-6', '-80');
          gymLinesRef.current.style.setProperty('--translate-7', '-90');
        }
      }
    });

    // ====== Animación de salida del párrafo introductorio con zoom out ======
    const PARA_STATIC_PX = NOTCH_PX * 3;  // Párrafo permanece estático
    const PARA_EXIT_PX = NOTCH_PX * 3;    // Párrafo desaparece con zoom out
    const PARA_TOTAL_PX = PARA_STATIC_PX + PARA_EXIT_PX; // Total: 6 notchs
    const gymParaExitStartPx = gymStartPx + GYM_IN_PX; // Empieza después del H2

    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${gymParaExitStartPx} top`,
      end: `+=${PARA_TOTAL_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!gymIntroParaRef.current) return;
        const p = self.progress; // 0 → 1
        
        // Calcular umbral: primero estático, luego zoom out
        const staticThreshold = PARA_STATIC_PX / PARA_TOTAL_PX; // 0.5
        
        let paraOpacity = 1;
        let paraScale = 1;
        
        if (p <= staticThreshold) {
          // FASE 1: Estático (párrafo visible completamente)
          paraOpacity = 1;
          paraScale = 1;
        } else {
          // FASE 2: Zoom out y fade out
          const exitProgress = (p - staticThreshold) / (1 - staticThreshold); // 0 → 1
          paraOpacity = 1 - exitProgress; // De 1 a 0
          paraScale = 1 - (0.5 * exitProgress); // De 1.0 a 0.5 (zoom out)
        }
        
        gymIntroParaRef.current.style.opacity = String(paraOpacity);
        gymIntroParaRef.current.style.transform = `scale(${paraScale})`;
      },
      onLeave: () => {
        // Ocultar completamente cuando sale
        if (gymIntroParaRef.current) {
          gymIntroParaRef.current.style.opacity = '0';
          gymIntroParaRef.current.style.transform = 'scale(0.5)';
        }
      },
      onLeaveBack: () => {
        // Volver al estado final del trigger anterior (scale 1, opacity 1)
        if (gymIntroParaRef.current) {
          gymIntroParaRef.current.style.opacity = '1';
          gymIntroParaRef.current.style.transform = 'scale(1)';
        }
      }
    });

    currentScrollPx += PARA_TOTAL_PX;

    // ====== Título NABBA 2006 - Aparece con zoom in, permanece estático y desaparece con zoom out ======
    const NABBA_ENTRY_PX = NOTCH_PX * 3;  // Zoom in del título NABBA
    const NABBA_STATIC_PX = NOTCH_PX * 5; // Título permanece visible (tiempo para leer)
    const NABBA_EXIT_PX = NOTCH_PX * 3;   // Zoom out del título NABBA
    const NABBA_TOTAL_PX = NABBA_ENTRY_PX + NABBA_STATIC_PX + NABBA_EXIT_PX; // Total: 11 notchs
    const nabbaStartPx = gymParaExitStartPx + PARA_STATIC_PX; // Empieza cuando el párrafo comienza a desaparecer

    if (nabbaChampRef.current) {
      gsap.set(nabbaChampRef.current, { opacity: 0, scale: 2 }); // Empieza grande y oculto
    }

    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${nabbaStartPx} top`,
      end: `+=${NABBA_TOTAL_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!nabbaChampRef.current) return;
        const p = self.progress; // 0 → 1
        
        // Calcular umbrales: entrada, estático, salida
        const entryThreshold = NABBA_ENTRY_PX / NABBA_TOTAL_PX; // ~0.27
        const staticThreshold = (NABBA_ENTRY_PX + NABBA_STATIC_PX) / NABBA_TOTAL_PX; // ~0.73
        
        let nabbaOpacity = 0;
        let nabbaScale = 2;
        
        if (p <= entryThreshold) {
          // FASE 1: Zoom in + fade in
          const entryProgress = p / entryThreshold; // 0 → 1
          nabbaOpacity = entryProgress; // De 0 a 1
          nabbaScale = 2 - (1 * entryProgress); // De 2.0 a 1.0 (zoom in)
        } else if (p <= staticThreshold) {
          // FASE 2: Estático (título visible completamente)
          nabbaOpacity = 1;
          nabbaScale = 1;
        } else {
          // FASE 3: Zoom out + fade out
          const exitProgress = (p - staticThreshold) / (1 - staticThreshold); // 0 → 1
          nabbaOpacity = 1 - exitProgress; // De 1 a 0
          nabbaScale = 1 - (0.5 * exitProgress); // De 1.0 a 0.5 (zoom out)
        }
        
        nabbaChampRef.current.style.opacity = String(nabbaOpacity);
        nabbaChampRef.current.style.transform = `scale(${nabbaScale})`;
      },
      onLeave: () => {
        // Ocultar completamente cuando sale hacia adelante
        if (nabbaChampRef.current) {
          nabbaChampRef.current.style.opacity = '0';
          nabbaChampRef.current.style.transform = 'scale(0.5)';
        }
      },
      onLeaveBack: () => {
        // Volver al estado inicial cuando vuelve atrás
        if (nabbaChampRef.current) {
          nabbaChampRef.current.style.opacity = '0';
          nabbaChampRef.current.style.transform = 'scale(2)';
        }
      }
    });

    currentScrollPx += NABBA_TOTAL_PX;

    // ====== Título NAC Mister Universo 2009 - Aparece con zoom in, permanece estático y desaparece con zoom out ======
    const MR_UNIVERSO_ENTRY_PX = NOTCH_PX * 3;  // Zoom in del título Mr. Universo
    const MR_UNIVERSO_STATIC_PX = NOTCH_PX * 5; // Título permanece visible (tiempo para leer)
    const MR_UNIVERSO_EXIT_PX = NOTCH_PX * 3;   // Zoom out del título Mr. Universo
    const MR_UNIVERSO_TOTAL_PX = MR_UNIVERSO_ENTRY_PX + MR_UNIVERSO_STATIC_PX + MR_UNIVERSO_EXIT_PX; // Total: 11 notchs
    const mrUniversoStartPx = nabbaStartPx + NABBA_ENTRY_PX + NABBA_STATIC_PX; // Empieza cuando NABBA comienza a desaparecer

    if (mrUniversoRef.current) {
      gsap.set(mrUniversoRef.current, { opacity: 0, scale: 2 }); // Empieza grande y oculto
    }

    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${mrUniversoStartPx} top`,
      end: `+=${MR_UNIVERSO_TOTAL_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!mrUniversoRef.current) return;
        const p = self.progress; // 0 → 1
        
        // Calcular umbrales: entrada, estático, salida
        const entryThreshold = MR_UNIVERSO_ENTRY_PX / MR_UNIVERSO_TOTAL_PX; // ~0.27
        const staticThreshold = (MR_UNIVERSO_ENTRY_PX + MR_UNIVERSO_STATIC_PX) / MR_UNIVERSO_TOTAL_PX; // ~0.73
        
        let universoOpacity = 0;
        let universoScale = 2;
        
        if (p <= entryThreshold) {
          // FASE 1: Zoom in + fade in
          const entryProgress = p / entryThreshold; // 0 → 1
          universoOpacity = entryProgress; // De 0 a 1
          universoScale = 2 - (1 * entryProgress); // De 2.0 a 1.0 (zoom in)
        } else if (p <= staticThreshold) {
          // FASE 2: Estático (título visible completamente)
          universoOpacity = 1;
          universoScale = 1;
        } else {
          // FASE 3: Zoom out + fade out
          const exitProgress = (p - staticThreshold) / (1 - staticThreshold); // 0 → 1
          universoOpacity = 1 - exitProgress; // De 1 a 0
          universoScale = 1 - (0.5 * exitProgress); // De 1.0 a 0.5 (zoom out)
        }
        
        mrUniversoRef.current.style.opacity = String(universoOpacity);
        mrUniversoRef.current.style.transform = `scale(${universoScale})`;
      },
      onLeave: () => {
        // Ocultar completamente cuando sale hacia adelante
        if (mrUniversoRef.current) {
          mrUniversoRef.current.style.opacity = '0';
          mrUniversoRef.current.style.transform = 'scale(0.5)';
        }
      },
      onLeaveBack: () => {
        // Volver al estado inicial cuando vuelve atrás
        if (mrUniversoRef.current) {
          mrUniversoRef.current.style.opacity = '0';
          mrUniversoRef.current.style.transform = 'scale(2)';
        }
      }
    });

    currentScrollPx += MR_UNIVERSO_TOTAL_PX;

    // ====== Título Arnold Classic - Aparece con zoom in, permanece estático y desaparece con zoom out ======
    const ARNOLD_ENTRY_PX = NOTCH_PX * 3;  // Zoom in del título Arnold Classic
    const ARNOLD_STATIC_PX = NOTCH_PX * 5; // Título permanece visible (tiempo para leer)
    const ARNOLD_EXIT_PX = NOTCH_PX * 3;   // Zoom out del título Arnold Classic
    const ARNOLD_TOTAL_PX = ARNOLD_ENTRY_PX + ARNOLD_STATIC_PX + ARNOLD_EXIT_PX; // Total: 11 notchs
    const arnoldStartPx = mrUniversoStartPx + MR_UNIVERSO_ENTRY_PX + MR_UNIVERSO_STATIC_PX; // Empieza cuando Mr. Universo comienza a desaparecer

    if (arnoldClassicRef.current) {
      gsap.set(arnoldClassicRef.current, { opacity: 0, scale: 2 }); // Empieza grande y oculto
    }

    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${arnoldStartPx} top`,
      end: `+=${ARNOLD_TOTAL_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!arnoldClassicRef.current) return;
        const p = self.progress; // 0 → 1
        
        // Calcular umbrales: entrada, estático, salida
        const entryThreshold = ARNOLD_ENTRY_PX / ARNOLD_TOTAL_PX; // ~0.27
        const staticThreshold = (ARNOLD_ENTRY_PX + ARNOLD_STATIC_PX) / ARNOLD_TOTAL_PX; // ~0.73
        
        let arnoldOpacity = 0;
        let arnoldScale = 2;
        
        if (p <= entryThreshold) {
          // FASE 1: Zoom in + fade in
          const entryProgress = p / entryThreshold; // 0 → 1
          arnoldOpacity = entryProgress; // De 0 a 1
          arnoldScale = 2 - (1 * entryProgress); // De 2.0 a 1.0 (zoom in)
        } else if (p <= staticThreshold) {
          // FASE 2: Estático (título visible completamente)
          arnoldOpacity = 1;
          arnoldScale = 1;
        } else {
          // FASE 3: Zoom out + fade out
          const exitProgress = (p - staticThreshold) / (1 - staticThreshold); // 0 → 1
          arnoldOpacity = 1 - exitProgress; // De 1 a 0
          arnoldScale = 1 - (0.5 * exitProgress); // De 1.0 a 0.5 (zoom out)
        }
        
        arnoldClassicRef.current.style.opacity = String(arnoldOpacity);
        arnoldClassicRef.current.style.transform = `scale(${arnoldScale})`;
      },
      onLeave: () => {
        // Ocultar completamente cuando sale hacia adelante
        if (arnoldClassicRef.current) {
          arnoldClassicRef.current.style.opacity = '0';
          arnoldClassicRef.current.style.transform = 'scale(0.5)';
        }
      },
      onLeaveBack: () => {
        // Volver al estado inicial cuando vuelve atrás
        if (arnoldClassicRef.current) {
          arnoldClassicRef.current.style.opacity = '0';
          arnoldClassicRef.current.style.transform = 'scale(2)';
        }
      }
    });

    currentScrollPx += ARNOLD_TOTAL_PX;

    // ====== Título Ben Weider Classic - Aparece con zoom in, permanece estático y desaparece con zoom out ======
    const BEN_WEIDER_ENTRY_PX = NOTCH_PX * 3;  // Zoom in del título Ben Weider
    const BEN_WEIDER_STATIC_PX = NOTCH_PX * 5; // Título permanece visible (tiempo para leer)
    const BEN_WEIDER_EXIT_PX = NOTCH_PX * 3;   // Zoom out del título Ben Weider
    const BEN_WEIDER_TOTAL_PX = BEN_WEIDER_ENTRY_PX + BEN_WEIDER_STATIC_PX + BEN_WEIDER_EXIT_PX; // Total: 11 notchs
    const benWeiderStartPx = arnoldStartPx + ARNOLD_ENTRY_PX + ARNOLD_STATIC_PX; // Empieza cuando Arnold Classic comienza a desaparecer

    if (benWeiderRef.current) {
      gsap.set(benWeiderRef.current, { opacity: 0, scale: 2 }); // Empieza grande y oculto
    }

    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${benWeiderStartPx} top`,
      end: `+=${BEN_WEIDER_TOTAL_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!benWeiderRef.current) return;
        const p = self.progress; // 0 → 1
        
        // Calcular umbrales: entrada, estático, salida
        const entryThreshold = BEN_WEIDER_ENTRY_PX / BEN_WEIDER_TOTAL_PX; // ~0.27
        const staticThreshold = (BEN_WEIDER_ENTRY_PX + BEN_WEIDER_STATIC_PX) / BEN_WEIDER_TOTAL_PX; // ~0.73
        
        let benOpacity = 0;
        let benScale = 2;
        
        if (p <= entryThreshold) {
          // FASE 1: Zoom in + fade in
          const entryProgress = p / entryThreshold; // 0 → 1
          benOpacity = entryProgress; // De 0 a 1
          benScale = 2 - (1 * entryProgress); // De 2.0 a 1.0 (zoom in)
        } else if (p <= staticThreshold) {
          // FASE 2: Estático (título visible completamente)
          benOpacity = 1;
          benScale = 1;
        } else {
          // FASE 3: Zoom out + fade out
          const exitProgress = (p - staticThreshold) / (1 - staticThreshold); // 0 → 1
          benOpacity = 1 - exitProgress; // De 1 a 0
          benScale = 1 - (0.5 * exitProgress); // De 1.0 a 0.5 (zoom out)
        }
        
        benWeiderRef.current.style.opacity = String(benOpacity);
        benWeiderRef.current.style.transform = `scale(${benScale})`;
      },
      onLeave: () => {
        // Ocultar completamente cuando sale hacia adelante
        if (benWeiderRef.current) {
          benWeiderRef.current.style.opacity = '0';
          benWeiderRef.current.style.transform = 'scale(0.5)';
        }
      },
      onLeaveBack: () => {
        // Volver al estado inicial cuando vuelve atrás
        if (benWeiderRef.current) {
          benWeiderRef.current.style.opacity = '0';
          benWeiderRef.current.style.transform = 'scale(2)';
        }
      }
    });

    currentScrollPx += BEN_WEIDER_TOTAL_PX;

    // ====== Párrafo sobre familia y regreso 2018 - Aparece con zoom in, permanece estático y desaparece con zoom out ======
    const FAMILY_PARA_ENTRY_PX = NOTCH_PX * 3;  // Zoom in del párrafo
    const FAMILY_PARA_STATIC_PX = NOTCH_PX * 5; // Párrafo permanece visible (tiempo para leer)
    const FAMILY_PARA_EXIT_PX = NOTCH_PX * 3;   // Zoom out del párrafo
    const FAMILY_PARA_TOTAL_PX = FAMILY_PARA_ENTRY_PX + FAMILY_PARA_STATIC_PX + FAMILY_PARA_EXIT_PX; // Total: 11 notchs
    const familyParaStartPx = benWeiderStartPx + BEN_WEIDER_ENTRY_PX + BEN_WEIDER_STATIC_PX; // Empieza cuando Ben Weider comienza a desaparecer

    if (familyParaRef.current) {
      gsap.set(familyParaRef.current, { opacity: 0, scale: 2 }); // Empieza grande y oculto
    }

    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${familyParaStartPx} top`,
      end: `+=${FAMILY_PARA_TOTAL_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!familyParaRef.current) return;
        const p = self.progress; // 0 → 1
        
        // Calcular umbrales: entrada, estático, salida
        const entryThreshold = FAMILY_PARA_ENTRY_PX / FAMILY_PARA_TOTAL_PX; // ~0.27
        const staticThreshold = (FAMILY_PARA_ENTRY_PX + FAMILY_PARA_STATIC_PX) / FAMILY_PARA_TOTAL_PX; // ~0.73
        
        let paraOpacity = 0;
        let paraScale = 2;
        
        if (p <= entryThreshold) {
          // FASE 1: Zoom in + fade in
          const entryProgress = p / entryThreshold; // 0 → 1
          paraOpacity = entryProgress; // De 0 a 1
          paraScale = 2 - (1 * entryProgress); // De 2.0 a 1.0 (zoom in)
        } else if (p <= staticThreshold) {
          // FASE 2: Estático (párrafo visible completamente)
          paraOpacity = 1;
          paraScale = 1;
        } else {
          // FASE 3: Zoom out + fade out
          const exitProgress = (p - staticThreshold) / (1 - staticThreshold); // 0 → 1
          paraOpacity = 1 - exitProgress; // De 1 a 0
          paraScale = 1 - (0.5 * exitProgress); // De 1.0 a 0.5 (zoom out)
        }
        
        familyParaRef.current.style.opacity = String(paraOpacity);
        familyParaRef.current.style.transform = `scale(${paraScale})`;
      },
      onLeave: () => {
        // Ocultar completamente cuando sale hacia adelante
        if (familyParaRef.current) {
          familyParaRef.current.style.opacity = '0';
          familyParaRef.current.style.transform = 'scale(0.5)';
        }
      },
      onLeaveBack: () => {
        // Volver al estado inicial cuando vuelve atrás
        if (familyParaRef.current) {
          familyParaRef.current.style.opacity = '0';
          familyParaRef.current.style.transform = 'scale(2)';
        }
      }
    });

    currentScrollPx += FAMILY_PARA_TOTAL_PX;

    // ====== H2 "El Regreso Triunfal" - Aparece fragmentándose mientras el párrafo desaparece ======
    const TRIUMPH_TITLE_TEXT = 'El Regreso Triunfal: Más Fuerte que Nunca';
    let triumphPrepared = false;
    let triumphPieces: HTMLElement[] = [];
    let triumphVectors: Array<{ el: HTMLElement; x0: number; y0: number; rot0: number }> = [];

    const prepareTriumphTitle = () => {
      if (triumphPrepared || !triumphTitleTextRef.current) return;
      
      const text = TRIUMPH_TITLE_TEXT;
      const riveteadoWords = ['Regreso', 'Triunfal:', 'Fuerte', 'Nunca']; // Palabras con efecto riveteado
      triumphTitleTextRef.current.textContent = '';
      const frag = document.createDocumentFragment();
      
      // Fragmentar por palabras
      text.split(' ').forEach((word, wi) => {
        // Agregar espacio antes de cada palabra excepto la primera
        if (wi > 0) {
          const spaceSpan = document.createElement('span');
          spaceSpan.textContent = '\u00A0';
          spaceSpan.style.display = 'inline-block';
          frag.appendChild(spaceSpan);
        }
        
        const span = document.createElement('span');
        span.textContent = word;
        span.style.display = 'inline-block';
        span.style.willChange = 'transform, opacity';
        
        // Aplicar efecto riveteado (outline rojo con fondo transparente, SIN sombras)
        if (riveteadoWords.includes(word)) {
          span.style.color = 'transparent';
          span.style.webkitTextStroke = '2px #E50914'; // Borde rojo
        }
        
        frag.appendChild(span);
        triumphPieces.push(span);
      });
      
      triumphTitleTextRef.current.appendChild(frag);
      
      // Generar vectores aleatorios para dispersión
      triumphPieces.forEach((el) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 300 + Math.random() * 400;
        const x0 = Math.cos(angle) * distance;
        const y0 = Math.sin(angle) * distance;
        const rot0 = (Math.random() - 0.5) * 90;
        triumphVectors.push({ el, x0, y0, rot0 });
      });
      
      triumphPrepared = true;
    };

    const TRIUMPH_ENTRY_PX = NOTCH_PX * 5;  // Entrada con fragmentación
    const TRIUMPH_STATIC_PX = NOTCH_PX * 5; // Título permanece visible
    const TRIUMPH_EXIT_PX = NOTCH_PX * 5;   // Salida épica con dispersión
    const TRIUMPH_TOTAL_PX = TRIUMPH_ENTRY_PX + TRIUMPH_STATIC_PX + TRIUMPH_EXIT_PX; // Total: 15 notchs
    const triumphStartPx = familyParaStartPx + FAMILY_PARA_ENTRY_PX + FAMILY_PARA_STATIC_PX; // Empieza cuando el párrafo comienza a desaparecer

    if (triumphTitleRef.current) {
      gsap.set(triumphTitleRef.current, { opacity: 0 });
    }

    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${triumphStartPx} top`,
      end: `+=${TRIUMPH_TOTAL_PX}`,
      scrub: true,
      onEnter: () => {
        prepareTriumphTitle();
        if (triumphTitleRef.current) gsap.set(triumphTitleRef.current, { opacity: 1 });
      },
      onUpdate: (self) => {
        if (!triumphTitleRef.current || triumphVectors.length === 0) return;
        const p = self.progress; // 0 → 1
        
        // Calcular umbrales: entrada, estático, salida
        const entryThreshold = TRIUMPH_ENTRY_PX / TRIUMPH_TOTAL_PX; // ~0.33
        const staticThreshold = (TRIUMPH_ENTRY_PX + TRIUMPH_STATIC_PX) / TRIUMPH_TOTAL_PX; // ~0.67
        
        if (p <= entryThreshold) {
          // FASE 1: Entrada con fragmentación (palabras vienen desde fuera hacia el centro)
          const entryProgress = p / entryThreshold; // 0 → 1
          
          triumphVectors.forEach(({ el, x0, y0, rot0 }) => {
            const x = x0 * (1 - entryProgress); // De posición lejana a 0
            const y = y0 * (1 - entryProgress);
            const rot = rot0 * (1 - entryProgress);
            const opacity = entryProgress;
            
            el.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
            el.style.opacity = String(opacity);
          });
        } else if (p <= staticThreshold) {
          // FASE 2: Estático (título visible completamente en el centro)
          triumphVectors.forEach(({ el }) => {
            el.style.transform = 'translate(0px, 0px) rotate(0deg)';
            el.style.opacity = '1';
          });
        } else {
          // FASE 3: Salida épica con dispersión (palabras salen hacia fuera con rotación)
          const exitProgress = (p - staticThreshold) / (1 - staticThreshold); // 0 → 1
          
          triumphVectors.forEach(({ el, x0, y0, rot0 }) => {
            const x = x0 * exitProgress; // De 0 a posición lejana
            const y = y0 * exitProgress;
            const rot = rot0 * exitProgress;
            const opacity = 1 - exitProgress;
            
            el.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
            el.style.opacity = String(opacity);
          });
        }
      },
      onLeave: () => {
        // Ocultar completamente cuando sale
        if (triumphTitleRef.current) gsap.set(triumphTitleRef.current, { opacity: 0 });
        triumphVectors.forEach(({ el, x0, y0, rot0 }) => {
          el.style.transform = `translate(${x0}px, ${y0}px) rotate(${rot0}deg)`;
          el.style.opacity = '0';
        });
      },
      onEnterBack: () => {
        // Volver a preparar y mostrar cuando vuelve atrás
        prepareTriumphTitle();
        if (triumphTitleRef.current) gsap.set(triumphTitleRef.current, { opacity: 1 });
      },
      onLeaveBack: () => {
        // Ocultar cuando sale completamente hacia atrás
        if (triumphTitleRef.current) gsap.set(triumphTitleRef.current, { opacity: 0 });
        triumphVectors.forEach(({ el, x0, y0, rot0 }) => {
          el.style.transform = `translate(${x0}px, ${y0}px) rotate(${rot0}deg)`;
          el.style.opacity = '0';
        });
      }
    });

    currentScrollPx += TRIUMPH_TOTAL_PX;

    // ====== Frase de motivación renovada - Aparece con entrada épica mientras el H2 sale ======
    const MOTIVATION_ENTRY_PX = NOTCH_PX * 5;  // Entrada épica
    const MOTIVATION_STATIC_PX = NOTCH_PX * 5; // Frase permanece visible
    const MOTIVATION_EXIT_PX = NOTCH_PX * 5;   // Salida épica
    const MOTIVATION_TOTAL_PX = MOTIVATION_ENTRY_PX + MOTIVATION_STATIC_PX + MOTIVATION_EXIT_PX; // Total: 15 notchs
    const motivationStartPx = triumphStartPx + TRIUMPH_ENTRY_PX + TRIUMPH_STATIC_PX; // Empieza cuando el H2 comienza a salir

    if (motivationPhraseRef.current) {
      gsap.set(motivationPhraseRef.current, { opacity: 0, scale: 0.5 });
    }

    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${motivationStartPx} top`,
      end: `+=${MOTIVATION_TOTAL_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!motivationPhraseRef.current) return;
        const p = self.progress; // 0 → 1
        
        // Calcular umbrales: entrada, estático, salida
        const entryThreshold = MOTIVATION_ENTRY_PX / MOTIVATION_TOTAL_PX; // ~0.33
        const staticThreshold = (MOTIVATION_ENTRY_PX + MOTIVATION_STATIC_PX) / MOTIVATION_TOTAL_PX; // ~0.67
        
        if (p <= entryThreshold) {
          // FASE 1: Entrada épica con zoom in explosivo + rotación
          const entryProgress = p / entryThreshold; // 0 → 1
          const scale = 0.5 + (0.5 * entryProgress); // De 0.5 a 1.0
          const rotate = (1 - entryProgress) * 10; // De 10° a 0° (pequeña rotación)
          const opacity = entryProgress;
          
          motivationPhraseRef.current.style.opacity = String(opacity);
          motivationPhraseRef.current.style.transform = `scale(${scale}) rotate(${rotate}deg)`;
        } else if (p <= staticThreshold) {
          // FASE 2: Estático (frase visible completamente)
          motivationPhraseRef.current.style.opacity = '1';
          motivationPhraseRef.current.style.transform = 'scale(1) rotate(0deg)';
        } else {
          // FASE 3: Salida épica con zoom out + rotación inversa
          const exitProgress = (p - staticThreshold) / (1 - staticThreshold); // 0 → 1
          const scale = 1 - (0.5 * exitProgress); // De 1.0 a 0.5
          const rotate = exitProgress * -10; // De 0° a -10° (rotación inversa)
          const opacity = 1 - exitProgress;
          
          motivationPhraseRef.current.style.opacity = String(opacity);
          motivationPhraseRef.current.style.transform = `scale(${scale}) rotate(${rotate}deg)`;
        }
      },
      onLeave: () => {
        // Ocultar completamente cuando sale
        if (motivationPhraseRef.current) {
          motivationPhraseRef.current.style.opacity = '0';
          motivationPhraseRef.current.style.transform = 'scale(0.5) rotate(-10deg)';
        }
      },
      onLeaveBack: () => {
        // Volver al estado inicial cuando vuelve atrás
        if (motivationPhraseRef.current) {
          motivationPhraseRef.current.style.opacity = '0';
          motivationPhraseRef.current.style.transform = 'scale(0.5) rotate(10deg)';
        }
      }
    });

    currentScrollPx += MOTIVATION_TOTAL_PX;

    // ====== Medalla de Oro - Primera temporada tras el regreso ======
    const GOLD_MEDAL_ENTRY_PX = NOTCH_PX * 5;  // Entrada épica
    const GOLD_MEDAL_STATIC_PX = NOTCH_PX * 5; // Permanece visible
    const GOLD_MEDAL_EXIT_PX = NOTCH_PX * 5;   // Salida épica
    const GOLD_MEDAL_TOTAL_PX = GOLD_MEDAL_ENTRY_PX + GOLD_MEDAL_STATIC_PX + GOLD_MEDAL_EXIT_PX; // Total: 15 notchs
    const goldMedalStartPx = motivationStartPx + MOTIVATION_ENTRY_PX + MOTIVATION_STATIC_PX; // Empieza cuando la frase de motivación comienza a salir

    if (goldMedalRef.current) {
      gsap.set(goldMedalRef.current, { opacity: 0, scale: 0.3 });
    }

    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${goldMedalStartPx} top`,
      end: `+=${GOLD_MEDAL_TOTAL_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!goldMedalRef.current) return;
        const p = self.progress; // 0 → 1
        
        // Calcular umbrales: entrada, estático, salida
        const entryThreshold = GOLD_MEDAL_ENTRY_PX / GOLD_MEDAL_TOTAL_PX; // ~0.33
        const staticThreshold = (GOLD_MEDAL_ENTRY_PX + GOLD_MEDAL_STATIC_PX) / GOLD_MEDAL_TOTAL_PX; // ~0.67
        
        if (p <= entryThreshold) {
          // FASE 1: Entrada épica con zoom explosivo desde pequeño
          const entryProgress = p / entryThreshold; // 0 → 1
          const scale = 0.3 + (0.7 * entryProgress); // De 0.3 a 1.0 (zoom muy pronunciado)
          const opacity = entryProgress;
          
          goldMedalRef.current.style.opacity = String(opacity);
          goldMedalRef.current.style.transform = `scale(${scale})`;
        } else if (p <= staticThreshold) {
          // FASE 2: Estático (medalla visible completamente)
          goldMedalRef.current.style.opacity = '1';
          goldMedalRef.current.style.transform = 'scale(1)';
        } else {
          // FASE 3: Salida épica con zoom out
          const exitProgress = (p - staticThreshold) / (1 - staticThreshold); // 0 → 1
          const scale = 1 - (0.7 * exitProgress); // De 1.0 a 0.3
          const opacity = 1 - exitProgress;
          
          goldMedalRef.current.style.opacity = String(opacity);
          goldMedalRef.current.style.transform = `scale(${scale})`;
        }
      },
      onLeave: () => {
        // Ocultar completamente cuando sale
        if (goldMedalRef.current) {
          goldMedalRef.current.style.opacity = '0';
          goldMedalRef.current.style.transform = 'scale(0.3)';
        }
      },
      onLeaveBack: () => {
        // Volver al estado inicial cuando vuelve atrás
        if (goldMedalRef.current) {
          goldMedalRef.current.style.opacity = '0';
          goldMedalRef.current.style.transform = 'scale(0.3)';
        }
      }
    });

    currentScrollPx += GOLD_MEDAL_TOTAL_PX;

    // ====== Medallas de Plata y Bronce ======
    const SILVER_BRONZE_ENTRY_PX = NOTCH_PX * 5;  // Entrada épica
    const SILVER_BRONZE_STATIC_PX = NOTCH_PX * 5; // Permanece visible
    const SILVER_BRONZE_EXIT_PX = NOTCH_PX * 5;   // Salida épica
    const SILVER_BRONZE_TOTAL_PX = SILVER_BRONZE_ENTRY_PX + SILVER_BRONZE_STATIC_PX + SILVER_BRONZE_EXIT_PX; // Total: 15 notchs
    const silverBronzeStartPx = goldMedalStartPx + GOLD_MEDAL_ENTRY_PX + GOLD_MEDAL_STATIC_PX; // Empieza cuando la medalla de oro comienza a salir

    if (silverBronzeMedalsRef.current) {
      gsap.set(silverBronzeMedalsRef.current, { opacity: 0, scale: 0.3 });
    }

    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${silverBronzeStartPx} top`,
      end: `+=${SILVER_BRONZE_TOTAL_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!silverBronzeMedalsRef.current) return;
        const p = self.progress; // 0 → 1
        
        // Calcular umbrales: entrada, estático, salida
        const entryThreshold = SILVER_BRONZE_ENTRY_PX / SILVER_BRONZE_TOTAL_PX; // ~0.33
        const staticThreshold = (SILVER_BRONZE_ENTRY_PX + SILVER_BRONZE_STATIC_PX) / SILVER_BRONZE_TOTAL_PX; // ~0.67
        
        if (p <= entryThreshold) {
          // FASE 1: Entrada épica con zoom explosivo desde pequeño
          const entryProgress = p / entryThreshold; // 0 → 1
          const scale = 0.3 + (0.7 * entryProgress); // De 0.3 a 1.0 (zoom muy pronunciado)
          const opacity = entryProgress;
          
          silverBronzeMedalsRef.current.style.opacity = String(opacity);
          silverBronzeMedalsRef.current.style.transform = `scale(${scale})`;
        } else if (p <= staticThreshold) {
          // FASE 2: Estático (medallas visibles completamente)
          silverBronzeMedalsRef.current.style.opacity = '1';
          silverBronzeMedalsRef.current.style.transform = 'scale(1)';
        } else {
          // FASE 3: Salida épica con zoom out
          const exitProgress = (p - staticThreshold) / (1 - staticThreshold); // 0 → 1
          const scale = 1 - (0.7 * exitProgress); // De 1.0 a 0.3 (zoom out)
          const opacity = 1 - exitProgress;
          
          silverBronzeMedalsRef.current.style.opacity = String(opacity);
          silverBronzeMedalsRef.current.style.transform = `scale(${scale})`;
        }
      },
      onLeave: () => {
        // Ocultar completamente cuando sale
        if (silverBronzeMedalsRef.current) {
          silverBronzeMedalsRef.current.style.opacity = '0';
          silverBronzeMedalsRef.current.style.transform = 'scale(0.3)';
        }
      },
      onLeaveBack: () => {
        // Volver al estado inicial cuando vuelve atrás
        if (silverBronzeMedalsRef.current) {
          silverBronzeMedalsRef.current.style.opacity = '0';
          silverBronzeMedalsRef.current.style.transform = 'scale(0.3)';
        }
      }
    });

    currentScrollPx += SILVER_BRONZE_TOTAL_PX;

    // ====== Tercer Mejor Culturista del Año ======
    const BEST_BODYBUILDER_ENTRY_PX = NOTCH_PX * 5;  // Entrada épica
    const BEST_BODYBUILDER_STATIC_PX = NOTCH_PX * 5; // Permanece visible
    const BEST_BODYBUILDER_EXIT_PX = NOTCH_PX * 5;   // Salida lateral hacia la izquierda
    const BEST_BODYBUILDER_TOTAL_PX = BEST_BODYBUILDER_ENTRY_PX + BEST_BODYBUILDER_STATIC_PX + BEST_BODYBUILDER_EXIT_PX; // Total: 15 notchs
    const bestBodybuilderStartPx = silverBronzeStartPx + SILVER_BRONZE_ENTRY_PX + SILVER_BRONZE_STATIC_PX; // Empieza cuando las medallas comienzan a salir

    if (bestBodybuilderRef.current) {
      gsap.set(bestBodybuilderRef.current, { opacity: 0, scale: 0.3 });
    }

    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${bestBodybuilderStartPx} top`,
      end: `+=${BEST_BODYBUILDER_TOTAL_PX}`,
      scrub: true,
      onUpdate: (self) => {
        if (!bestBodybuilderRef.current) return;
        const p = self.progress; // 0 → 1
        
        // Calcular umbrales: entrada, estático, salida
        const entryThreshold = BEST_BODYBUILDER_ENTRY_PX / BEST_BODYBUILDER_TOTAL_PX; // ~0.33
        const staticThreshold = (BEST_BODYBUILDER_ENTRY_PX + BEST_BODYBUILDER_STATIC_PX) / BEST_BODYBUILDER_TOTAL_PX; // ~0.67
        
        if (p <= entryThreshold) {
          // FASE 1: Entrada épica con zoom explosivo desde pequeño
          const entryProgress = p / entryThreshold; // 0 → 1
          const scale = 0.3 + (0.7 * entryProgress); // De 0.3 a 1.0 (zoom muy pronunciado)
          const opacity = entryProgress;
          
          bestBodybuilderRef.current.style.opacity = String(opacity);
          bestBodybuilderRef.current.style.transform = `scale(${scale}) translateX(0)`;
        } else if (p <= staticThreshold) {
          // FASE 2: Estático (visible completamente)
          bestBodybuilderRef.current.style.opacity = '1';
          bestBodybuilderRef.current.style.transform = 'scale(1) translateX(0)';
        } else {
          // FASE 3: Salida lateral hacia la izquierda
          const exitProgress = (p - staticThreshold) / (1 - staticThreshold); // 0 → 1
          const vw = window.innerWidth;
          const translateX = -vw * exitProgress; // De 0 a -100vw (sale por la izquierda)
          const opacity = 1 - exitProgress; // De 1 a 0 (fade out mientras sale)
          
          bestBodybuilderRef.current.style.opacity = String(opacity);
          bestBodybuilderRef.current.style.transform = `scale(1) translateX(${translateX}px)`;
        }
      },
      onLeave: () => {
        // Ocultar completamente cuando sale
        if (bestBodybuilderRef.current) {
          const vw = window.innerWidth;
          bestBodybuilderRef.current.style.opacity = '0';
          bestBodybuilderRef.current.style.transform = `scale(1) translateX(${-vw}px)`;
        }
      },
      onLeaveBack: () => {
        // Volver al estado inicial cuando vuelve atrás
        if (bestBodybuilderRef.current) {
          bestBodybuilderRef.current.style.opacity = '0';
          bestBodybuilderRef.current.style.transform = 'scale(0.3) translateX(0)';
        }
      }
    });

    currentScrollPx += BEST_BODYBUILDER_TOTAL_PX;

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
    
    // Guardar el punto donde termina el primer video (para configurar su scrubbing)
    const video1EndPx = currentScrollPx;
    
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
      onEnter: () => {
        // Forzar al primer video/canvas a mostrar su último frame
        if (useCanvas && framesCount) {
          // Si estamos usando canvas, cargar el último frame
          const lastFrame = framesCount;
          currentFrameRef.current = lastFrame;
          loadFrame(lastFrame).then((img) => drawToCanvas(img)).catch(() => {});
        } else if (videoRef.current) {
          // Si estamos usando video, ir al final
          try {
            videoRef.current.currentTime = videoRef.current.duration - 0.001;
          } catch (_) {}
        }
      },
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

    // ============ FUNCIONES CANVAS 3 (challenge) ============

    const drawToCanvas3 = (img: HTMLImageElement) => {
      const canvas = canvas3Ref.current;
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

    const frameStepMobile3 = 6; // salto agresivo en móvil
    const effectiveFrameStep3 = isMobile ? frameStepMobile3 : 1;
    const effectiveFrames3Count = frames3Count ? Math.floor(((frames3Count - 1) / effectiveFrameStep3)) + 1 : undefined;

    const loadFrame3 = (index: number) => new Promise<HTMLImageElement>((resolve, reject) => {
      if (!frames3Pattern || !frames3Count) return reject('no-pattern');
      const cached = imageCache3Ref.current.get(index);
      if (cached) return resolve(cached);
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      // Índice lógico → número de frame real (saltando en móvil)
      const base = typeof frames3Start === 'number' ? frames3Start : 86400;
      const frameNumber = base + ((index - 1) * effectiveFrameStep3);
      const padded = String(frameNumber).padStart(8, '0');
      // Usamos pattern con {index} que se sustituye por el número con padding de 8 dígitos
      img.src = isMobile
        ? frames3Pattern.replace('{index}', padded).replace('/challenge-frames/', '/challenge-frames/mobile-webp/')
        : frames3Pattern.replace('{index}', padded);
      img.onload = () => { imageCache3Ref.current.set(index, img); resolve(img); };
      img.onerror = (e) => reject(e);
    });

    const preloadAround3 = (center: number) => {
      if (!frames3Count) return;
      const radius = 8;
      for (let i = Math.max(1, center - radius); i <= Math.min(frames3Count, center + radius); i++) {
        if (!imageCache3Ref.current.has(i)) {
          loadFrame3(i).catch(() => {});
        }
      }
    };

    const tryEnableCanvas3 = async () => {
      if (!frames3Pattern || !frames3Count) return false;
      try {
        const first = await loadFrame3(1);
        drawToCanvas3(first);
        preloadAround3(1);
        setUseCanvas3(true);
        return true;
      } catch {
        setUseCanvas3(false);
        return false;
      }
    };

    // ============ SCRUBBING DEL TERCER VIDEO ==========
    const VIDEO3_SCRUB_PX = isMobile ? 3500 : 4500;
    const video3StartPx = currentScrollPx; // comienza tras el segundo

    const setupCanvas3Scrub = () => {
      if (!useCanvas3 || !frames3Count) return;
      const onUpdate = (self: ScrollTrigger) => {
        const total3 = effectiveFrames3Count ?? frames3Count;
        const idx = Math.max(1, Math.min(total3!, Math.round(self.progress * (total3! - 1)) + 1));
        if (idx === currentFrame3Ref.current) return;
        currentFrame3Ref.current = idx;
        if (drawing3Ref.current) return;
        drawing3Ref.current = true;
        loadFrame3(idx)
          .then((img) => {
            drawToCanvas3(img);
            preloadAround3(idx);
            drawing3Ref.current = false;
          })
          .catch(() => { drawing3Ref.current = false; });
      };

      ScrollTrigger.create({
        trigger: scrollEl as Element,
        start: `+=${video3StartPx} top`,
        end: `+=${VIDEO3_SCRUB_PX}`,
        scrub: 0.1,
        onEnter: () => {
          // Forzar primer frame exacto al entrar en el rango
          currentFrame3Ref.current = 1;
          loadFrame3(1).then((img) => drawToCanvas3(img)).catch(() => {});
        },
        onEnterBack: () => {
          currentFrame3Ref.current = 1;
          loadFrame3(1).then((img) => drawToCanvas3(img)).catch(() => {});
        },
        onUpdate,
      });
    };

    (async () => {
      const enabled3 = await tryEnableCanvas3();
      if (enabled3) {
        setupCanvas3Scrub();
      }
    })();

    // Transición PUSH: video3 entra por la derecha y empuja video2 hacia la izquierda
    const VIDEO3_PUSH_PX = isMobile ? 600 : 800;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${video3StartPx} top`,
      end: `+=${VIDEO3_PUSH_PX}`,
      scrub: true,
      onEnter: () => {
        // Al iniciar el push, garantizar que se vea el PRIMER frame
        currentFrame3Ref.current = 1;
        if (canvas3Ref.current) gsap.set(canvas3Ref.current, { visibility: 'visible' });
        if (video3OverlayRef.current) gsap.set(video3OverlayRef.current, { visibility: 'visible' });
        loadFrame3(1).then((img) => drawToCanvas3(img)).catch(() => {});
      },
      onEnterBack: () => {
        currentFrame3Ref.current = 1;
        if (canvas3Ref.current) gsap.set(canvas3Ref.current, { visibility: 'visible' });
        if (video3OverlayRef.current) gsap.set(video3OverlayRef.current, { visibility: 'visible' });
        loadFrame3(1).then((img) => drawToCanvas3(img)).catch(() => {});
      },
      onUpdate: (self) => {
        const vw = window.innerWidth;
        // canvas2 sale a la izquierda
        if (canvas2Ref.current) gsap.set(canvas2Ref.current, { x: -vw * self.progress });
        if (video2Ref.current) gsap.set(video2Ref.current, { x: -vw * self.progress });
        if (video2OverlayRef.current) gsap.set(video2OverlayRef.current, { x: -vw * self.progress });
        // canvas3 entra desde la derecha
        if (canvas3Ref.current) gsap.set(canvas3Ref.current, { x: vw * (1 - self.progress), visibility: 'visible' });
        if (video3OverlayRef.current) gsap.set(video3OverlayRef.current, { x: vw * (1 - self.progress), visibility: 'visible' });
      },
      onLeaveBack: () => {
        if (canvas2Ref.current) gsap.set(canvas2Ref.current, { x: 0 });
        if (video2Ref.current) gsap.set(video2Ref.current, { x: 0 });
        if (video2OverlayRef.current) gsap.set(video2OverlayRef.current, { x: 0 });
        if (canvas3Ref.current) gsap.set(canvas3Ref.current, { x: '100vw', visibility: 'hidden' });
        if (video3OverlayRef.current) gsap.set(video3OverlayRef.current, { x: '100vw', visibility: 'hidden' });
      }
    });

    currentScrollPx += VIDEO3_PUSH_PX + VIDEO3_SCRUB_PX;

    // ============ FUNCIONES CANVAS 4 (final) ============

    const drawToCanvas4 = (img: HTMLImageElement) => {
      const canvas = canvas4Ref.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      const cw = (canvas.width = window.innerWidth);
      const ch = (canvas.height = window.innerHeight);
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const sw = iw * scale;
      const sh = ih * scale;
      const sx = (cw - sw) / 2;
      const sy = (ch - sh) / 2;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, 0, 0, iw, ih, sx, sy, sw, sh);
    };

    const frameStepMobile4 = 6; // salto agresivo en móvil
    const effectiveFrameStep4 = isMobile ? frameStepMobile4 : 1;
    const effectiveFrames4Count = frames4Count ? Math.floor(((frames4Count - 1) / effectiveFrameStep4)) + 1 : undefined;

    const loadFrame4 = (index: number) => new Promise<HTMLImageElement>((resolve, reject) => {
      if (!frames4Pattern || !frames4Count) return reject('no-pattern');
      const cached = imageCache4Ref.current.get(index);
      if (cached) return resolve(cached);
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      // Índice lógico → número de frame real (saltando en móvil)
      const base = typeof frames4Start === 'number' ? frames4Start : 86400;
      const frameNumber = base + ((index - 1) * effectiveFrameStep4);
      const padded = String(frameNumber).padStart(8, '0');
      // Usamos pattern con {index} que se sustituye por el número con padding de 8 dígitos
      img.src = isMobile
        ? frames4Pattern.replace('{index}', padded).replace('/final-frames/', '/final-frames/mobile-webp/')
        : frames4Pattern.replace('{index}', padded);
      img.onload = () => { imageCache4Ref.current.set(index, img); resolve(img); };
      img.onerror = (e) => reject(e);
    });

    const preloadAround4 = (center: number) => {
      if (!frames4Count) return;
      const radius = 8;
      for (let i = Math.max(1, center - radius); i <= Math.min(frames4Count, center + radius); i++) {
        if (!imageCache4Ref.current.has(i)) {
          loadFrame4(i).catch(() => {});
        }
      }
    };

    const tryEnableCanvas4 = async () => {
      if (!frames4Pattern || !frames4Count) return false;
      try {
        const first = await loadFrame4(1);
        drawToCanvas4(first);
        preloadAround4(1);
        setUseCanvas4(true);
        return true;
      } catch {
        setUseCanvas4(false);
        return false;
      }
    };

    // ============ SCRUBBING DEL CUARTO VIDEO ==========
    const VIDEO4_SCRUB_PX = isMobile ? 3500 : 4500;
    const video4StartPx = currentScrollPx; // comienza tras el tercero

    const setupCanvas4Scrub = () => {
      if (!useCanvas4 || !frames4Count) return;
      const onUpdate = (self: ScrollTrigger) => {
        const total4 = effectiveFrames4Count ?? frames4Count;
        const idx = Math.max(1, Math.min(total4!, Math.round(self.progress * (total4! - 1)) + 1));
        if (idx === currentFrame4Ref.current) return;
        currentFrame4Ref.current = idx;
        if (drawing4Ref.current) return;
        drawing4Ref.current = true;
        loadFrame4(idx)
          .then((img) => {
            drawToCanvas4(img);
            preloadAround4(idx);
            drawing4Ref.current = false;
          })
          .catch(() => { drawing4Ref.current = false; });
      };

      ScrollTrigger.create({
        trigger: scrollEl as Element,
        start: `+=${video4StartPx} top`,
        end: `+=${VIDEO4_SCRUB_PX}`,
        scrub: 0.1,
        onEnter: () => {
          // Forzar primer frame exacto al entrar en el rango
          currentFrame4Ref.current = 1;
          loadFrame4(1).then((img) => drawToCanvas4(img)).catch(() => {});
        },
        onEnterBack: () => {
          currentFrame4Ref.current = 1;
          loadFrame4(1).then((img) => drawToCanvas4(img)).catch(() => {});
        },
        onUpdate,
      });
    };

    (async () => {
      const enabled4 = await tryEnableCanvas4();
      if (enabled4) {
        setupCanvas4Scrub();
      }
    })();

    // Transición PUSH: video4 entra por la IZQUIERDA y empuja video3 hacia la DERECHA
    const VIDEO4_PUSH_PX = isMobile ? 600 : 800;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${video4StartPx} top`,
      end: `+=${VIDEO4_PUSH_PX}`,
      scrub: true,
      onEnter: () => {
        // Al iniciar el push, garantizar que se vea el PRIMER frame
        currentFrame4Ref.current = 1;
        if (canvas4Ref.current) gsap.set(canvas4Ref.current, { visibility: 'visible' });
        if (video4OverlayRef.current) gsap.set(video4OverlayRef.current, { visibility: 'visible' });
        loadFrame4(1).then((img) => drawToCanvas4(img)).catch(() => {});
      },
      onEnterBack: () => {
        currentFrame4Ref.current = 1;
        if (canvas4Ref.current) gsap.set(canvas4Ref.current, { visibility: 'visible' });
        if (video4OverlayRef.current) gsap.set(video4OverlayRef.current, { visibility: 'visible' });
        loadFrame4(1).then((img) => drawToCanvas4(img)).catch(() => {});
      },
      onUpdate: (self) => {
        const vw = window.innerWidth;
        // canvas3 sale a la DERECHA
        if (canvas3Ref.current) gsap.set(canvas3Ref.current, { x: vw * self.progress });
        if (video3OverlayRef.current) gsap.set(video3OverlayRef.current, { x: vw * self.progress });
        // canvas4 entra desde la IZQUIERDA
        if (canvas4Ref.current) gsap.set(canvas4Ref.current, { x: -vw * (1 - self.progress), visibility: 'visible' });
        if (video4OverlayRef.current) gsap.set(video4OverlayRef.current, { x: -vw * (1 - self.progress), visibility: 'visible' });
      },
      onLeaveBack: () => {
        if (canvas3Ref.current) gsap.set(canvas3Ref.current, { x: 0 });
        if (video3OverlayRef.current) gsap.set(video3OverlayRef.current, { x: 0 });
        if (canvas4Ref.current) gsap.set(canvas4Ref.current, { x: '-100vw', visibility: 'hidden' });
        if (video4OverlayRef.current) gsap.set(video4OverlayRef.current, { x: '-100vw', visibility: 'hidden' });
      }
    });

    currentScrollPx += VIDEO4_PUSH_PX + VIDEO4_SCRUB_PX;

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
        end: `+=${video1EndPx}`, // Termina justo antes de la transición al segundo video
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
            end: `+=${video1EndPx}`, // Termina justo antes de la transición al segundo video
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
    <div ref={containerRef} className="fixed inset-0 z-40 flex h-screen w-full items-center justify-center bg-black text-white overflow-hidden transition-[padding] duration-300 ease-out" style={{ backgroundColor: '#000' }}>
      {/* Fondo de respaldo para evitar flash blanco inicial */}
      <div
        className="absolute inset-0 -z-50 bg-black"
        style={{ backgroundColor: '#000' }}
      />
      
      {/* Poster de respaldo oculto */}
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

      {/* Canvas flipbook para tercer video (challenge) */}
      {(frames3Pattern && frames3Count) && (
        <canvas ref={canvas3Ref} className="absolute inset-0 -z-18 w-full h-full" style={{ display: useCanvas3 ? 'block' : 'none' }} />
      )}
      {/* Overlay sutil para el tercer video */}
      <div ref={video3OverlayRef} className="absolute inset-0 -z-17 bg-black/40" style={{ display: useCanvas3 ? 'block' : 'none' }} />

      {/* Canvas flipbook para cuarto video (final) */}
      {(frames4Pattern && frames4Count) && (
        <canvas ref={canvas4Ref} className="absolute inset-0 -z-16 w-full h-full" style={{ display: useCanvas4 ? 'block' : 'none' }} />
      )}
      {/* Overlay sutil para el cuarto video */}
      <div ref={video4OverlayRef} className="absolute inset-0 -z-15 bg-black/40" style={{ display: useCanvas4 ? 'block' : 'none' }} />

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

      {/* Tercera cita centrada (Paternidad) - aparece con zoom in desde el centro */}
      <div ref={quote3Ref} className="fixed inset-0 z-[63] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden' }}>
        <div className="pointer-events-none relative mx-4 md:mx-0 w-full max-w-3xl will-change-transform">
          <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[6px] bg-[linear-gradient(135deg,rgba(229,9,20,0.6),rgba(255,255,255,0.08),rgba(229,9,20,0.6))]" />
          <div className="relative rounded-3xl border border-white/10 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.6)] px-6 py-8 md:px-12 md:py-12 text-center">
            <div className="absolute top-0 left-0 h-1.5 w-28 md:w-40 bg-red-600 rounded-tr-3xl rounded-tl-3xl" />
            <div className="pointer-events-none absolute -top-6 -left-4 text-8xl md:text-9xl font-black text-white/5 select-none" aria-hidden="true">"</div>
            <p ref={quote3TextRef} className="text-xl md:text-3xl leading-relaxed text-gray-100 font-semibold will-change-transform">
              «»
            </p>
            <span className="mt-4 block text-sm md:text-base tracking-widest uppercase text-gray-400">— Bernat Scorus</span>
          </div>
        </div>
      </div>

      {/* Nuevo párrafo "Durante este periodo" - aparece desde el centro con efecto de escritura */}
      <div ref={fatherParaRef} className="fixed inset-0 z-[64] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden' }}>
        <div className="pointer-events-none relative mx-4 md:mx-0 w-full max-w-2xl">
          <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[6px] bg-[linear-gradient(135deg,rgba(229,9,20,0.6),rgba(255,255,255,0.08),rgba(229,9,20,0.6))]" />
          <div className="relative rounded-3xl border border-white/10 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.6)] px-6 py-8 md:px-12 md:py-12">
            <div className="absolute top-0 left-0 h-1.5 w-28 md:w-40 bg-red-600 rounded-tr-3xl rounded-tl-3xl" />
            <p ref={fatherParaTextRef} className="text-base md:text-lg leading-relaxed text-gray-100 will-change-transform"></p>
          </div>
        </div>
      </div>

      {/* Frase del hijo - Zoom out desde el centro */}
      <div ref={sonChallengeRef} className="fixed inset-0 z-[65] flex items-center justify-center pointer-events-none" style={{ visibility: 'hidden' }}>
        <div className="relative max-w-5xl px-4">
          {/* Glow rojo sutil de fondo */}
          <div className="pointer-events-none absolute -inset-24 -z-10 blur-[80px] bg-red-600/20" />
          
          {/* Texto blanco con palabras clave en rojo sólido */}
          <h2
            ref={sonChallengeTextRef}
            className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase will-change-transform text-white tracking-wide"
            style={{ lineHeight: '1.5' }}
          />
        </div>
      </div>

      {/* Párrafo tras la frase del hijo - entra desde abajo */}
      <div ref={sonParaRef} className="fixed inset-0 z-[65] flex items-center justify-center pointer-events-none" style={{ visibility: 'hidden' }}>
        <div className="pointer-events-none relative mx-4 md:mx-0 w-full max-w-3xl">
          <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[6px] bg-[linear-gradient(135deg,rgba(229,9,20,0.6),rgba(255,255,255,0.08),rgba(229,9,20,0.6))]" />
          <div className="relative rounded-3xl border border-white/10 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.6)] px-6 py-8 md:px-12 md:py-12">
            <div className="absolute top-0 left-0 h-1.5 w-28 md:w-40 bg-red-600 rounded-tr-3xl rounded-tl-3xl" />
            <p ref={sonParaTextRef} className="text-base md:text-lg leading-relaxed text-gray-100 will-change-transform"></p>
          </div>
        </div>
      </div>

      {/* Imagen competición - entra desde abajo empujando */}
      <div ref={compImageRef} className="fixed inset-0 z-[66] flex items-center justify-center pointer-events-none" style={{ visibility: 'hidden' }}>
        <div className="pointer-events-none relative w-full max-w-md md:max-w-lg px-6 md:px-0">
          {/* Glow rojo y marco glass */}
          <div className="absolute -inset-1 rounded-3xl opacity-60 blur-sm bg-[linear-gradient(135deg,rgba(229,9,20,0.5),rgba(255,255,255,0.08),rgba(229,9,20,0.5))]" />
          <div className="relative rounded-3xl border border-white/15 bg-black/40 backdrop-blur-md overflow-hidden">
            <div className="absolute top-0 left-0 h-1.5 w-24 md:w-36 bg-red-600 rounded-tr-3xl rounded-tl-3xl" />
            <img src="/images/about/biography/bernat-competicion-18-683x1024.webp" alt="Bernat competición" className="w-full h-auto object-contain" />
          </div>
        </div>
      </div>

      {/* Fondo con líneas diagonales para Gym Title - Posiciones orgánicas, irregulares, más centradas */}
      <div ref={gymLinesRef} className="fixed inset-0 z-[66] pointer-events-none overflow-hidden" style={{ opacity: 1 }}>
        {/* Línea 1: Muy adelantada, arriba-izquierda → abajo-derecha */}
        <div className="absolute" style={{ 
          left: '25%', 
          top: '20%',
          transform: 'translate(calc(var(--translate-1, 0) * 1.3vw), calc(var(--translate-1, 0) * 1.3vh))' 
        }}>
          <div className="absolute h-[160px] w-[10px] bg-gradient-to-b from-red-500 via-red-600 to-transparent rotate-[135deg] origin-top shadow-[0_0_32px_rgba(239,68,68,1)]" />
          <div className="absolute h-[380px] w-[2px] bg-gradient-to-b from-gray-500 to-transparent rotate-[135deg] origin-top" style={{ left: '4px', top: '160px' }} />
        </div>

        {/* Línea 2: Más centrada, arriba → abajo-derecha */}
        <div className="absolute" style={{ 
          left: '42%', 
          top: '15%',
          transform: 'translate(calc(var(--translate-2, 0) * 1.1vw), calc(var(--translate-2, 0) * 1.1vh))' 
        }}>
          <div className="absolute h-[95px] w-[6px] bg-gradient-to-b from-pink-500 via-red-500 to-transparent rotate-[135deg] origin-top shadow-[0_0_20px_rgba(236,72,153,0.8)]" />
          <div className="absolute h-[240px] w-[2px] bg-gradient-to-b from-gray-600 to-transparent rotate-[135deg] origin-top" style={{ left: '2px', top: '95px' }} />
        </div>

        {/* Línea 3: Cerca del borde, arriba-izquierda → abajo-derecha */}
        <div className="absolute" style={{ 
          left: '15%', 
          top: '28%',
          transform: 'translate(calc(var(--translate-3, 0) * 1.2vw), calc(var(--translate-3, 0) * 1.2vh))' 
        }}>
          <div className="absolute h-[135px] w-[8px] bg-gradient-to-b from-red-600 via-red-500 to-transparent rotate-[135deg] origin-top shadow-[0_0_26px_rgba(220,38,38,0.9)]" />
          <div className="absolute h-[330px] w-[2px] bg-gradient-to-b from-gray-550 to-transparent rotate-[135deg] origin-top" style={{ left: '3px', top: '135px' }} />
        </div>

        {/* Línea 4: Más atrasada, centro-izquierda → abajo-derecha */}
        <div className="absolute" style={{ 
          left: '33%', 
          top: '38%',
          transform: 'translate(calc(var(--translate-4, 0) * 1vw), calc(var(--translate-4, 0) * 1vh))' 
        }}>
          <div className="absolute h-[100px] w-[7px] bg-gradient-to-b from-pink-600 via-red-500 to-transparent rotate-[135deg] origin-top shadow-[0_0_18px_rgba(236,72,153,0.75)]" />
          <div className="absolute h-[250px] w-[2px] bg-gradient-to-b from-gray-600 to-transparent rotate-[135deg] origin-top" style={{ left: '2.5px', top: '100px' }} />
        </div>

        {/* Línea 5: Adelantada, abajo-derecha → arriba-izquierda */}
        <div className="absolute" style={{ 
          right: '28%', 
          bottom: '22%',
          transform: 'translate(calc(var(--translate-5, 0) * -1.3vw), calc(var(--translate-5, 0) * -1.3vh))' 
        }}>
          <div className="absolute h-[155px] w-[9px] bg-gradient-to-b from-red-600 via-red-700 to-transparent rotate-[135deg] origin-top shadow-[0_0_30px_rgba(220,38,38,0.95)]" />
          <div className="absolute h-[370px] w-[2px] bg-gradient-to-b from-gray-550 to-transparent rotate-[135deg] origin-top" style={{ left: '3.5px', top: '155px' }} />
        </div>

        {/* Línea 6: Más centrada, abajo → arriba-izquierda */}
        <div className="absolute" style={{ 
          right: '45%', 
          bottom: '18%',
          transform: 'translate(calc(var(--translate-6, 0) * -1.1vw), calc(var(--translate-6, 0) * -1.1vh))' 
        }}>
          <div className="absolute h-[90px] w-[6px] bg-gradient-to-b from-red-500 via-pink-600 to-transparent rotate-[135deg] origin-top shadow-[0_0_19px_rgba(239,68,68,0.8)]" />
          <div className="absolute h-[230px] w-[2px] bg-gradient-to-b from-gray-600 to-transparent rotate-[135deg] origin-top" style={{ left: '2px', top: '90px' }} />
        </div>

        {/* Línea 7: Cerca del borde, abajo-derecha → arriba-izquierda */}
        <div className="absolute" style={{ 
          right: '16%', 
          bottom: '30%',
          transform: 'translate(calc(var(--translate-7, 0) * -1.2vw), calc(var(--translate-7, 0) * -1.2vh))' 
        }}>
          <div className="absolute h-[140px] w-[8px] bg-gradient-to-b from-red-500 via-pink-600 to-transparent rotate-[135deg] origin-top shadow-[0_0_24px_rgba(239,68,68,0.85)]" />
          <div className="absolute h-[340px] w-[2px] bg-gradient-to-b from-gray-600 to-transparent rotate-[135deg] origin-top" style={{ left: '3px', top: '140px' }} />
        </div>
      </div>

      {/* H2 Scorus GYM con estética solicitada */}
      <div ref={gymTitleRef} className="fixed inset-0 z-[67] flex items-center justify-center pointer-events-none" style={{ visibility: 'hidden' }}>
        <div className="relative mx-4 md:mx-10">
          {/* Barra roja a la izquierda */}
          <div ref={gymBarRef} className="absolute -left-4 top-0 h-full w-1.5 bg-red-600 rounded-full" style={{ opacity: 0 }} />
          {/* Subtítulo pequeño */}
          <div ref={gymSubtitleRef} className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-white/80 mb-1" style={{ opacity: 0 }}>Scorus GYM</div>
          {/* Título con outline rojo en primera palabra y blanco en resto */}
          <h2 ref={gymTitleTextRef} className="text-left text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight will-change-transform">
            <span className="text-transparent [text-shadow:0_0_0_rgba(0,0,0,0)] [webkit-text-stroke:2px_rgb(220,38,38)] mr-2">Títulos</span>
            <span className="text-white">y Logros Internacionales</span>
          </h2>
        </div>
      </div>

      {/* Párrafo introductorio con zoom out */}
      <div ref={gymIntroParaRef} className="fixed inset-0 z-[68] flex items-center justify-center pointer-events-none will-change-transform" style={{ opacity: 0, transform: 'scale(1.5)' }}>
        <div className="pointer-events-none relative mx-4 md:mx-0 w-full max-w-2xl">
          <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[6px] bg-[linear-gradient(135deg,rgba(229,9,20,0.6),rgba(255,255,255,0.08),rgba(229,9,20,0.6))]" />
          <div className="relative rounded-3xl border border-white/10 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.6)] px-6 py-8 md:px-12 md:py-12">
            <div className="absolute top-0 left-0 h-1.5 w-28 md:w-40 bg-red-600 rounded-tr-3xl rounded-tl-3xl" />
            <p className="text-base md:text-lg leading-relaxed text-gray-100">
              A partir del año 2000, Bernat comenzó a competir profesionalmente, logrando en poco tiempo consolidarse entre los mejores atletas del culturismo. Su esfuerzo y dedicación lo llevaron a obtener algunos de los títulos más prestigiosos del mundo:
            </p>
          </div>
        </div>
      </div>

      {/* NABBA World Champion 2006 - Aparece con zoom in */}
      <div ref={nabbaChampRef} className="fixed inset-0 z-[69] flex items-center justify-center pointer-events-none will-change-transform" style={{ opacity: 0, transform: 'scale(2)' }}>
        <div className="pointer-events-none relative mx-4 md:mx-0 w-full max-w-3xl">
          {/* Glow exterior */}
          <div className="absolute -inset-1 rounded-3xl opacity-70 blur-[8px] bg-[linear-gradient(135deg,rgba(229,9,20,0.7),rgba(218,165,32,0.3),rgba(229,9,20,0.7))]" />
          
          {/* Contenedor principal con glassmorphism */}
          <div className="relative rounded-3xl border-2 border-white/20 bg-gradient-to-br from-black/80 via-black/75 to-black/80 backdrop-blur-xl shadow-[0_40px_120px_rgba(0,0,0,0.8)] px-8 py-12 md:px-16 md:py-16">
            {/* Barra decorativa superior */}
            <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-t-3xl" />
            
            {/* Decoración de esquinas */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-red-600/50 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-red-600/50 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-red-600/50 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-red-600/50 rounded-br-lg" />
            
            {/* Contenido */}
            <div className="text-center space-y-6 md:space-y-8">
              {/* Título del campeonato */}
              <div className="space-y-3">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-none">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-500 drop-shadow-[0_2px_10px_rgba(229,9,20,0.5)]">
                    Campeón del Mundo
                  </span>
                  <span className="block mt-2 text-white/95 text-4xl md:text-6xl lg:text-7xl drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                    NABBA 2006
                  </span>
                </h2>
                
                {/* Categorías */}
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-4">
                  <span className="px-4 py-2 md:px-6 md:py-2.5 text-xs md:text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-red-700 rounded-full shadow-[0_4px_20px_rgba(229,9,20,0.4)]">
                    Peso Pesado
                  </span>
                  <span className="text-red-500 text-xl md:text-2xl font-black">+</span>
                  <span className="px-4 py-2 md:px-6 md:py-2.5 text-xs md:text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-red-700 rounded-full shadow-[0_4px_20px_rgba(229,9,20,0.4)]">
                    Absoluto
                  </span>
                </div>
              </div>
              
              {/* Línea divisoria */}
              <div className="w-32 md:w-48 h-0.5 mx-auto bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60" />
              
              {/* Logo NABBA */}
              <div className="flex justify-center">
                <div className="relative">
                  {/* Glow del logo */}
                  <div className="absolute inset-0 blur-xl opacity-40 bg-gradient-to-b from-red-600 to-transparent" />
                  
                  {/* Logo */}
                  <img 
                    src="/images/about/biography/campeon-NABBA.webp" 
                    alt="NABBA Logo" 
                    className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                  />
                </div>
              </div>
              
              {/* Subtítulo inferior */}
              <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-gray-400/80">
                National Amateur Bodybuilders Association
              </p>
            </div>
            
            {/* Barra decorativa inferior */}
            <div className="absolute bottom-0 left-0 h-2 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-b-3xl" />
          </div>
        </div>
      </div>

      {/* NAC Mister Universo 2009 - Aparece con zoom in */}
      <div ref={mrUniversoRef} className="fixed inset-0 z-[69] flex items-center justify-center pointer-events-none will-change-transform" style={{ opacity: 0, transform: 'scale(2)' }}>
        <div className="pointer-events-none relative mx-4 md:mx-0 w-full max-w-3xl">
          {/* Glow exterior con tonos plateados para Mr. Universo */}
          <div className="absolute -inset-1 rounded-3xl opacity-70 blur-[8px] bg-[linear-gradient(135deg,rgba(229,9,20,0.7),rgba(192,192,192,0.4),rgba(229,9,20,0.7))]" />
          
          {/* Contenedor principal con glassmorphism */}
          <div className="relative rounded-3xl border-2 border-white/20 bg-gradient-to-br from-black/80 via-black/75 to-black/80 backdrop-blur-xl shadow-[0_40px_120px_rgba(0,0,0,0.8)] px-8 py-12 md:px-16 md:py-16">
            {/* Barra decorativa superior */}
            <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-t-3xl" />
            
            {/* Decoración de esquinas */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-red-600/50 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-red-600/50 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-red-600/50 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-red-600/50 rounded-br-lg" />
            
            {/* Contenido */}
            <div className="text-center space-y-6 md:space-y-8">
              {/* Título del campeonato */}
              <div className="space-y-3">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-none">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-500 drop-shadow-[0_2px_10px_rgba(229,9,20,0.5)]">
                    Subcampeón
                  </span>
                  <span className="block mt-2 text-white/95 text-3xl md:text-5xl lg:text-6xl drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                    NAC Mister Universo
                  </span>
                  <span className="block mt-1 text-white/95 text-4xl md:text-6xl lg:text-7xl drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                    2009
                  </span>
                </h2>
                
                {/* Badge de posición */}
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-4">
                  <span className="px-6 py-2.5 md:px-8 md:py-3 text-sm md:text-base font-bold uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-red-700 rounded-full shadow-[0_4px_20px_rgba(229,9,20,0.4)]">
                    2º Lugar Mundial
                  </span>
                </div>
              </div>
              
              {/* Línea divisoria */}
              <div className="w-32 md:w-48 h-0.5 mx-auto bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60" />
              
              {/* Logo Mr. Universo */}
              <div className="flex justify-center">
                <div className="relative">
                  {/* Glow del logo con tono plateado */}
                  <div className="absolute inset-0 blur-xl opacity-40 bg-gradient-to-b from-gray-300 to-transparent" />
                  
                  {/* Logo */}
                  <img 
                    src="/images/about/biography/mr universo.webp" 
                    alt="NAC Mister Universo Logo" 
                    className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                  />
                </div>
              </div>
              
              {/* Subtítulo inferior */}
              <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-gray-400/80">
                National Athletic Committee
              </p>
            </div>
            
            {/* Barra decorativa inferior */}
            <div className="absolute bottom-0 left-0 h-2 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-b-3xl" />
          </div>
        </div>
      </div>

      {/* Arnold Classic - Aparece con zoom in */}
      <div ref={arnoldClassicRef} className="fixed inset-0 z-[69] flex items-center justify-center pointer-events-none will-change-transform" style={{ opacity: 0, transform: 'scale(2)' }}>
        <div className="pointer-events-none relative mx-4 md:mx-0 w-full max-w-4xl">
          {/* Glow exterior con tonos dorados/bronce para Arnold Classic */}
          <div className="absolute -inset-1 rounded-3xl opacity-70 blur-[8px] bg-[linear-gradient(135deg,rgba(229,9,20,0.7),rgba(218,165,32,0.5),rgba(229,9,20,0.7))]" />
          
          {/* Contenedor principal con glassmorphism */}
          <div className="relative rounded-3xl border-2 border-white/20 bg-gradient-to-br from-black/80 via-black/75 to-black/80 backdrop-blur-xl shadow-[0_40px_120px_rgba(0,0,0,0.8)] px-8 py-12 md:px-16 md:py-16">
            {/* Barra decorativa superior */}
            <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-t-3xl" />
            
            {/* Decoración de esquinas */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-red-600/50 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-red-600/50 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-red-600/50 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-red-600/50 rounded-br-lg" />
            
            {/* Contenido */}
            <div className="text-center space-y-6 md:space-y-8">
              {/* Título del campeonato */}
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-tight">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-500 drop-shadow-[0_2px_10px_rgba(229,9,20,0.5)]">
                    Competidor en
                  </span>
                  <span className="block mt-2 text-white/95 text-4xl md:text-6xl lg:text-7xl drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                    Arnold Classic
                  </span>
                </h2>
                
                {/* Badges de localización */}
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-4">
                  <span className="px-4 py-2 md:px-6 md:py-2.5 text-xs md:text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-red-700 rounded-full shadow-[0_4px_20px_rgba(229,9,20,0.4)]">
                    Columbus (EE.UU.)
                  </span>
                  <span className="text-red-500 text-xl md:text-2xl font-black">+</span>
                  <span className="px-4 py-2 md:px-6 md:py-2.5 text-xs md:text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-red-700 rounded-full shadow-[0_4px_20px_rgba(229,9,20,0.4)]">
                    Madrid
                  </span>
                </div>
              </div>
              
              {/* Línea divisoria */}
              <div className="w-32 md:w-48 h-0.5 mx-auto bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60" />
              
              {/* Logo Arnold Classic */}
              <div className="flex justify-center">
                <div className="relative">
                  {/* Glow del logo con tono dorado */}
                  <div className="absolute inset-0 blur-xl opacity-40 bg-gradient-to-b from-yellow-600 to-transparent" />
                  
                  {/* Logo */}
                  <img 
                    src="/images/about/biography/arnol classic.webp" 
                    alt="Arnold Classic Logo" 
                    className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                  />
                </div>
              </div>
              
              {/* Subtítulo inferior */}
              <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-gray-400/80">
                Competiciones Internacionales de Élite
              </p>
            </div>
            
            {/* Barra decorativa inferior */}
            <div className="absolute bottom-0 left-0 h-2 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-b-3xl" />
          </div>
        </div>
      </div>

      {/* Ben Weider Classic + Big Man Masters - Aparece con zoom in */}
      <div ref={benWeiderRef} className="fixed inset-0 z-[69] flex items-center justify-center pointer-events-none will-change-transform" style={{ opacity: 0, transform: 'scale(2)' }}>
        <div className="pointer-events-none relative mx-4 md:mx-0 w-full max-w-4xl">
          {/* Glow exterior con tonos dorados para medallas de oro */}
          <div className="absolute -inset-1 rounded-3xl opacity-70 blur-[8px] bg-[linear-gradient(135deg,rgba(229,9,20,0.7),rgba(255,215,0,0.5),rgba(229,9,20,0.7))]" />
          
          {/* Contenedor principal con glassmorphism */}
          <div className="relative rounded-3xl border-2 border-white/20 bg-gradient-to-br from-black/80 via-black/75 to-black/80 backdrop-blur-xl shadow-[0_40px_120px_rgba(0,0,0,0.8)] px-8 py-12 md:px-16 md:py-16">
            {/* Barra decorativa superior */}
            <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-t-3xl" />
            
            {/* Decoración de esquinas */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-red-600/50 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-red-600/50 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-red-600/50 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-red-600/50 rounded-br-lg" />
            
            {/* Contenido */}
            <div className="text-center space-y-6 md:space-y-8">
              {/* Título del campeonato */}
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-tight">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 drop-shadow-[0_2px_10px_rgba(255,215,0,0.5)]">
                    Medallas de Oro en
                  </span>
                </h2>
                
                {/* Badges de competiciones */}
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-4">
                  <span className="px-4 py-2 md:px-6 md:py-2.5 text-xs md:text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-red-700 rounded-full shadow-[0_4px_20px_rgba(229,9,20,0.4)]">
                    Ben Weider Classic
                  </span>
                  <span className="text-red-500 text-xl md:text-2xl font-black">+</span>
                  <span className="px-4 py-2 md:px-6 md:py-2.5 text-xs md:text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-red-700 rounded-full shadow-[0_4px_20px_rgba(229,9,20,0.4)]">
                    Big Man Masters
                  </span>
                </div>
                
                {/* Badge de categoría Masters */}
                <div className="flex justify-center mt-2">
                  <span className="px-5 py-2 text-xs md:text-sm font-bold uppercase tracking-wider text-yellow-500 border-2 border-yellow-500/50 rounded-full shadow-[0_4px_20px_rgba(255,215,0,0.3)]">
                    +40 Años (Masters)
                  </span>
                </div>
              </div>
              
              {/* Línea divisoria */}
              <div className="w-32 md:w-48 h-0.5 mx-auto bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60" />
              
              {/* Logo Ben Weider */}
              <div className="flex justify-center">
                <div className="relative">
                  {/* Glow del logo con tono dorado */}
                  <div className="absolute inset-0 blur-xl opacity-50 bg-gradient-to-b from-yellow-500 to-transparent" />
                  
                  {/* Logo */}
                  <img 
                    src="/images/about/biography/benweider.webp" 
                    alt="Ben Weider Classic Logo" 
                    className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                  />
                </div>
              </div>
              
              {/* Subtítulo inferior */}
              <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-gray-400/80">
                Categoría Masters - Campeonatos Internacionales
              </p>
            </div>
            
            {/* Barra decorativa inferior */}
            <div className="absolute bottom-0 left-0 h-2 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-b-3xl" />
          </div>
        </div>
      </div>

      {/* Párrafo sobre familia y regreso 2018 - Aparece con zoom in */}
      <div ref={familyParaRef} className="fixed inset-0 z-[68] flex items-center justify-center pointer-events-none will-change-transform" style={{ opacity: 0, transform: 'scale(2)' }}>
        <div className="pointer-events-none relative mx-4 md:mx-0 w-full max-w-3xl">
          <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[6px] bg-[linear-gradient(135deg,rgba(229,9,20,0.6),rgba(255,255,255,0.08),rgba(229,9,20,0.6))]" />
          <div className="relative rounded-3xl border border-white/10 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.6)] px-6 py-8 md:px-12 md:py-12">
            <div className="absolute top-0 left-0 h-1.5 w-28 md:w-40 bg-red-600 rounded-tr-3xl rounded-tl-3xl" />
            <p className="text-base md:text-lg leading-relaxed text-gray-100">
              En 2012, decidió dar un parón en su carrera para formar una familia. Pero su pasión por el deporte nunca desapareció. En 2018, tras una pausa de seis años, regresó a la competición con más fuerza que nunca, consiguiendo varias medallas y consolidando su trayectoria como uno de los culturistas más destacados de Europa.
            </p>
          </div>
        </div>
      </div>

      {/* H2 "El Regreso Triunfal" - Aparece fragmentándose */}
      <div ref={triumphTitleRef} className="fixed inset-0 z-[67] flex items-center justify-center pointer-events-none" style={{ opacity: 0 }}>
        <div className="container max-w-6xl px-4 md:px-8 will-change-transform">
          <div className="relative mx-auto max-w-fit">
            {/* Glow de fondo radial rojo */}
            <div className="pointer-events-none absolute -inset-20 -z-10 blur-3xl bg-[radial-gradient(ellipse_at_center,rgba(229,9,20,0.3),transparent_70%)]" />
            
            {/* Barra decorativa izquierda */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 h-32 w-1.5 bg-red-600 rounded-full" />
            
            {/* Título con fragmentación */}
            <h2
              ref={triumphTitleTextRef}
              className="text-center text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-tight will-change-transform text-white"
            />
            
            {/* Barra decorativa derecha */}
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 h-32 w-1.5 bg-red-600 rounded-full" />
          </div>
        </div>
      </div>

      {/* Frase de motivación renovada - Entrada épica - ESTILO PLANO */}
      <div ref={motivationPhraseRef} className="fixed inset-0 z-[66] flex items-center justify-center pointer-events-none will-change-transform" style={{ opacity: 0, transform: 'scale(0.5) rotate(10deg)' }}>
        <div className="pointer-events-none relative mx-4 md:mx-0 w-full max-w-5xl">
          {/* Contenedor principal con estilo plano y limpio */}
          <div className="relative rounded-2xl border-2 border-red-600 bg-black backdrop-blur-xl px-10 py-14 md:px-20 md:py-20">
            {/* Barra superior roja plana */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-red-600 rounded-t-2xl" />
            
            {/* Decoración de esquinas minimalistas */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-white/30" />
            <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-white/30" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-white/30" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-white/30" />
            
            {/* Contenido de la frase */}
            <div className="relative text-center space-y-6">
              {/* Frase principal con juego tipográfico */}
              <p className="leading-tight">
                <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-white/90">
                  Con la motivación renovada,
                </span>
                <span className="block mt-4 text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-red-600">
                  Bernat regresó a la competición en 2018,
                </span>
                <span className="block mt-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-white/90">
                  y lo hizo
                </span>
                <span className="block mt-2 text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black uppercase text-white">
                  por la puerta grande:
                </span>
              </p>
              
              {/* Línea divisoria simple */}
              <div className="flex items-center justify-center gap-3 mt-8">
                <div className="w-24 h-0.5 bg-white/20" />
                <div className="w-2 h-2 bg-red-600" />
                <div className="w-24 h-0.5 bg-white/20" />
              </div>
            </div>
            
            {/* Barra inferior roja plana */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-red-600 rounded-b-2xl" />
          </div>
        </div>
      </div>

      {/* 🏅 Medalla de Oro - Primera temporada tras el regreso - ESTILO PLANO ÉPICO */}
      <div ref={goldMedalRef} className="fixed inset-0 z-[65] flex items-center justify-center pointer-events-none will-change-transform" style={{ opacity: 0, transform: 'scale(0.3)' }}>
        <div className="pointer-events-none relative mx-4 md:mx-0 w-full max-w-4xl">
          {/* Contenedor principal plano y épico */}
          <div className="relative rounded-3xl border-4 border-yellow-500 bg-black px-12 py-16 md:px-24 md:py-24">
            {/* Decoración superior con líneas geométricas */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="w-16 h-1 bg-yellow-500" />
              <div className="w-4 h-4 bg-yellow-500 rotate-45" />
              <div className="w-16 h-1 bg-yellow-500" />
            </div>
            
            {/* Esquinas decorativas geométricas */}
            <div className="absolute top-6 left-6 w-20 h-20 border-t-4 border-l-4 border-yellow-500/50" />
            <div className="absolute top-6 right-6 w-20 h-20 border-t-4 border-r-4 border-yellow-500/50" />
            <div className="absolute bottom-6 left-6 w-20 h-20 border-b-4 border-l-4 border-yellow-500/50" />
            <div className="absolute bottom-6 right-6 w-20 h-20 border-b-4 border-r-4 border-yellow-500/50" />
            
            {/* Contenido */}
            <div className="relative text-center space-y-8">
              {/* Emoji de medalla gigante */}
              <div className="text-8xl md:text-9xl">
                🏅
              </div>
              
              {/* Título principal con juego tipográfico extremo */}
              <div className="space-y-4">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-medium uppercase tracking-wide text-yellow-500">
                  Medalla de Oro
                </h3>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-white/80 leading-relaxed px-4">
                  en su primera temporada
                </p>
                <p className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black uppercase text-white leading-none mt-6">
                  tras el regreso
                </p>
              </div>
              
              {/* Año destacado */}
              <div className="inline-block px-8 py-3 border-2 border-yellow-500 rounded-lg">
                <span className="text-4xl md:text-5xl font-black text-yellow-500">2018</span>
              </div>
              
              {/* Líneas decorativas inferiores */}
              <div className="flex items-center justify-center gap-4 mt-10">
                <div className="w-2 h-2 bg-yellow-500" />
                <div className="w-32 h-0.5 bg-yellow-500/50" />
                <div className="w-2 h-2 bg-yellow-500" />
                <div className="w-32 h-0.5 bg-yellow-500/50" />
                <div className="w-2 h-2 bg-yellow-500" />
              </div>
            </div>
            
            {/* Decoración inferior con líneas geométricas */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex items-center gap-2">
              <div className="w-16 h-1 bg-yellow-500" />
              <div className="w-4 h-4 bg-yellow-500 rotate-45" />
              <div className="w-16 h-1 bg-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* 🥈 Dos medallas de Plata y una de Bronce - ESTILO PLANO ÉPICO */}
      <div ref={silverBronzeMedalsRef} className="fixed inset-0 z-[64] flex items-center justify-center pointer-events-none will-change-transform" style={{ opacity: 0, transform: 'scale(0.3)' }}>
        <div className="pointer-events-none relative mx-4 md:mx-0 w-full max-w-5xl">
          {/* Contenedor principal plano y épico */}
          <div className="relative rounded-3xl border-4 border-gray-400 bg-black px-12 py-16 md:px-24 md:py-24">
            {/* Decoración superior con líneas geométricas */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="w-16 h-1 bg-gray-400" />
              <div className="w-4 h-4 bg-gray-400 rotate-45" />
              <div className="w-16 h-1 bg-gray-400" />
            </div>
            
            {/* Esquinas decorativas geométricas */}
            <div className="absolute top-6 left-6 w-20 h-20 border-t-4 border-l-4 border-gray-400/50" />
            <div className="absolute top-6 right-6 w-20 h-20 border-t-4 border-r-4 border-gray-400/50" />
            <div className="absolute bottom-6 left-6 w-20 h-20 border-b-4 border-l-4 border-gray-400/50" />
            <div className="absolute bottom-6 right-6 w-20 h-20 border-b-4 border-r-4 border-gray-400/50" />
            
            {/* Contenido */}
            <div className="relative text-center space-y-8">
              {/* Emojis de medallas en línea */}
              <div className="flex items-center justify-center gap-4 text-6xl sm:text-7xl md:text-8xl">
                <span>🥈</span>
                <span>🥈</span>
                <span>🥉</span>
              </div>
              
              {/* Título principal con juego tipográfico extremo */}
              <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-light uppercase tracking-wide text-gray-400">
                  Múltiples Medallas
                </h3>
                <p className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black uppercase text-white leading-none">
                  Dos de Plata
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-white/70 leading-relaxed">
                  y
                </p>
                <p className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black uppercase text-white leading-none">
                  Una de Bronce
                </p>
              </div>
              
              {/* Competiciones en cajas */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                <div className="px-5 py-2 border-2 border-gray-400 rounded-lg">
                  <span className="text-base md:text-lg font-bold text-gray-400">Ben Weider</span>
                </div>
                <div className="px-5 py-2 border-2 border-gray-400 rounded-lg">
                  <span className="text-base md:text-lg font-bold text-gray-400">IFBB Miami</span>
                </div>
                <div className="px-5 py-2 border-2 border-gray-400 rounded-lg">
                  <span className="text-base md:text-lg font-bold text-gray-400">Big Man</span>
                </div>
              </div>
              
              {/* Líneas decorativas inferiores */}
              <div className="flex items-center justify-center gap-4 mt-10">
                <div className="w-2 h-2 bg-gray-400" />
                <div className="w-32 h-0.5 bg-gray-400/50" />
                <div className="w-2 h-2 bg-gray-400" />
                <div className="w-32 h-0.5 bg-gray-400/50" />
                <div className="w-2 h-2 bg-gray-400" />
              </div>
            </div>
            
            {/* Decoración inferior con líneas geométricas */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex items-center gap-2">
              <div className="w-16 h-1 bg-gray-400" />
              <div className="w-4 h-4 bg-gray-400 rotate-45" />
              <div className="w-16 h-1 bg-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 🥉 Tercer Mejor Culturista del Año - ESTILO PLANO ÉPICO */}
      <div ref={bestBodybuilderRef} className="fixed inset-0 z-[63] flex items-center justify-center pointer-events-none will-change-transform" style={{ opacity: 0, transform: 'scale(0.3)' }}>
        <div className="pointer-events-none relative mx-4 md:mx-0 w-full max-w-4xl">
          {/* Contenedor principal plano y épico con tonos bronce */}
          <div className="relative rounded-3xl border-4 border-amber-700 bg-black px-12 py-16 md:px-24 md:py-24">
            {/* Decoración superior con líneas geométricas */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="w-16 h-1 bg-amber-700" />
              <div className="w-4 h-4 bg-amber-700 rotate-45" />
              <div className="w-16 h-1 bg-amber-700" />
            </div>
            
            {/* Esquinas decorativas geométricas */}
            <div className="absolute top-6 left-6 w-20 h-20 border-t-4 border-l-4 border-amber-700/50" />
            <div className="absolute top-6 right-6 w-20 h-20 border-t-4 border-r-4 border-amber-700/50" />
            <div className="absolute bottom-6 left-6 w-20 h-20 border-b-4 border-l-4 border-amber-700/50" />
            <div className="absolute bottom-6 right-6 w-20 h-20 border-b-4 border-r-4 border-amber-700/50" />
            
            {/* Contenido */}
            <div className="relative text-center space-y-8">
              {/* Emoji de medalla de bronce gigante */}
              <div className="text-8xl md:text-9xl">
                🥉
              </div>
              
              {/* Título principal con juego tipográfico extremo */}
              <div className="space-y-4">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-medium uppercase tracking-wide text-amber-700">
                  Reconocimiento Oficial
                </h3>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-white/80 leading-relaxed px-4">
                  Nombrado
                </p>
                <p className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black uppercase text-white leading-none mt-6">
                  el Tercer Mejor
                </p>
                <p className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black uppercase text-white leading-none">
                  Culturista del Año
                </p>
              </div>
              
              {/* Badge de posición */}
              <div className="inline-block px-10 py-4 border-2 border-amber-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-5xl md:text-6xl font-black text-amber-700">3º</span>
                  <div className="h-12 w-0.5 bg-amber-700/30" />
                  <span className="text-xl md:text-2xl font-bold text-white/80 uppercase tracking-wider">Puesto</span>
                </div>
              </div>
              
              {/* Líneas decorativas inferiores */}
              <div className="flex items-center justify-center gap-4 mt-10">
                <div className="w-2 h-2 bg-amber-700" />
                <div className="w-32 h-0.5 bg-amber-700/50" />
                <div className="w-2 h-2 bg-amber-700" />
                <div className="w-32 h-0.5 bg-amber-700/50" />
                <div className="w-2 h-2 bg-amber-700" />
              </div>
            </div>
            
            {/* Decoración inferior con líneas geométricas */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex items-center gap-2">
              <div className="w-16 h-1 bg-amber-700" />
              <div className="w-4 h-4 bg-amber-700 rotate-45" />
              <div className="w-16 h-1 bg-amber-700" />
            </div>
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
