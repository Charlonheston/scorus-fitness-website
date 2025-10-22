import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

interface Props {
  backgrounds?: string[];
}

const sections = [
  {
    id: 'intro',
    subtitle: 'De la Superación Personal a la Excelencia en el Fitness',
    title: 'Bernat Scorus',
    text: 'Llevo más de 25 años ayudando a personas a transformar sus cuerpos y mejorar su rendimiento físico. Campeón del Mundo de Culturismo.',
    useFlip: true,
  },
  {
    id: 'infancia',
    subtitle: 'Infancia y Primeros Pasos en el Deporte',
    title: 'Los Orígenes',
    text: 'Nací el 6 de julio de 1979 en Marosvásárhely, Transilvania. Crecí rodeado de deportistas de élite. Desde los 6 años practiqué múltiples disciplinas.',
    useFlip: false,
  },
  {
    id: 'descubrimiento',
    subtitle: '1994 - El Punto de Inflexión',
    title: 'El Descubrimiento',
    text: 'Ver en directo a leyendas como Flex Wheeler, Milos Sarcev y Robby Robinson cambió mi vida. Supe que dedicaría mi vida al entrenamiento y desarrollo físico.',
    useFlip: true,
  },
  {
    id: 'competicion',
    subtitle: '2000 - 2006 | La Dedicación Extrema',
    title: 'La Competición',
    text: 'Durante más de una década viví por y para el culturismo. Competía, entrenaba, perfeccionaba mi técnica con atletas de élite. En 2006 me convertí en Campeón del Mundo NABBA.',
    useFlip: false,
  },
  {
    id: 'familia',
    subtitle: '2012 - Una Nueva Prioridad',
    title: 'La Familia',
    text: 'Decidí hacer un parón para priorizar lo más importante: mi familia. Aunque mi físico cambió, el fuego competitivo nunca se apagó. Mi espíritu de superación permanecía intacto.',
    useFlip: true,
  },
  {
    id: 'retorno',
    subtitle: '2018 - El Regreso Triunfal',
    title: 'Más Fuerte que Nunca',
    text: 'Mi hijo me desafió a volver a competir. Regresé después de 6 años con medalla de oro en mi primera temporada y siendo nombrado tercer mejor culturista del año.',
    useFlip: false,
  },
  {
    id: 'filosofia',
    subtitle: 'Mi Filosofía de Vida',
    title: 'Más Allá del Fitness',
    text: 'No se trata de levantar más peso. Se trata de construir una mejor versión de ti mismo. Mi enfoque es holístico: desarrollo físico y mentalidad sostenible.',
    useFlip: true,
  },
  {
    id: 'scorus',
    subtitle: 'Scorus Fitness - Transformación Integral',
    title: 'Tu Mejor Versión',
    text: 'Hoy lidero Scorus Fitness: entrenamiento personalizado, nutrición adaptada, programas premium y un gimnasio privado. Aquí encontrarás las herramientas y apoyo que necesitas.',
    useFlip: false,
  },
];

const exitEffects = [
  { x: -200, y: 0, rotation: 0 },
  { x: 200, y: 0, rotation: 0 },
  { x: 0, y: -200, rotation: 0 },
  { x: -150, y: -100, rotation: 0 },
  { x: 150, y: -100, rotation: 0 },
  { x: 0, y: -200, rotation: 0 },
  { x: 200, y: 100, rotation: 0 },
  { x: -200, y: 100, rotation: 0 },
];

const entryEffects = [
  { x: 200, y: 0, rotation: 0 },
  { x: -200, y: 0, rotation: 0 },
  { x: 0, y: 200, rotation: 0 },
  { x: 150, y: 100, rotation: 0 },
  { x: -150, y: 100, rotation: 0 },
  { x: 0, y: 200, rotation: 0 },
  { x: -200, y: -100, rotation: 0 },
  { x: 200, y: -100, rotation: 0 },
];

export default function ScrollytellingStories({ backgrounds }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const geoBoxRef = useRef<HTMLDivElement>(null);
  const geoLineRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [spacerHeight, setSpacerHeight] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const computedHeight = sections.length * window.innerHeight * 2.5;
    setSpacerHeight(computedHeight);

    const spacer = document.createElement('div');
    spacer.style.height = `${computedHeight}px`;
    spacer.style.position = 'absolute';
    spacer.style.top = '0';
    spacer.style.left = '0';
    spacer.style.width = '100%';
    spacer.style.pointerEvents = 'none';
    document.body.appendChild(spacer);

    const setContent = (idx: number) => {
      const s = sections[idx];
      if (subtitleRef.current) subtitleRef.current.textContent = s.subtitle;
      if (titleRef.current) titleRef.current.textContent = s.title;
      if (bodyRef.current) bodyRef.current.textContent = s.text;
      if (bgRef.current && backgrounds && backgrounds[idx]) {
        bgRef.current.style.backgroundImage = `url(${backgrounds[idx]})`;
      }
    };

    sections.forEach((section, idx) => {
      const sectionHeight = window.innerHeight * 2.5;
      const startScroll = idx * sectionHeight;
      const endScroll = (idx + 1) * sectionHeight;

      const exitEffect = exitEffects[idx % exitEffects.length];
      const entryEffect = entryEffects[idx % entryEffects.length];

      ScrollTrigger.create({
        trigger: spacer,
        start: `${startScroll}px top`,
        end: `${endScroll}px top`,
        onEnter: () => setContent(idx),
        onEnterBack: () => setContent(idx),
      });

      gsap.fromTo(
        subtitleRef.current,
        {
          opacity: 0,
          x: entryEffect.x * 0.4,
          y: entryEffect.y * 0.4,
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: spacer,
            start: `${startScroll}px top`,
            end: `${startScroll + sectionHeight * 0.2}px top`,
            scrub: 1,
          },
        }
      );

      if (section.useFlip) {
        gsap.fromTo(
          titleRef.current,
          {
            opacity: 0,
            rotationY: 90,
            scale: 0.9,
          },
          {
            opacity: 1,
            rotationY: 0,
            scale: 1,
            duration: 1.1,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: spacer,
              start: `${startScroll + sectionHeight * 0.08}px top`,
              end: `${startScroll + sectionHeight * 0.28}px top`,
              scrub: 1,
            },
          }
        );
      } else {
        gsap.fromTo(
          titleRef.current,
          {
            opacity: 0,
            x: entryEffect.x,
            y: entryEffect.y,
            scale: 0.9,
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: spacer,
              start: `${startScroll + sectionHeight * 0.08}px top`,
              end: `${startScroll + sectionHeight * 0.28}px top`,
              scrub: 1,
            },
          }
        );
      }

      gsap.fromTo(
        bodyRef.current,
        {
          opacity: 0,
          x: entryEffect.x * 0.6,
          y: entryEffect.y * 0.6,
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: spacer,
            start: `${startScroll + sectionHeight * 0.15}px top`,
            end: `${startScroll + sectionHeight * 0.35}px top`,
            scrub: 1,
          },
        }
      );

      gsap.to([subtitleRef.current, titleRef.current, bodyRef.current], {
        opacity: 1,
        duration: 0.1,
        scrollTrigger: {
          trigger: spacer,
          start: `${startScroll + sectionHeight * 0.35}px top`,
          end: `${endScroll - sectionHeight * 0.35}px top`,
          scrub: 1,
        },
      });

      gsap.fromTo(
        geoBoxRef.current,
        { opacity: 0, scale: 0.9, rotation: 0 },
        {
          opacity: 0.12,
          scale: 1,
          rotation: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: spacer,
            start: `${startScroll}px top`,
            end: `${startScroll + sectionHeight * 0.2}px top`,
            scrub: 1,
          },
        }
      );

      gsap.to(geoBoxRef.current, {
        opacity: 0,
        scale: 0.95,
        rotation: 0,
        duration: 1,
        ease: 'power2.in',
        scrollTrigger: {
          trigger: spacer,
          start: `${endScroll - sectionHeight * 0.2}px top`,
          end: `${endScroll}px top`,
          scrub: 1,
        },
      });

      gsap.fromTo(
        geoLineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: spacer,
            start: `${startScroll + sectionHeight * 0.1}px top`,
            end: `${startScroll + sectionHeight * 0.25}px top`,
            scrub: 1,
          },
        }
      );

      gsap.to(geoLineRef.current, {
        scaleX: 0,
        duration: 0.8,
        ease: 'power3.in',
        scrollTrigger: {
          trigger: spacer,
          start: `${endScroll - sectionHeight * 0.25}px top`,
          end: `${endScroll - sectionHeight * 0.1}px top`,
          scrub: 1,
        },
      });

      gsap.to(subtitleRef.current, {
        opacity: 0,
        x: exitEffect.x * 0.4,
        y: -40 + exitEffect.y * 0.3,
        duration: 0.9,
        ease: 'power3.in',
        scrollTrigger: {
          trigger: spacer,
          start: `${endScroll - sectionHeight * 0.35}px top`,
          end: `${endScroll - sectionHeight * 0.15}px top`,
          scrub: 1,
        },
      });

      gsap.to(titleRef.current, {
        opacity: 0,
        x: exitEffect.x * 0.6,
        y: -80 + exitEffect.y * 0.4,
        rotationY: section.useFlip ? -90 : 0,
        scale: section.useFlip ? 0.95 : 0.95,
        duration: 1.1,
        ease: 'power3.in',
        scrollTrigger: {
          trigger: spacer,
          start: `${endScroll - sectionHeight * 0.3}px top`,
          end: `${endScroll - sectionHeight * 0.1}px top`,
          scrub: 1,
        },
      });

      gsap.to(bodyRef.current, {
        opacity: 0,
        x: exitEffect.x * 0.6,
        y: -50 + exitEffect.y * 0.2,
        duration: 1,
        ease: 'power3.in',
        scrollTrigger: {
          trigger: spacer,
          start: `${endScroll - sectionHeight * 0.25}px top`,
          end: `${endScroll}px top`,
          scrub: 1,
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      document.body.removeChild(spacer);
    };
  }, [backgrounds]);

  return (
    <>
      <div
        ref={containerRef}
        className="fixed inset-0 w-full h-screen bg-black text-white flex items-center justify-center z-40 overflow-hidden perspective"
        style={{ perspective: '1000px' }}
      >
        {/* Fondo por sección */}
        <div
          ref={bgRef}
          className="absolute inset-0 -z-20 bg-center bg-cover"
          style={{ backgroundImage: 'none', filter: 'brightness(0.65)' }}
        />

        {/* Elementos geométricos */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            ref={geoBoxRef}
            className="absolute top-20 right-20 w-40 h-40 border-4 border-red-600/30 opacity-0"
            style={{ transformStyle: 'preserve-3d' }}
          />
          <div
            ref={geoLineRef}
            className="absolute bottom-40 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent origin-left"
            style={{ transform: 'scaleX(0)' }}
          />
          <div className="absolute top-1/4 left-10 w-1 h-64 bg-gradient-to-b from-red-600 to-transparent opacity-20" />
          <div className="absolute bottom-1/4 right-10 w-2 h-48 bg-gradient-to-t from-red-600 to-transparent opacity-15" />
        </div>

        {/* Contenido */}
        <div className="container px-4 md:px-8 relative z-10 max-w-3xl text-center">
          <div className="space-y-6">
            <p
              ref={subtitleRef}
              className="text-xs md:text-sm font-semibold uppercase tracking-widest text-red-500"
            >
              {sections[0].subtitle}
            </p>

            <h2
              ref={titleRef}
              className="text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-tight tracking-tighter"
              style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden', willChange: 'transform, opacity' }}
            >
              {sections[0].title}
            </h2>

            <p
              ref={bodyRef}
              className="text-base md:text-lg leading-relaxed text-gray-200 max-w-2xl mx-auto"
            >
              {sections[0].text}
            </p>
          </div>
        </div>

        <div
          className="absolute inset-0 -z-10"
          style={{ background: `linear-gradient(135deg, rgba(127, 0, 0, 0.05) 0%, transparent 100%)` }}
        />
      </div>

      <div style={{ height: spacerHeight ? `${spacerHeight}px` : '100vh' }} />
    </>
  );
}
