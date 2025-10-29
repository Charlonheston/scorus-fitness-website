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
  // Opcional: permitir proporcionar frames del quinto video (legacy)
  frames5Pattern?: string;
  frames5Count?: number;
  frames5Start?: number;  // Número base del primer frame (p.ej. 86400)
  // Opcional: permitir proporcionar frames del sexto video (epilogue)
  frames6Pattern?: string;
  frames6Count?: number;
  frames6Start?: number;  // Número base del primer frame (p.ej. 86400)
  lang?: 'es' | 'en' | 'fr'; // Idioma para las traducciones
}

export default function BioIntro({ videoMp4, videoWebm, poster = '/images/hero/bernat-hero.webp', framesPattern, framesCount, frames2Pattern, frames2Count, frames3Pattern, frames3Count, frames3Start, frames4Pattern, frames4Count, frames4Start, frames5Pattern, frames5Count, frames5Start, frames6Pattern, frames6Count, frames6Start, lang = 'es' }: Props) {
  
  // ===== SISTEMA DE TRADUCCIONES =====
  const translations = {
    es: {
      // Intro
      introName: 'Bernat Scorus',
      introSubtitle: 'De la Superación Personal a la Excelencia en el Fitness',
      introBody: 'Mi nombre es Bernat Richard Scorus y llevo más de 25 años ayudando a personas a transformar sus cuerpos y mejorar su rendimiento físico. Desde muy joven supe que el culturismo y el fitness eran mi verdadera pasión, y a lo largo de mi carrera he logrado convertirme en Campeón del Mundo de Culturismo, Subcampeón de Mister Universo y Subcampeón de Mr. Olympia Masters Amateur.',
      
      // Citas
      quote1: '«El éxito no es un accidente. Es trabajo duro, perseverancia, aprendizaje, sacrificio y, sobre todo, amor por lo que haces.»',
      quote2: 'El cuerpo logra lo que la mente cree.',
      quote3: 'Ser padre me enseñó que el mayor desafío no siempre está en el gimnasio, sino en ser el mejor ejemplo para mis hijos.',
      
      // Tabs
      tabProgresionLabel: 'Progresión',
      tabWorkoutLabel: 'Workout',
      tabNutricionLabel: 'Nutrición',
      tabProgresion: 'Desde mis inicios en el culturismo, supe que la clave del éxito es la disciplina y el esfuerzo constante. Con una metodología basada en la experiencia y el aprendizaje, mi misión es ayudarte a conseguir resultados reales.',
      tabWorkout: 'Con una carrera marcada por la superación y el rendimiento, mis programas están diseñados para que alcances tu máximo potencial con un enfoque personalizado y estructurado.',
      tabNutricion: 'El fitness es mucho más que levantar pesas. La alimentación es la base de una transformación duradera y en Scorus Fitness ofrecemos planes nutricionales adaptados a cada persona.',
      
      // Título "Infancia y primeros pasos"
      titleChildhood: 'El Sacrificio Infancia y Primeros Pasos en el Deporte',
      
      // Párrafos largos
      nextBodyText: 'Bernat nació el 6 de julio de 1979 en Marosvásárhely, Transilvania, pero desde muy pequeño se trasladó con su familia a Budapest, Hungría, donde pasó la mayor parte de su infancia. Su entorno familiar estaba lleno de deportistas de élite: su abuelo y sus tíos fueron campeones en diversas disciplinas, por lo que el deporte siempre estuvo presente en su vida. Desde los 6 años, practicó diversas actividades físicas como natación, gimnasia, karate, fútbol, baloncesto y atletismo, pero ninguno de estos deportes despertó en él una verdadera vocación. Sin embargo, su atracción por los cuerpos musculosos y bien desarrollados crecía con cada película de acción que veía. Arnold Schwarzenegger, Sylvester Stallone y Jean-Claude Van Damme eran sus ídolos, y soñaba con construir un físico impresionante como el de ellos.',
      
      paragraphsText: 'Desde los 6 años, practicó diversas actividades físicas como natación, gimnasia, karate, fútbol, baloncesto y atletismo, pero ninguno de estos deportes despertó en él una verdadera vocación. Sin embargo, su atracción por los cuerpos musculosos y bien desarrollados crecía con cada película de acción que veía. Arnold Schwarzenegger, Sylvester Stallone y Jean-Claude Van Damme eran sus ídolos, y soñaba con construir un físico impresionante como el de ellos.\n\nEl punto de inflexión llegó en 1994, cuando asistió a su primer evento de culturismo. Ver en directo a leyendas como Flex Wheeler, Milos Sarcev y Robby Robinson lo impactó profundamente. En ese momento, supo que quería dedicar su vida al entrenamiento y al desarrollo físico.\n\nSin embargo, había un problema: su genética no parecía la ideal para este deporte. Con solo 50 kg de peso, un diámetro de brazo de 28 cm y un pecho de 80 cm, su familia y amigos le decían que no tenía la estructura necesaria para el culturismo. Pero él no se dejó desanimar. Su determinación y su visión estaban claras: iba a demostrar que el esfuerzo y la constancia podían superar cualquier obstáculo.',
      
      experienceParagraph: 'Con más de 25 años de experiencia, Bernat Scorus ha construido una trayectoria en el mundo del culturismo y el fitness que pocos pueden igualar. Ha convertido su pasión en una filosofía de vida, ayudando a miles de personas a alcanzar su mejor versión a través del entrenamiento y la nutrición personalizada.\n\nActualmente, lidera Scorus Fitness, un centro que ofrece entrenamiento personal en Alicante, programas de coaching online y transformación física integral. Su enfoque se basa en la experiencia real, el conocimiento adquirido en años de competición y el compromiso con sus clientes.',
      
      newH2Title: 'Entrenador Personal en Alicante y Campeón del Mundo de Culturismo',
      
      fatherParagraph: 'Durante este periodo, Bernat apenas tuvo tiempo para entrenar como lo hacía antes. La rutina de ser padre a tiempo completo lo absorbió completamente, y aunque nunca dejó el fitness por completo, su físico y mentalidad cambiaron. Pero en el fondo, su espíritu competitivo seguía vivo.',
      
      sonChallenge: '¿Por qué no compites otra vez, papá? ¡Compite!',
      sonParagraph: 'Estas palabras resonaron en su mente como un desafío personal. Era el empujón que necesitaba para volver a los escenarios y demostrar que aún tenía mucho que ofrecer.',
      
      // Título Gimnasio
      gymSubtitle: 'Scorus GYM',
      gymTitle: 'Títulos y Logros Internacionales',
      gymIntroParagraph: 'A partir del año 2000, Bernat comenzó a competir profesionalmente, logrando en poco tiempo consolidarse entre los mejores atletas del culturismo. Su esfuerzo y dedicación lo llevaron a obtener algunos de los títulos más prestigiosos del mundo:',
      
      // Títulos y logros
      nabbaTitle: 'NABBA 2006',
      nabbaSubtitle: 'Campeón del Mundo',
      nabbaCategory: 'Categoría Peso Pesado',
      nabbaCategorySubtitle: 'y Absoluto',
      nabbaDescription: 'Un hito histórico en la carrera de Bernat, consolidándose como uno de los mejores culturistas del mundo.',
      
      mrUniverseTitle: 'NAC Mister Universo',
      mrUniverseSubtitle: 'Subcampeón',
      mrUniverseCategory: 'Categoría +90kg',
      mrUniverseDescription: 'Una competición de élite internacional donde Bernat demostró su nivel excepcional, quedando entre los mejores del mundo.',
      
      arnoldClassicTitle: 'Arnold Classic',
      arnoldClassicSubtitle: 'Competidor Internacional',
      arnoldClassicDetail: 'Columbus (EE.UU.) y Madrid',
      arnoldClassicDescription: 'Participación en una de las competiciones más prestigiosas del culturismo mundial, fundada por Arnold Schwarzenegger.',
      
      benWeiderTitle: 'Ben Weider Classic',
      benWeiderSubtitle: 'Medallas de Oro',
      benWeiderCategory: 'y Big Man Masters',
      benWeiderDetail: 'Oro en competiciones de élite Masters, demostrando su excelencia y experiencia en categorías veteranas del culturismo.',
      
      experienceYears: '25+',
      experienceLabel: 'Años de Experiencia',
      experienceSince: 'Desde el año 2000',
      
      trophiesCount: '40+',
      trophiesLabel: 'Trofeos Internacionales',
      
      // El Regreso Triunfal
      triumphTitle: 'El Regreso Triunfal: Más Fuerte que Nunca',
      triumphParagraph: 'Con la motivación renovada, Bernat regresó a la competición en 2018, y lo hizo por la puerta grande:',
      
      goldMedalTitle: 'MEDALLA DE ORO',
      goldMedalSubtitle: 'El Regreso',
      goldMedalSeason: 'Primera temporada tras el regreso',
      goldMedalDescription: 'Un regreso triunfal que marcó el inicio de una nueva era de éxitos en la carrera de Bernat.',
      
      silverBronzeTitle: '2 PLATA + 1 BRONCE',
      silverBronzeSubtitle: 'Más podios en 2018',
      silverBronzeMedals: 'Dos medallas de',
      silverBronzeSilver: 'Plata',
      silverBronzeAnd: 'y una de',
      silverBronzeBronze: 'Bronce',
      silverBronzeDetail: 'Un año excepcional con múltiples podios que consolidaron su regreso al culturismo de élite.',
      
      bestBodybuilderTitle: '3º MEJOR CULTURISTA',
      bestBodybuilderSubtitle: 'Reconocimiento Internacional',
      bestBodybuilderNamed: 'Nombrado el',
      bestBodybuilderThird: 'Tercer',
      bestBodybuilderBest: 'Mejor Culturista del Año',
      bestBodybuilderDetail: 'Un reconocimiento internacional que posicionó a Bernat entre los mejores culturistas del mundo.',
      
      newMeaningParagraph: 'Pero esta vez, la competición tenía un nuevo significado para él. No solo se trataba de ganar, sino de mostrar que la constancia, la disciplina y la determinación pueden superar cualquier obstáculo, incluso una pausa de seis años.',
      
      indiaParagraph: 'Ese mismo año, fue invitado a la India para formar parte de una academia de entrenadores personales, donde impartió cursos sobre nutrición, suplementación, entrenamiento y preparación para competiciones. Esta oportunidad le abrió nuevas puertas y le permitió expandir su conocimiento a nivel internacional, impartiendo seminarios en Dubái, Singapur y diversas ciudades de la India.',
      
      // Filosofía
      philosophyTitle: 'Mi Filosofía: Más Allá del Fitness',
      philosophyWord1: 'Mi',
      philosophyWord2: 'Filosofía:',
      philosophyWord3: 'Más',
      philosophyWord4: 'Allá',
      philosophyWord5: 'del',
      philosophyWord6: 'Fitness',
      
      sacrificeCompetitionTitle: 'El Sacrificio de la Competición',
      sacrificeCompetitionParagraph: 'Durante más de una década, Bernat vivió por y para el culturismo. Competía, entrenaba, perfeccionaba su técnica y compartía experiencias con algunos de los atletas más importantes del mundo. Pero, como todo en la vida, llegó un momento en el que sintió que necesitaba dar un paso atrás para centrarse en otro aspecto esencial: su familia.\n\nEn 2012, tras muchos años de competición al más alto nivel, decidió alejarse de los escenarios y dedicar su tiempo a construir un futuro junto a su pareja. Dos años después, en 2014, nació su primer hijo, y en 2016, llegó su hija. Fueron años en los que el culturismo pasó a un segundo plano, pues la prioridad absoluta era criar y cuidar de su familia.\n\nDurante más de una década, Bernat vivió por y para el culturismo. Competía, entrenaba, perfeccionaba su técnica y compartía experiencias con algunos de los atletas más importantes del mundo. Pero, como todo en la vida, llegó un momento en el que sintió que necesitaba dar un paso atrás para centrarse en otro aspecto esencial: su familia.\n\nEn 2012, tras muchos años de competición al más alto nivel, decidió alejarse de los escenarios y dedicar su tiempo a construir un futuro junto a su pareja. Dos años después, en 2014, nació su primer hijo, y en 2016, llegó su hija. Fueron años en los que el culturismo pasó a un segundo plano, pues la prioridad absoluta era criar y cuidar de su familia.',
      
      scorusFitnessParagraph: 'Tras su exitosa carrera en el culturismo, Bernat fundó Scorus Fitness, un centro de entrenamiento diseñado para ofrecer:',
      
      // Módulos de servicios
      trainingModuleTitle: 'Entrenamiento',
      trainingModuleDescription: 'Planes de entrenamiento<br/>personalizados',
      nutritionModuleTitle: 'Nutrición',
      nutritionModuleDescription: 'Nutrición enfocada en el<br/>rendimiento y la salud',
      trackingModuleTitle: 'Seguimiento',
      trackingModuleDescription: 'Acompañamiento real para<br/>lograr cambios duraderos',
      rebornModuleTitle: 'REBORN y Scorus<br/>Campus',
      rebornModuleDescription: 'Programas premium de<br/>transformación',
      scorusGymModuleTitle: 'ScorusGYM',
      scorusGymModuleDescription: 'Un gimnasio privado con un<br/>enfoque exclusivo y sin distracciones',
      holisticParagraph: 'Su enfoque es holístico, abarcando tanto el desarrollo físico como la mentalidad necesaria para mantener un estilo de vida saludable y sostenible.',
      
      // CTA Final
      ctaTitle: 'Transforma tu Vida',
      ctaSubtitle: 'con Scorus Fitness',
      ctaDescription: 'Si buscas un cambio real, estoy aquí para guiarte. Ya sea que quieras perder grasa, ganar músculo o prepararte para una competición, en Scorus Fitness encontrarás las herramientas y el apoyo que necesitas.',
      ctaText: 'Empieza hoy. Contacta conmigo y transforma tu cuerpo y tu mente.',
      ctaButton: '¡Contáctame Ahora!',
      contactUrl: '/es/contacto',
    },
    en: {
      // Intro
      introName: 'Bernat Scorus',
      introSubtitle: 'From Personal Growth to Excellence in Fitness',
      introBody: 'My name is Bernat Richard Scorus and I have been helping people transform their bodies and improve their physical performance for over 25 years. From a very young age I knew that bodybuilding and fitness were my true passion, and throughout my career I have become World Bodybuilding Champion, Mr. Universe Runner-up and Mr. Olympia Masters Amateur Runner-up.',
      
      // Quotes
      quote1: '«Success is not an accident. It is hard work, perseverance, learning, sacrifice and, above all, love for what you do.»',
      quote2: 'The body achieves what the mind believes.',
      quote3: 'Being a father taught me that the greatest challenge is not always in the gym, but in being the best example for my children.',
      
      // Tabs
      tabProgresionLabel: 'Progress',
      tabWorkoutLabel: 'Workout',
      tabNutricionLabel: 'Nutrition',
      tabProgresion: 'Since my beginnings in bodybuilding, I knew that the key to success is discipline and constant effort. With a methodology based on experience and learning, my mission is to help you achieve real results.',
      tabWorkout: 'With a career marked by overcoming and performance, my programs are designed for you to reach your maximum potential with a personalized and structured approach.',
      tabNutricion: 'Fitness is much more than lifting weights. Nutrition is the foundation of a lasting transformation and at Scorus Fitness we offer nutritional plans adapted to each person.',
      
      // Title "Childhood and first steps"
      titleChildhood: 'The Sacrifice Childhood and First Steps in Sport',
      
      // Long paragraphs
      nextBodyText: 'Bernat was born on July 6, 1979 in Marosvásárhely, Transylvania, but from a very young age he moved with his family to Budapest, Hungary, where he spent most of his childhood. His family environment was full of elite athletes: his grandfather and uncles were champions in various disciplines, so sport was always present in his life. From the age of 6, he practiced various physical activities such as swimming, gymnastics, karate, football, basketball and athletics, but none of these sports awakened a true vocation in him. However, his attraction to muscular and well-developed bodies grew with every action movie he watched. Arnold Schwarzenegger, Sylvester Stallone and Jean-Claude Van Damme were his idols, and he dreamed of building an impressive physique like theirs.',
      
      paragraphsText: 'From the age of 6, he practiced various physical activities such as swimming, gymnastics, karate, football, basketball and athletics, but none of these sports awakened a true vocation in him. However, his attraction to muscular and well-developed bodies grew with every action movie he watched. Arnold Schwarzenegger, Sylvester Stallone and Jean-Claude Van Damme were his idols, and he dreamed of building an impressive physique like theirs.\n\nThe turning point came in 1994, when he attended his first bodybuilding event. Seeing legends like Flex Wheeler, Milos Sarcev and Robby Robinson live had a profound impact on him. At that moment, he knew he wanted to dedicate his life to training and physical development.\n\nHowever, there was a problem: his genetics did not seem ideal for this sport. With only 50 kg of weight, an arm diameter of 28 cm and a chest of 80 cm, his family and friends told him that he did not have the necessary structure for bodybuilding. But he was not discouraged. His determination and vision were clear: he was going to prove that effort and perseverance could overcome any obstacle.',
      
      experienceParagraph: 'With more than 25 years of experience, Bernat Scorus has built a career in the world of bodybuilding and fitness that few can match. He has turned his passion into a life philosophy, helping thousands of people reach their best version through training and personalized nutrition.\n\nCurrently, he leads Scorus Fitness, a center that offers personal training in Alicante, online coaching programs and comprehensive physical transformation. His approach is based on real experience, knowledge acquired in years of competition and commitment to his clients.',
      
      newH2Title: 'Personal Trainer in Alicante and World Bodybuilding Champion',
      
      fatherParagraph: 'During this period, Bernat barely had time to train as he did before. The routine of being a full-time father absorbed him completely, and although he never completely left fitness, his physique and mentality changed. But deep down, his competitive spirit was still alive.',
      
      sonChallenge: 'Why don\'t you compete again, dad? Compete!',
      sonParagraph: 'These words resonated in his mind as a personal challenge. It was the push he needed to return to the stages and prove that he still had much to offer.',
      
      // Gym Title
      gymSubtitle: 'Scorus GYM',
      gymTitle: 'Titles and International Achievements',
      gymIntroParagraph: 'Starting in 2000, Bernat began competing professionally, quickly establishing himself among the best bodybuilding athletes. His effort and dedication led him to obtain some of the most prestigious titles in the world:',
      
      // Titles and achievements
      nabbaTitle: 'NABBA 2006',
      nabbaSubtitle: 'World Champion',
      nabbaCategory: 'Heavyweight Category',
      nabbaCategorySubtitle: 'and Overall',
      nabbaDescription: 'A historic milestone in Bernat\'s career, establishing himself as one of the best bodybuilders in the world.',
      
      mrUniverseTitle: 'NAC Mister Universe',
      mrUniverseSubtitle: 'Runner-up',
      mrUniverseCategory: 'Category +90kg',
      mrUniverseDescription: 'An international elite competition where Bernat demonstrated his exceptional level, ranking among the best in the world.',
      
      arnoldClassicTitle: 'Arnold Classic',
      arnoldClassicSubtitle: 'International Competitor',
      arnoldClassicDetail: 'Columbus (USA) and Madrid',
      arnoldClassicDescription: 'Participation in one of the most prestigious bodybuilding competitions in the world, founded by Arnold Schwarzenegger.',
      
      benWeiderTitle: 'Ben Weider Classic',
      benWeiderSubtitle: 'Gold Medals',
      benWeiderCategory: 'and Big Man Masters',
      benWeiderDetail: 'Gold in Masters elite competitions, demonstrating his excellence and experience in veteran bodybuilding categories.',
      
      experienceYears: '25+',
      experienceLabel: 'Years of Experience',
      experienceSince: 'Since year 2000',
      
      trophiesCount: '40+',
      trophiesLabel: 'International Trophies',
      
      // The Triumphant Return
      triumphTitle: 'The Triumphant Return: Stronger Than Ever',
      triumphParagraph: 'With renewed motivation, Bernat returned to competition in 2018, and he did so in grand style:',
      
      goldMedalTitle: 'GOLD MEDAL',
      goldMedalSubtitle: 'The Return',
      goldMedalSeason: 'First season after return',
      goldMedalDescription: 'A triumphant return that marked the beginning of a new era of success in Bernat\'s career.',
      
      silverBronzeTitle: '2 SILVER + 1 BRONZE',
      silverBronzeSubtitle: 'More podiums in 2018',
      silverBronzeMedals: 'Two',
      silverBronzeSilver: 'Silver',
      silverBronzeAnd: 'medals and one',
      silverBronzeBronze: 'Bronze',
      silverBronzeDetail: 'An exceptional year with multiple podiums that consolidated his return to elite bodybuilding.',
      
      bestBodybuilderTitle: '3RD BEST BODYBUILDER',
      bestBodybuilderSubtitle: 'International Recognition',
      bestBodybuilderNamed: 'Named the',
      bestBodybuilderThird: 'Third',
      bestBodybuilderBest: 'Best Bodybuilder of the Year',
      bestBodybuilderDetail: 'An international recognition that positioned Bernat among the best bodybuilders in the world.',
      
      newMeaningParagraph: 'But this time, the competition had a new meaning for him. It was not only about winning, but about showing that perseverance, discipline and determination can overcome any obstacle, even a six-year break.',
      
      indiaParagraph: 'That same year, he was invited to India to be part of a personal trainer academy, where he taught courses on nutrition, supplementation, training and competition preparation. This opportunity opened new doors for him and allowed him to expand his knowledge internationally, giving seminars in Dubai, Singapore and various cities in India.',
      
      // Philosophy
      philosophyTitle: 'My Philosophy: Beyond Fitness',
      philosophyWord1: 'My',
      philosophyWord2: 'Philosophy:',
      philosophyWord3: 'Beyond',
      philosophyWord4: 'Fitness',
      philosophyWord5: '',
      philosophyWord6: '',
      
      sacrificeCompetitionTitle: 'The Sacrifice of Competition',
      sacrificeCompetitionParagraph: 'For more than a decade, Bernat lived for and through bodybuilding. He competed, trained, perfected his technique, and shared experiences with some of the most important athletes in the world. But, as with everything in life, a moment came when he felt the need to step back to focus on another essential aspect: his family.\n\nIn 2012, after many years of competing at the highest level, he decided to step away from the stages and dedicate his time to building a future with his partner. Two years later, in 2014, his first son was born, and in 2016, his daughter arrived. Those were years when bodybuilding took a back seat, as the absolute priority was raising and caring for his family.\n\nFor more than a decade, Bernat lived for and through bodybuilding. He competed, trained, perfected his technique, and shared experiences with some of the most important athletes in the world. But, as with everything in life, a moment came when he felt the need to step back to focus on another essential aspect: his family.\n\nIn 2012, after many years of competing at the highest level, he decided to step away from the stages and dedicate his time to building a future with his partner. Two years later, in 2014, his first son was born, and in 2016, his daughter arrived. Those were years when bodybuilding took a back seat, as the absolute priority was raising and caring for his family.',
      
      scorusFitnessParagraph: 'After his successful career in bodybuilding, Bernat founded Scorus Fitness, a training center designed to offer:',
      
      // Service modules
      trainingModuleTitle: 'Training',
      trainingModuleDescription: 'Personalized training<br/>plans',
      nutritionModuleTitle: 'Nutrition',
      nutritionModuleDescription: 'Nutrition focused on<br/>performance and health',
      trackingModuleTitle: 'Tracking',
      trackingModuleDescription: 'Real support to<br/>achieve lasting changes',
      rebornModuleTitle: 'REBORN and Scorus<br/>Campus',
      rebornModuleDescription: 'Premium transformation<br/>programs',
      scorusGymModuleTitle: 'ScorusGYM',
      scorusGymModuleDescription: 'A private gym with an<br/>exclusive focus and no distractions',
      holisticParagraph: 'His approach is holistic, encompassing both physical development and the mindset necessary to maintain a healthy and sustainable lifestyle.',
      
      // Final CTA
      ctaTitle: 'Transform Your Life',
      ctaSubtitle: 'with Scorus Fitness',
      ctaDescription: 'If you are looking for a real change, I am here to guide you. Whether you want to lose fat, gain muscle or prepare for a competition, at Scorus Fitness you will find the tools and support you need.',
      ctaText: 'Start today. Contact me and transform your body and mind.',
      ctaButton: 'Contact Me Now!',
      contactUrl: '/en/contact',
    },
    fr: {
      // Intro
      introName: 'Bernat Scorus',
      introSubtitle: 'De la Progression Personnelle à l\'Excellence en Fitness',
      introBody: 'Je m\'appelle Bernat Richard Scorus et j\'aide les gens à transformer leur corps et à améliorer leurs performances physiques depuis plus de 25 ans. Dès mon plus jeune âge, j\'ai su que la musculation et le fitness étaient ma véritable passion, et tout au long de ma carrière, je suis devenu Champion du Monde de Culturisme, Vice-Champion de Mister Univers et Vice-Champion de Mr. Olympia Masters Amateur.',
      
      // Citas
      quote1: '«Le succès n\'est pas un accident. C\'est du travail acharné, de la persévérance, de l\'apprentissage, du sacrifice et, surtout, de l\'amour pour ce que vous faites.»',
      quote2: 'Le corps réalise ce que l\'esprit croit.',
      quote3: 'Être père m\'a appris que le plus grand défi n\'est pas toujours dans la salle de sport, mais dans le fait d\'être le meilleur exemple pour mes enfants.',
      
      // Tabs
      tabProgresionLabel: 'Progression',
      tabWorkoutLabel: 'Entraînement',
      tabNutricionLabel: 'Nutrition',
      tabProgresion: 'Depuis mes débuts dans la musculation, j\'ai su que la clé du succès est la discipline et l\'effort constant. Avec une méthodologie basée sur l\'expérience et l\'apprentissage, ma mission est de vous aider à obtenir de vrais résultats.',
      tabWorkout: 'Avec une carrière marquée par le dépassement de soi et la performance, mes programmes sont conçus pour que vous atteigniez votre plein potentiel avec une approche personnalisée et structurée.',
      tabNutricion: 'Le fitness est bien plus que soulever des poids. L\'alimentation est la base d\'une transformation durable et chez Scorus Fitness, nous proposons des plans nutritionnels adaptés à chaque personne.',
      
      // Título "Infancia y primeros pasos"
      titleChildhood: 'Le Sacrifice de l\'Enfance et les Premiers Pas dans le Sport',
      
      // Párrafos largos
      nextBodyText: 'Bernat est né le 6 juillet 1979 à Marosvásárhely, en Transylvanie, mais très jeune, il a déménagé avec sa famille à Budapest, en Hongrie, où il a passé la majeure partie de son enfance. Son environnement familial était rempli d\'athlètes de haut niveau : son grand-père et ses oncles étaient champions dans diverses disciplines, le sport a donc toujours été présent dans sa vie. Dès l\'âge de 6 ans, il a pratiqué diverses activités physiques telles que la natation, la gymnastique, le karaté, le football, le basketball et l\'athlétisme, mais aucun de ces sports n\'a éveillé en lui une véritable vocation. Cependant, son attirance pour les corps musclés et bien développés grandissait avec chaque film d\'action qu\'il regardait. Arnold Schwarzenegger, Sylvester Stallone et Jean-Claude Van Damme étaient ses idoles, et il rêvait de construire un physique impressionnant comme le leur.',
      
      paragraphsText: 'Dès l\'âge de 6 ans, il a pratiqué diverses activités physiques telles que la natation, la gymnastique, le karaté, le football, le basketball et l\'athlétisme, mais aucun de ces sports n\'a éveillé en lui une véritable vocation. Cependant, son attirance pour les corps musclés et bien développés grandissait avec chaque film d\'action qu\'il regardait. Arnold Schwarzenegger, Sylvester Stallone et Jean-Claude Van Damme étaient ses idoles, et il rêvait de construire un physique impressionnant comme le leur.\n\nLe point tournant est arrivé en 1994, lorsqu\'il a assisté à son premier événement de culturisme. Voir en direct des légendes comme Flex Wheeler, Milos Sarcev et Robby Robinson l\'a profondément marqué. À ce moment-là, il a su qu\'il voulait consacrer sa vie à l\'entraînement et au développement physique.\n\nCependant, il y avait un problème : sa génétique ne semblait pas idéale pour ce sport. Avec seulement 50 kg de poids, un diamètre de bras de 28 cm et une poitrine de 80 cm, sa famille et ses amis lui disaient qu\'il n\'avait pas la structure nécessaire pour la musculation. Mais il ne s\'est pas découragé. Sa détermination et sa vision étaient claires : il allait prouver que l\'effort et la constance pouvaient surmonter n\'importe quel obstacle.',
      
      experienceParagraph: 'Avec plus de 25 ans d\'expérience, Bernat Scorus a construit une carrière dans le monde de la musculation et du fitness que peu peuvent égaler. Il a transformé sa passion en une philosophie de vie, aidant des milliers de personnes à atteindre leur meilleure version grâce à l\'entraînement et à la nutrition personnalisée.\n\nActuellement, il dirige Scorus Fitness, un centre qui propose un entraînement personnel à Alicante, des programmes de coaching en ligne et une transformation physique intégrale. Son approche est basée sur une expérience réelle, les connaissances acquises au cours d\'années de compétition et l\'engagement envers ses clients.',
      
      newH2Title: 'Entraîneur Personnel à Alicante et Champion du Monde de Culturisme',
      newH2Word1: 'Entraîneur',
      newH2Word2: 'Personnel',
      newH2Word3: 'à',
      newH2Word4: 'Alicante',
      newH2Word5: 'et',
      newH2Word6: 'Champion',
      newH2Word7: 'du',
      newH2Word8: 'Monde',
      newH2Word9: 'de',
      newH2Word10: 'Culturisme',
      
      fatherParagraph: 'Pendant cette période, Bernat a à peine eu le temps de s\'entraîner comme il le faisait auparavant. La routine d\'être père à temps plein l\'a complètement absorbé, et bien qu\'il n\'ait jamais complètement abandonné le fitness, son physique et sa mentalité ont changé. Mais au fond, son esprit de compétition était toujours vivant.',
      
      sonChallenge: 'Pourquoi ne compètes-tu pas à nouveau, papa ? Compète !',
      sonParagraph: 'Ces mots ont résonné dans son esprit comme un défi personnel. C\'était le coup de pouce dont il avait besoin pour revenir sur les scènes et prouver qu\'il avait encore beaucoup à offrir.',
      
      // Título Gimnasio
      gymSubtitle: 'Scorus GYM',
      gymTitle: 'Titres et Réalisations Internationales',
      gymIntroParagraph: 'À partir de l\'an 2000, Bernat a commencé à concourir professionnellement, parvenant rapidement à se consolider parmi les meilleurs athlètes de la musculation. Son effort et son dévouement l\'ont conduit à obtenir certains des titres les plus prestigieux au monde :',
      
      // Títulos y logros
      nabbaTitle: 'NABBA 2006',
      nabbaSubtitle: 'Champion du Monde',
      nabbaCategory: 'Catégorie Poids Lourd',
      nabbaCategorySubtitle: 'et Absolu',
      nabbaDescription: 'Une étape historique dans la carrière de Bernat, se consolidant comme l\'un des meilleurs culturistes du monde.',
      
      mrUniverseTitle: 'NAC Mister Univers',
      mrUniverseSubtitle: 'Vice-Champion',
      mrUniverseCategory: 'Catégorie +90kg',
      mrUniverseDescription: 'Une compétition internationale d\'élite où Bernat a démontré son niveau exceptionnel, se classant parmi les meilleurs du monde.',
      
      arnoldClassicTitle: 'Arnold Classic',
      arnoldClassicSubtitle: 'Compétiteur International',
      arnoldClassicDetail: 'Columbus (États-Unis) et Madrid',
      arnoldClassicDescription: 'Participation à l\'une des compétitions de culturisme les plus prestigieuses au monde, fondée par Arnold Schwarzenegger.',
      
      benWeiderTitle: 'Ben Weider Classic',
      benWeiderSubtitle: 'Médailles d\'Or',
      benWeiderCategory: 'et Big Man Masters',
      benWeiderDetail: 'Or dans les compétitions Masters d\'élite, démontrant son excellence et son expérience dans les catégories vétérans de la musculation.',
      
      experienceYears: '25+',
      experienceLabel: 'Ans d\'Expérience',
      experienceSince: 'Depuis l\'an 2000',
      trophiesCount: '40+',
      trophiesLabel: 'Trophées Internationaux',
      
      // Triumph title
      triumphTitle: 'Le Retour Triomphal',
      triumphParagraph: 'Avec une motivation renouvelée, Bernat est revenu en compétition en 2018, et il l\'a fait en grand :',
      triumphWord1: 'Le',
      triumphWord2: 'Retour',
      triumphWord3: 'Triomphal',
      
      // Medal details
      goldMedalTitle: 'MÉDAILLE D\'OR',
      goldMedalSubtitle: 'Le Retour',
      goldMedalSeason: 'Première saison après le retour',
      goldMedalDescription: 'Un retour triomphal qui a marqué le début d\'une nouvelle ère de succès dans la carrière de Bernat.',
      
      silverBronzeTitle: '2 ARGENT + 1 BRONZE',
      silverBronzeSubtitle: 'Plus de podiums en 2018',
      silverBronzeMedals: 'Deux médailles',
      silverBronzeSilver: 'd\'Argent',
      silverBronzeAnd: 'et une',
      silverBronzeBronze: 'de Bronze',
      silverBronzeDetail: 'Une année exceptionnelle avec plusieurs podiums qui ont consolidé son retour au culturisme d\'élite.',
      
      bestBodybuilderTitle: '3ème MEILLEUR CULTURISTE',
      bestBodybuilderSubtitle: 'Reconnaissance Internationale',
      bestBodybuilderNamed: 'Nommé le',
      bestBodybuilderThird: 'Troisième',
      bestBodybuilderBest: 'Meilleur Culturiste de l\'Année',
      bestBodybuilderDetail: 'Une reconnaissance internationale qui a positionné Bernat parmi les meilleurs culturistes du monde.',
      
      newMeaningParagraph: 'Mais cette fois, la compétition avait une nouvelle signification pour lui. Il ne s\'agissait pas seulement de gagner, mais de montrer que la persévérance, la discipline et la détermination peuvent surmonter n\'importe quel obstacle, même une pause de six ans.',
      
      indiaParagraph: 'La même année, il a été invité en Inde pour faire partie d\'une académie d\'entraîneurs personnels, où il a enseigné des cours sur la nutrition, la supplémentation, l\'entraînement et la préparation aux compétitions. Cette opportunité lui a ouvert de nouvelles portes et lui a permis d\'élargir ses connaissances au niveau international, en donnant des séminaires à Dubaï, Singapour et dans diverses villes d\'Inde.',
      
      // Philosophy title
      philosophyTitle: 'Ma Philosophie : Au-Delà du Fitness',
      philosophyWord1: 'Ma',
      philosophyWord2: 'Philosophie',
      philosophyWord3: 'Au-Delà',
      philosophyWord4: 'du',
      philosophyWord5: 'Fitness',
      philosophyWord6: '',
      
      sacrificeCompetitionTitle: 'Le Sacrifice de la Compétition',
      sacrificeCompetitionParagraph: 'Pendant plus d\'une décennie, Bernat a vécu par et pour la musculation. Il concourait, s\'entraînait, perfectionnait sa technique et partageait des expériences avec certains des athlètes les plus importants du monde. Mais, comme tout dans la vie, un moment est venu où il a senti qu\'il devait prendre du recul pour se concentrer sur un autre aspect essentiel : sa famille.\n\nEn 2012, après de nombreuses années de compétition au plus haut niveau, il a décidé de s\'éloigner des scènes et de consacrer son temps à construire un avenir avec sa partenaire. Deux ans plus tard, en 2014, son premier fils est né, et en 2016, sa fille est arrivée. Ce furent des années où la musculation est passée au second plan, car la priorité absolue était d\'élever et de prendre soin de sa famille.\n\nPendant plus d\'une décennie, Bernat a vécu par et pour la musculation. Il concourait, s\'entraînait, perfectionnait sa technique et partageait des expériences avec certains des athlètes les plus importants du monde. Mais, comme tout dans la vie, un moment est venu où il a senti qu\'il devait prendre du recul pour se concentrer sur un autre aspect essentiel : sa famille.\n\nEn 2012, après de nombreuses années de compétition au plus haut niveau, il a décidé de s\'éloigner des scènes et de consacrer son temps à construire un avenir avec sa partenaire. Deux ans plus tard, en 2014, son premier fils est né, et en 2016, sa fille est arrivée. Ce furent des années où la musculation est passée au second plan, car la priorité absolue était d\'élever et de prendre soin de sa famille.',
      
      scorusFitnessParagraph: 'Après sa carrière réussie dans la musculation, Bernat a fondé Scorus Fitness, un centre d\'entraînement conçu pour offrir :',
      
      // Módulos de servicios
      trainingModuleTitle: 'Entraînement',
      trainingModuleDescription: 'Plans d\'entraînement<br/>personnalisés',
      nutritionModuleTitle: 'Nutrition',
      nutritionModuleDescription: 'Nutrition axée sur<br/>la performance et la santé',
      trackingModuleTitle: 'Suivi',
      trackingModuleDescription: 'Accompagnement réel pour<br/>obtenir des changements durables',
      rebornModuleTitle: 'REBORN et Scorus<br/>Campus',
      rebornModuleDescription: 'Programmes premium de<br/>transformation',
      scorusGymModuleTitle: 'ScorusGYM',
      scorusGymModuleDescription: 'Une salle de sport privée avec<br/>une approche exclusive et sans distractions',
      holisticParagraph: 'Son approche est holistique, englobant à la fois le développement physique et l\'état d\'esprit nécessaire pour maintenir un mode de vie sain et durable.',
      
      // Final CTA
      ctaTitle: 'Transformez Votre Vie',
      ctaSubtitle: 'avec Scorus Fitness',
      ctaDescription: 'Si vous cherchez un vrai changement, je suis là pour vous guider. Que vous souhaitiez perdre de la graisse, gagner du muscle ou vous préparer pour une compétition, chez Scorus Fitness, vous trouverez les outils et le soutien dont vous avez besoin.',
      ctaText: 'Commencez aujourd\'hui. Contactez-moi et transformez votre corps et votre esprit.',
      ctaButton: 'Contactez-Moi Maintenant !',
      contactUrl: '/fr/contact',
    }
  };
  
  const t = translations[lang];
  
  const containerRef = useRef<HTMLDivElement>(null);
  const titleLeftRef = useRef<HTMLSpanElement>(null);
  const titleRightRef = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null); // Segundo video (training)
  const video2OverlayRef = useRef<HTMLDivElement>(null); // Overlay del segundo video
  const nextTitleInnerRef = useRef<HTMLDivElement>(null);
  // Nuevo H2: "Entrenador Personal en Alicante y Campeón del Mundo de Culturismo"
  const newH2Ref = useRef<HTMLDivElement>(null);
  // Nuevo párrafo tras el H2: Experiencia de 25 años
  const experienceParaRef = useRef<HTMLDivElement>(null);
  const experienceParaTextRef = useRef<HTMLParagraphElement>(null);
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

  // Canvas flipbook (quinto video - legacy)
  const canvas5Ref = useRef<HTMLCanvasElement>(null);
  const [useCanvas5, setUseCanvas5] = useState(false);
  const imageCache5Ref = useRef<Map<number, HTMLImageElement>>(new Map());
  const currentFrame5Ref = useRef<number>(0);
  const drawing5Ref = useRef<boolean>(false);
  const video5OverlayRef = useRef<HTMLDivElement>(null); // Overlay del quinto video

  // Canvas 6 (epilogue frames)
  const canvas6Ref = useRef<HTMLCanvasElement>(null);
  const [useCanvas6, setUseCanvas6] = useState(false);
  const imageCache6Ref = useRef<Map<number, HTMLImageElement>>(new Map());
  const currentFrame6Ref = useRef<number>(0);
  const drawing6Ref = useRef<boolean>(false);
  const video6OverlayRef = useRef<HTMLDivElement>(null); // Overlay del sexto video

  // Citas
  const quoteRef = useRef<HTMLDivElement>(null);
  const quote2Ref = useRef<HTMLDivElement>(null);
  const quote2TextRef = useRef<HTMLParagraphElement>(null);
  const quote2FullText = t.quote2;
  const quote3Ref = useRef<HTMLDivElement>(null);
  const quote3TextRef = useRef<HTMLParagraphElement>(null);
  const quote3FullText = t.quote3;
  
  // Tabs Netflix (controlados por scroll)
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tab1Ref = useRef<HTMLButtonElement>(null); // Progresión
  const tab2Ref = useRef<HTMLButtonElement>(null); // Workout
  const tab3Ref = useRef<HTMLButtonElement>(null); // Nutrición
  const tabTextRef = useRef<HTMLParagraphElement>(null);
  const tabButtonsContainerRef = useRef<HTMLDivElement>(null); // Contenedor de botones para centrado
  const [activeTab, setActiveTab] = useState<'progresion' | 'workout' | 'nutricion'>('progresion');
  
  const tabsContent = {
    progresion: t.tabProgresion,
    workout: t.tabWorkout,
    nutricion: t.tabNutricion,
  };

  // Bloque siguiente eliminado temporalmente (H2/imagen/párrafo)
  const nextTitleRef = useRef<HTMLHeadingElement>(null);
  const nextTitleBlockRef = useRef<HTMLDivElement>(null);
  const nextBodyRef = useRef<HTMLDivElement>(null);
  const nextBodyStaticRef = useRef<HTMLParagraphElement>(null);
  const nextImageRef = useRef<HTMLDivElement>(null);
  const nextParagraphsRef = useRef<HTMLDivElement>(null);
  const nextParagraphsContainerRef = useRef<HTMLDivElement>(null);
  const nextBodyFullText = t.nextBodyText;
  const paragraphsFullText = t.paragraphsText;
  
  // Nuevo párrafo post-cita 3
  const fatherParaRef = useRef<HTMLDivElement>(null);
  const fatherParaTextRef = useRef<HTMLParagraphElement>(null);
  const fatherParaFullText = t.fatherParagraph;

  // Frase del hijo (zoom out desde el centro)
  const sonChallengeRef = useRef<HTMLDivElement>(null);
  const sonChallengeTextRef = useRef<HTMLHeadingElement>(null);
  const sonChallengeText = t.sonChallenge;

  // Párrafo tras la frase del hijo (aparece desde abajo)
  const sonParaRef = useRef<HTMLDivElement>(null);
  const sonParaTextRef = useRef<HTMLParagraphElement>(null);
  const sonParaFullText = t.sonParagraph;

  // Imagen de competición (entra desde abajo empujando)
  const compImageRef = useRef<HTMLDivElement>(null);

  // H2 Scorus GYM - aparece desde todos los lados
  const gymTitleRef = useRef<HTMLDivElement>(null);
  const gymTitleTextRef = useRef<HTMLHeadingElement>(null);
  const gymSubtitleRef = useRef<HTMLDivElement>(null); // "Scorus GYM"
  const gymBarRef = useRef<HTMLDivElement>(null); // Barra roja decorativa
  const gymTitleText = t.gymTitle;
  const gymLinesRef = useRef<HTMLDivElement>(null); // Líneas diagonales de fondo
  const gymIntroParaRef = useRef<HTMLDivElement>(null); // Párrafo introductorio que aparece con zoom out
  const nabbaChampRef = useRef<HTMLDivElement>(null); // Campeón NABBA 2006
  const mrUniversoRef = useRef<HTMLDivElement>(null); // Subcampeón Mister Universo 2009
  const arnoldClassicRef = useRef<HTMLDivElement>(null); // Arnold Classic
  const benWeiderRef = useRef<HTMLDivElement>(null); // Ben Weider Classic y Big Man Masters
  const coachingImageRef = useRef<HTMLDivElement>(null); // Imagen de coaching
  const experienceRef = useRef<HTMLDivElement>(null); // 25+ Años de experiencia
  const trophiesRef = useRef<HTMLDivElement>(null); // 40+ Trofeos
  const triumphTextRef = useRef<HTMLDivElement>(null); // Texto "El Regreso Triunfal"
  const triumphLinesRef = useRef<HTMLDivElement>(null); // Líneas de fondo para "El Regreso Triunfal"
  const triumphParaRef = useRef<HTMLDivElement>(null); // Párrafo que aparece mientras el H2 se desfragmenta
  const goldMedalRef = useRef<HTMLDivElement>(null); // Frase "Medalla de Oro en su primera temporada"
  const silverBronzeRef = useRef<HTMLDivElement>(null); // Frase "Dos medallas de Plata y una de Bronce"
  const bestBodybuilderRef = useRef<HTMLDivElement>(null); // Frase "Tercer Mejor Culturista del Año"
  const newMeaningParaRef = useRef<HTMLDivElement>(null); // Párrafo "Pero esta vez, la competición..."
  const indiaParaRef = useRef<HTMLDivElement>(null); // Párrafo "Ese mismo año, fue invitado a la India..."
  const stageImageRef = useRef<HTMLDivElement>(null); // Imagen bernat-stage.webp
  const familyImageRef = useRef<HTMLDivElement>(null); // Imagen bernat-family.webp
  const philosophyTextRef = useRef<HTMLDivElement>(null); // H2 "Mi Filosofía: Más Allá del Fitness"
  const philosophyWord1Ref = useRef<HTMLSpanElement>(null); // "Mi"
  const philosophyWord2Ref = useRef<HTMLSpanElement>(null); // "Filosofía:"
  const philosophyWord3Ref = useRef<HTMLSpanElement>(null); // "Más"
  const philosophyWord4Ref = useRef<HTMLSpanElement>(null); // "Allá"
  const philosophyWord5Ref = useRef<HTMLSpanElement>(null); // "del"
  const philosophyWord6Ref = useRef<HTMLSpanElement>(null); // "Fitness"
  const scorusParaRef = useRef<HTMLDivElement>(null); // Párrafo "Tras su exitosa carrera..."
  const trainingModuleRef = useRef<HTMLDivElement>(null); // Módulo "Entrenamiento"
  const nutritionModuleRef = useRef<HTMLDivElement>(null); // Módulo "Nutrición"
  const trackingModuleRef = useRef<HTMLDivElement>(null); // Módulo "Seguimiento"
  const rebornModuleRef = useRef<HTMLDivElement>(null); // Módulo "REBORN y Scorus Campus"
  const scorusGymModuleRef = useRef<HTMLDivElement>(null); // Módulo "ScorusGYM"
  const holisticParaRef = useRef<HTMLDivElement>(null); // Párrafo "Su enfoque es holístico..."
  const finalCtaRef = useRef<HTMLDivElement>(null); // CTA Final "Transforma tu Vida" - PERMANECE FIJO
  const geometricClosureRef = useRef<HTMLDivElement>(null); // Animación geométrica de cierre
  const finalBlackBgRef = useRef<HTMLDivElement>(null); // Fondo negro final
  const triumphTitle1Ref = useRef<HTMLSpanElement>(null); // "El Regreso"
  const triumphTitle2Ref = useRef<HTMLSpanElement>(null); // "Triunfal:"
  const triumphTitle3Ref = useRef<HTMLSpanElement>(null); // "Más"
  const triumphTitle4Ref = useRef<HTMLSpanElement>(null); // "Fuerte"
  const triumphTitle5Ref = useRef<HTMLSpanElement>(null); // "que"
  const triumphTitle6Ref = useRef<HTMLSpanElement>(null); // "Nunca"
  
  // Estado para el botón "scroll to top" en móvil
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!containerRef.current) return;

    // ===== OPTIMIZACIONES PARA SCROLL TÁCTIL EN MÓVIL =====
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    
    // Configuración global de ScrollTrigger para mejorar rendimiento en móvil
    ScrollTrigger.config({
      limitCallbacks: false, // Sin límites para máximo rendimiento
      syncInterval: 0, // Sin delay, actualización inmediata
      ignoreMobileResize: true, // Evita recalcular en cada cambio de orientación
    });

    // DESACTIVADO: normalizeScroll estaba limitando el movimiento natural del dedo
    // Ahora usamos scroll nativo sin modificaciones para máxima velocidad
    /*
    if (isMobile) {
      ScrollTrigger.normalizeScroll({
        allowNestedScroll: true,
        lockAxis: true,
        momentum: (self: any) => Math.min(12, self.velocityY / 100),
        type: "touch,wheel,pointer",
      });
    }
    */

    // Valor de scrub: true = instantáneo sin delay en móvil
    const scrubValue = isMobile ? true : 0.3; // Scroll nativo instantáneo en móvil

    // ===== PREVENIR OVERSCROLL EN MÓVIL (excepto en el top) =====
    // Esto evita que la barra de URL aparezca al hacer scroll en medio de la página
    let preventOverscrollHandler: ((e: TouchEvent) => void) | null = null;
    let preventPullToRefreshHandler: ((e: TouchEvent) => void) | null = null;
    let touchStartHandler: ((e: TouchEvent) => void) | null = null;
    
    if (isMobile) {
      let lastScrollY = 0;
      
      preventOverscrollHandler = (e: TouchEvent) => {
        const currentScrollY = window.scrollY || window.pageYOffset;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        
        // Solo permitir overscroll si estamos exactamente en el top (scrollY <= 1)
        // o en el bottom (para poder refrescar)
        const isAtTop = currentScrollY <= 1;
        const isAtBottom = currentScrollY >= maxScroll - 1;
        
        // Si no estamos en el top ni en el bottom, prevenir el bounce
        if (!isAtTop && !isAtBottom) {
          const target = e.target as HTMLElement;
          // Permitir scroll dentro de elementos scrollables (como el footer)
          if (!target.closest('.overflow-auto') && !target.closest('[style*="overflow"]')) {
            // No prevenir por defecto aquí, solo controlar los límites
            const touch = e.touches[0];
            const deltaY = lastScrollY - touch.clientY;
            
            // Si intenta hacer scroll más allá de los límites, prevenir
            if ((currentScrollY <= 0 && deltaY < 0) || (currentScrollY >= maxScroll && deltaY > 0)) {
              e.preventDefault();
            }
          }
        }
        
        lastScrollY = e.touches[0].clientY;
      };
      
      // Agregar event listener con passive: false para poder usar preventDefault
      document.addEventListener('touchmove', preventOverscrollHandler, { passive: false });
      
      // También prevenir el pull-to-refresh en el top (cuando scrollY > 10)
      preventPullToRefreshHandler = (e: TouchEvent) => {
        const currentScrollY = window.scrollY || window.pageYOffset;
        if (currentScrollY > 10) {
          const target = e.target as HTMLElement;
          if (!target.closest('.overflow-auto') && !target.closest('[style*="overflow"]')) {
            // Solo prevenir si estamos arrastrando hacia abajo
            const touch = e.touches[0];
            if (touch.clientY > lastScrollY) {
              e.preventDefault();
            }
          }
        }
      };
      
      touchStartHandler = (e: TouchEvent) => {
        lastScrollY = e.touches[0].clientY;
      };
      
      document.addEventListener('touchstart', touchStartHandler, { passive: true });
    }

    // ===== BOTÓN "SCROLL TO TOP" EN MÓVIL =====
    if (isMobile) {
      const handleScrollTopVisibility = () => {
        const scrollY = window.scrollY || window.pageYOffset;
        // Mostrar el botón después de 300px de scroll
        setShowScrollTop(scrollY > 300);
      };
      
      window.addEventListener('scroll', handleScrollTopVisibility, { passive: true });
      handleScrollTopVisibility(); // ejecutar al cargar
    }

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
    // Inicializar el contenedor principal con opacidad completa y pointer-events activos
    if (containerRef.current) gsap.set(containerRef.current, { opacity: 1, pointerEvents: 'auto' });
    
    // Canvas3 (video challenge): mantener fuera de pantalla y oculto inicialmente
    if (canvas3Ref.current) gsap.set(canvas3Ref.current, { x: '100vw', visibility: 'hidden' });
    if (video3OverlayRef.current) gsap.set(video3OverlayRef.current, { x: '100vw', visibility: 'hidden' });
    // Canvas4 (video final): mantener fuera de pantalla a la IZQUIERDA y oculto inicialmente
    if (canvas4Ref.current) gsap.set(canvas4Ref.current, { x: '-100vw', visibility: 'hidden' });
    if (video4OverlayRef.current) gsap.set(video4OverlayRef.current, { x: '-100vw', visibility: 'hidden' });
    // Canvas5 (video legacy): mantener fuera de pantalla a la DERECHA y oculto inicialmente
    if (canvas5Ref.current) gsap.set(canvas5Ref.current, { x: '100vw', visibility: 'hidden' });
    if (video5OverlayRef.current) gsap.set(video5OverlayRef.current, { x: '100vw', visibility: 'hidden' });
    // Canvas6 (video epilogue): mantener fuera de pantalla a la IZQUIERDA y oculto inicialmente
    if (canvas6Ref.current) gsap.set(canvas6Ref.current, { x: '-100vw', visibility: 'hidden' });
    if (video6OverlayRef.current) gsap.set(video6OverlayRef.current, { x: '-100vw', visibility: 'hidden' });
    
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
    const scrollScreensForVideo1 = 12; // Duración del primer video (mantener original)
    const totalScroll = window.innerHeight * scrollScreensForVideo1;
    const scrollEl = document.scrollingElement || document.documentElement;

    // Intro sale rápido 0–20%
    gsap.to(titleLeftRef.current, {
      x: '-100vw',
      ease: 'none',
      scrollTrigger: {
        trigger: scrollEl as Element,
        start: 'top top',
        end: `+=${totalScroll * 0.2}`,
        scrub: scrubValue,
      },
    });

    gsap.to(titleRightRef.current, {
      x: '100vw',
      ease: 'none',
      scrollTrigger: {
        trigger: scrollEl as Element,
        start: 'top top',
        end: `+=${totalScroll * 0.2}`,
        scrub: scrubValue,
      },
    });

    gsap.to(subtitleRef.current, {
      x: '-120vw',
      ease: 'none',
      scrollTrigger: {
        trigger: scrollEl as Element,
        start: `+=${totalScroll * 0.02} top`,
        end: `+=${totalScroll * 0.2}`,
        scrub: scrubValue,
      },
    });

    gsap.to(bodyRef.current, {
      x: '120vw',
      ease: 'none',
      scrollTrigger: {
        trigger: scrollEl as Element,
        start: `+=${totalScroll * 0.05} top`,
        end: `+=${totalScroll * 0.2}`,
        scrub: scrubValue,
      },
    });

    // Cita: una sola timeline 10–16% (entra y sale) en desktop; en móvil la extendemos unos "snaps" más
    if (quoteRef.current) gsap.set(quoteRef.current, { y: '-120vh', opacity: 1 });
    
    // ================= LIMITADOR DE VELOCIDAD DE SCROLL EN MÓVIL =================
    // DESACTIVADO: ScrollTrigger.normalizeScroll() ya maneja esto de forma más optimizada
    // El antiguo sistema de fricción puede interferir con la normalización de GSAP
    /*
    if (isMobile) {
      let isScrolling = false;
      let scrollVelocity = 0;
      let lastScrollY = window.scrollY;
      let lastTime = Date.now();
      let rafId: number;

      const smoothScroll = () => {
        const currentScrollY = window.scrollY;
        const currentTime = Date.now();
        const deltaY = currentScrollY - lastScrollY;
        const deltaTime = currentTime - lastTime;

        // Calcular velocidad de scroll (px/ms)
        scrollVelocity = Math.abs(deltaY / deltaTime);

        // Si la velocidad es muy alta (> 3 px/ms), aplicar fricción
        if (scrollVelocity > 3 && !isScrolling) {
          isScrolling = true;
          
          // Aplicar fricción progresiva
          const friction = 0.92; // Factor de fricción (0-1, menor = más fricción)
          let velocity = deltaY;
          
          const applyFriction = () => {
            velocity *= friction;
            
            if (Math.abs(velocity) > 0.5) {
              window.scrollBy(0, velocity);
              rafId = requestAnimationFrame(applyFriction);
            } else {
              isScrolling = false;
            }
          };
          
          // Cancelar scroll nativo e iniciar scroll con fricción
          window.scrollTo(0, lastScrollY);
          applyFriction();
        }

        lastScrollY = currentScrollY;
        lastTime = currentTime;
      };

      const scrollHandler = () => {
        if (!isScrolling) {
          smoothScroll();
        }
      };

      window.addEventListener('scroll', scrollHandler, { passive: true });
      
      // Cleanup
      const cleanupScrollLimiter = () => {
        window.removeEventListener('scroll', scrollHandler);
        if (rafId) cancelAnimationFrame(rafId);
      };
      
      // Guardar cleanup para el return final
      window.addEventListener('beforeunload', cleanupScrollLimiter);
    }
    */
    
    const quoteEndFactor = isMobile ? 0.20 : 0.16; // valores más conservadores
    const quoteTl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollEl as Element,
        start: `+=${totalScroll * 0.12} top`,
        end: `+=${totalScroll * quoteEndFactor}`,
        scrub: scrubValue,
      },
    });
    quoteTl
      .to(quoteRef.current, { y: 0, ease: 'power3.out', duration: 0.5 })
      .to(quoteRef.current, { y: '-120vh', ease: 'power3.in', duration: 0.5 });

    // ================= NUEVO H2: "Entrenador Personal en Alicante y Campeón del Mundo" =================
    // Aparece justo después de que la cita de Arnold desaparece
    const quoteEndPx = totalScroll * (0.12 + quoteEndFactor); // Punto donde termina la cita
    const NOTCH_SIZE_PX = isMobile ? 75 : 100; // Tamaño de un notch (igual que NOTCH_PX definido más adelante)
    const NEW_H2_ENTRY_PX = NOTCH_SIZE_PX * 5; // Entrada con zoom out
    const NEW_H2_HOLD_PX = NOTCH_SIZE_PX * 6; // Hold para lectura
    const NEW_H2_EXIT_PX = NOTCH_SIZE_PX * 5; // Salida con zoom out
    const newH2StartPx = quoteEndPx; // Justo después de la cita de Arnold

    // Estado inicial: oculto, escalado grande
    if (newH2Ref.current) {
      gsap.set(newH2Ref.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
    }

    // Entry: Aparición con zoom out
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${newH2StartPx} top`,
      end: `+=${NEW_H2_ENTRY_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (newH2Ref.current) gsap.set(newH2Ref.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        if (!newH2Ref.current) return;
        const scale = 1.5 - (self.progress * 0.5); // 1.5 → 1.0
        const opacity = self.progress; // 0 → 1
        gsap.set(newH2Ref.current, { scale, opacity });
      },
      onLeaveBack: () => {
        if (newH2Ref.current) {
          gsap.set(newH2Ref.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
        }
      }
    });

    const newH2HoldStartPx = newH2StartPx + NEW_H2_ENTRY_PX;

    // Hold: mantener visible
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${newH2HoldStartPx} top`,
      end: `+=${NEW_H2_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (!newH2Ref.current) return;
        gsap.set(newH2Ref.current, { scale: 1.0, opacity: 1 });
      }
    });

    const newH2ExitStartPx = newH2HoldStartPx + NEW_H2_HOLD_PX;

    // Exit: Desaparición con zoom out para dar paso al siguiente H2
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${newH2ExitStartPx} top`,
      end: `+=${NEW_H2_EXIT_PX}`,
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!newH2Ref.current) return;
        const scale = 1.0 + (self.progress * 1.5); // 1.0 → 2.5
        const opacity = 1 - self.progress; // 1 → 0
        gsap.set(newH2Ref.current, { scale, opacity });
      },
      onLeave: () => {
        if (newH2Ref.current) {
          gsap.set(newH2Ref.current, { visibility: 'hidden' });
        }
      },
      onEnterBack: () => {
        if (newH2Ref.current) {
          gsap.set(newH2Ref.current, { visibility: 'visible' });
        }
      }
    });

    // ================= NUEVO PÁRRAFO: Experiencia de 25 años (con efecto de escritura) =================
    const experienceParaFullText = t.experienceParagraph;
    
    const EXPERIENCE_PARA_ENTRY_PX = NOTCH_SIZE_PX * 3; // Entrada del párrafo
    const EXPERIENCE_PARA_TYPE_PX = NOTCH_SIZE_PX * 8; // Efecto de escritura
    const EXPERIENCE_PARA_HOLD_PX = NOTCH_SIZE_PX * 4; // Hold para lectura
    const EXPERIENCE_PARA_EXIT_PX = NOTCH_SIZE_PX * 3; // Salida
    const experienceParaStartPx = newH2ExitStartPx + NEW_H2_EXIT_PX; // Justo después del nuevo H2

    // Estado inicial: oculto
    if (experienceParaRef.current) {
      gsap.set(experienceParaRef.current, { visibility: 'hidden', opacity: 0, y: 50 });
    }
    if (experienceParaTextRef.current) {
      experienceParaTextRef.current.textContent = '';
    }

    // Entry: Aparición desde abajo con fade in
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${experienceParaStartPx} top`,
      end: `+=${EXPERIENCE_PARA_ENTRY_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (experienceParaRef.current) gsap.set(experienceParaRef.current, { visibility: 'visible' });
        if (experienceParaTextRef.current) experienceParaTextRef.current.textContent = '';
      },
      onUpdate: (self) => {
        if (!experienceParaRef.current) return;
        const opacity = self.progress; // 0 → 1
        const y = 50 - (self.progress * 50); // 50px → 0px
        gsap.set(experienceParaRef.current, { opacity, y });
      },
      onLeaveBack: () => {
        if (experienceParaRef.current) {
          gsap.set(experienceParaRef.current, { visibility: 'hidden', opacity: 0, y: 50 });
        }
        if (experienceParaTextRef.current) experienceParaTextRef.current.textContent = '';
      }
    });

    const experienceParaTypeStartPx = experienceParaStartPx + EXPERIENCE_PARA_ENTRY_PX;

    // Typing effect: Escribir el texto carácter por carácter
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${experienceParaTypeStartPx} top`,
      end: `+=${EXPERIENCE_PARA_TYPE_PX}`,
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!experienceParaTextRef.current) return;
        const charCount = Math.floor(experienceParaFullText.length * self.progress);
        experienceParaTextRef.current.textContent = experienceParaFullText.substring(0, charCount);
      },
      onEnterBack: () => {
        if (experienceParaTextRef.current) experienceParaTextRef.current.textContent = '';
      },
      onLeave: () => {
        // Asegurar que el texto completo queda establecido cuando se avanza
        if (experienceParaTextRef.current) {
          experienceParaTextRef.current.textContent = experienceParaFullText;
        }
      },
    });

    const experienceParaHoldStartPx = experienceParaTypeStartPx + EXPERIENCE_PARA_TYPE_PX;

    // Hold: Mantener visible con el texto completo
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${experienceParaHoldStartPx} top`,
      end: `+=${EXPERIENCE_PARA_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (!experienceParaRef.current) return;
        gsap.set(experienceParaRef.current, { opacity: 1, y: 0 });
        if (experienceParaTextRef.current && experienceParaTextRef.current.textContent.length < experienceParaFullText.length) {
          experienceParaTextRef.current.textContent = experienceParaFullText;
        }
      }
    });

    const experienceParaExitStartPx = experienceParaHoldStartPx + EXPERIENCE_PARA_HOLD_PX;

    // Exit: Desaparición con fade out hacia arriba
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${experienceParaExitStartPx} top`,
      end: `+=${EXPERIENCE_PARA_EXIT_PX}`,
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!experienceParaRef.current) return;
        const opacity = 1 - self.progress; // 1 → 0
        const y = -(self.progress * 50); // 0px → -50px
        gsap.set(experienceParaRef.current, { opacity, y });
      },
      onLeave: () => {
        if (experienceParaRef.current) {
          gsap.set(experienceParaRef.current, { visibility: 'hidden' });
        }
      },
      onEnterBack: () => {
        if (experienceParaRef.current) {
          gsap.set(experienceParaRef.current, { visibility: 'visible' });
        }
      }
    });

    // Parámetros del flip del H2 - AJUSTADO para empezar después del nuevo párrafo
    const experienceParaEndPx = experienceParaExitStartPx + EXPERIENCE_PARA_EXIT_PX; // Fin del párrafo
    const SPACING_AFTER_PARA = NOTCH_SIZE_PX * 3; // Espacio de separación (3 notches)
    const TITLE_FLIP_START = (experienceParaEndPx + SPACING_AFTER_PARA) / totalScroll; // Convertir a factor (porcentaje del totalScroll)
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
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!nextTitleBlockRef.current) return;
        const spansUp = nextTitleBlockRef.current.querySelectorAll('.flip-up');
        const spansDown = nextTitleBlockRef.current.querySelectorAll('.flip-down');
        const p = self.progress;
        gsap.to(spansUp, { rotateX: gsap.utils.mapRange(0, 1, TITLE_FLIP_ANGLE, 0)(p), ease: 'none', overwrite: 'auto' });
        gsap.to(spansDown, { rotateX: gsap.utils.mapRange(0, 1, -TITLE_FLIP_ANGLE, 0)(p), ease: 'none', overwrite: 'auto' });
      },
      onLeaveBack: () => {
        // Resetear el flip cuando se hace scroll hacia atrás
        if (!nextTitleBlockRef.current) return;
        const spansUp = nextTitleBlockRef.current.querySelectorAll('.flip-up');
        const spansDown = nextTitleBlockRef.current.querySelectorAll('.flip-down');
        gsap.set(spansUp, { rotateX: TITLE_FLIP_ANGLE });
        gsap.set(spansDown, { rotateX: -TITLE_FLIP_ANGLE });
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
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!nextTitleInnerRef.current) return;
        const y = -LIFT_MAX_PX * self.progress; // desde 0px hasta -100px y se queda ahí
        gsap.set(nextTitleInnerRef.current, { y });
      },
      onLeaveBack: () => {
        // Resetear posición Y cuando se hace scroll hacia atrás
        if (nextTitleInnerRef.current) gsap.set(nextTitleInnerRef.current, { y: 0 });
      },
    });

    // Escritura del párrafo: empieza junto a la subida del H2 y se escribe con el scroll
    const TYPE_SCROLL_PX = isMobile ? 1000 : 1000;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${moveStartPx} top`,
      end: `+=${TYPE_SCROLL_PX}`,
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!nextBodyRef.current) return;
        const total = nextBodyFullText.length;
        const chars = Math.max(0, Math.min(total, Math.floor(self.progress * total)));
        nextBodyRef.current.textContent = nextBodyFullText.slice(0, chars);
      },
      onLeaveBack: () => {
        if (nextBodyRef.current) nextBodyRef.current.textContent = '';
      },
      onEnter: () => {
        // Asegurar que el texto esté vacío al entrar por primera vez
        if (nextBodyRef.current && nextBodyRef.current.textContent.length === nextBodyFullText.length) {
          nextBodyRef.current.textContent = '';
        }
      },
      onLeave: () => {
        // Asegurar que el texto completo queda establecido cuando se avanza
        if (nextBodyRef.current) {
          nextBodyRef.current.textContent = nextBodyFullText;
        }
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
      scrub: scrubValue,
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
        // Resetear posición X cuando se hace scroll hacia atrás
        if (nextTitleInnerRef.current) gsap.set(nextTitleInnerRef.current, { x: 0 });
        if (nextImageRef.current) gsap.set(nextImageRef.current, { x: '100vw' });
      },
      onEnter: () => {
        // Asegurar que Y esté en su posición correcta al entrar en esta fase
        if (nextTitleInnerRef.current) {
          const currentTransform = gsap.getProperty(nextTitleInnerRef.current, 'y') as number;
          if (currentTransform !== -LIFT_MAX_PX) {
            gsap.set(nextTitleInnerRef.current, { y: -LIFT_MAX_PX });
          }
        }
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
      scrub: scrubValue,
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
      scrub: scrubValue,
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
      onLeave: () => {
        // Asegurar que el texto completo queda establecido cuando se avanza
        if (nextParagraphsRef.current) {
          nextParagraphsRef.current.textContent = paragraphsFullText;
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
      scrub: scrubValue,
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
      scrub: scrubValue,
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
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!quote2TextRef.current) return;
        const total = quote2FullText.length;
        const chars = Math.floor(self.progress * total);
        quote2TextRef.current.textContent = quote2FullText.slice(0, chars);
      },
      onLeaveBack: () => {
        if (quote2TextRef.current) quote2TextRef.current.textContent = '';
      },
      onLeave: () => {
        // Asegurar que el texto completo queda establecido cuando se avanza
        if (quote2TextRef.current) quote2TextRef.current.textContent = quote2FullText;
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
      scrub: scrubValue,
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
      scrub: scrubValue,
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
      scrub: scrubValue,
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
      scrub: scrubValue,
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
      scrub: scrubValue,
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
      scrub: scrubValue,
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
      scrub: scrubValue,
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
    const NOTCH_PX = isMobile ? 80 : 108;
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
      scrub: scrubValue,
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
    const COMP_PARA = t.sacrificeCompetitionParagraph;

    const PARA_ENTER_PX = NOTCH_PX * 8; // duración de entrada del párrafo
    const paraStartPx = tabsExitStartPx + TABS_EXIT_PX; // tras desaparecer tabs y entrar H2

    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${paraStartPx} top`,
      end: `+=${PARA_ENTER_PX}`,
      scrub: scrubValue,
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
      scrub: scrubValue,
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
      scrub: scrubValue,
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
      scrub: scrubValue,
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
      scrub: scrubValue,
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
      scrub: scrubValue,
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
      },
      onLeave: () => {
        // Asegurar que el texto completo queda establecido cuando se avanza
        if (fatherParaTextRef.current) fatherParaTextRef.current.textContent = fatherParaFullText;
      },
    });

    // Desplazar párrafo "Durante este periodo" hacia la izquierda tras terminar de escribir
    const FATHER_PARA_SLIDE_PX = NOTCH_PX * 5;
    const fatherParaSlideStartPx = fatherParaStartPx + FATHER_PARA_TYPE_PX + (NOTCH_PX * 2); // hold de 2 notches
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${fatherParaSlideStartPx} top`,
      end: `+=${FATHER_PARA_SLIDE_PX}`,
      scrub: scrubValue,
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
      // Palabras clave según idioma
      const keywordsPattern = lang === 'es' 
        ? /compites|papá|Compite/gi 
        : lang === 'en'
        ? /compete|dad|Compete/gi
        : /compètes|papa|Compète/gi; // francés
      const outlinedHTML = sonChallengeText.replace(keywordsPattern, (m) => (
        `<span style="color:transparent;-webkit-text-stroke:2px rgb(220,38,38)">${m}</span>`
      ));
      sonChallengeTextRef.current.innerHTML = outlinedHTML;
    };
    if (sonChallengeRef.current) gsap.set(sonChallengeRef.current, { visibility: 'hidden', scale: 0.1, opacity: 0 });
    setSonChallengeHTML();

    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${sonChallengeStartPx} top`,
      end: `+=${SON_CHALLENGE_IN_PX}`,
      scrub: scrubValue,
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
    const sonChallengeSlideStartPx = sonChallengeStartPx + SON_CHALLENGE_IN_PX + SON_CHALLENGE_HOLD_PX;

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
      scrub: scrubValue,
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
      },
      onLeave: () => {
        // Asegurar que el texto completo queda establecido cuando se avanza
        if (sonParaTextRef.current) sonParaTextRef.current.textContent = sonParaFullText;
      },
    });

    // BLAST del H2 (frase del hijo): cuando empieza el párrafo, disparar hacia arriba rápido
    const SON_BLAST_PX = NOTCH_PX * 2;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${sonParaStartPx} top`,
      end: `+=${SON_BLAST_PX}`,
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!sonChallengeRef.current) return;
        const p = self.progress; // 0 → 1
        const y = -window.innerHeight * 1.2 * p; // 0 → -120vh
        const sc = 1 + 0.05 * p; // leve impulso
        gsap.set(sonChallengeRef.current, { y, scale: sc });
      },
      onLeave: () => {
        // Ocultar completamente cuando sale
        if (sonChallengeRef.current) gsap.set(sonChallengeRef.current, { visibility: 'hidden' });
      },
      onLeaveBack: () => {
        if (sonChallengeRef.current) gsap.set(sonChallengeRef.current, { y: 0, scale: 1, visibility: 'visible' });
      }
    });

    // HOLD: mantener ambos centrados para lectura
    const sonParaHoldStartPx = sonParaStartPx + SON_PARA_ENTER_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${sonParaHoldStartPx} top`,
      end: `+=${SON_PARA_HOLD_PX}`,
      scrub: scrubValue,
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
      scrub: scrubValue,
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
      scrub: scrubValue,
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
      scrub: scrubValue,
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
      scrub: scrubValue,
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
        span.style.opacity = '0'; // Iniciar invisible para evitar flash
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
      scrub: scrubValue,
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

    // ================= SALIDA DEL PÁRRAFO INTRODUCTORIO HACIA LA IZQUIERDA =================
    const GYM_PARA_EXIT_PX = NOTCH_PX * 4; // 4 notchs para la salida
    const gymParaExitStartPx = gymStartPx + GYM_IN_PX;
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${gymParaExitStartPx} top`,
      end: `+=${GYM_PARA_EXIT_PX}`,
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!gymIntroParaRef.current) return;
        const p = self.progress; // 0 → 1
        const vw = window.innerWidth;
        const x = -vw * p; // De 0 a -100vw (hacia la izquierda)
        gymIntroParaRef.current.style.transform = `translateX(${x}px) scale(1)`;
      },
      onLeave: () => {
        if (gymIntroParaRef.current) {
          gymIntroParaRef.current.style.opacity = '0';
          gymIntroParaRef.current.style.visibility = 'hidden';
        }
      },
      onEnterBack: () => {
        if (gymIntroParaRef.current) {
          gymIntroParaRef.current.style.opacity = '1';
          gymIntroParaRef.current.style.visibility = 'visible';
        }
      },
      onLeaveBack: () => {
        if (gymIntroParaRef.current) {
          gymIntroParaRef.current.style.transform = 'translateX(0) scale(1)';
        }
      }
    });

    // ================= CAMPEÓN NABBA 2006 - ENTRADA DESDE LA DERECHA =================
    const NABBA_ENTRY_PX = NOTCH_PX * 4; // 4 notchs para la entrada
    const NABBA_HOLD_PX = NOTCH_PX * 5;  // 5 notchs de lectura
    const nabbaStartPx = gymParaExitStartPx + GYM_PARA_EXIT_PX;
    
    if (nabbaChampRef.current) gsap.set(nabbaChampRef.current, { visibility: 'hidden', x: window.innerWidth });
    
    // Entrada desde la derecha
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${nabbaStartPx} top`,
      end: `+=${NABBA_ENTRY_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (nabbaChampRef.current) gsap.set(nabbaChampRef.current, { visibility: 'visible' });
      },
      onEnterBack: () => {
        if (nabbaChampRef.current) gsap.set(nabbaChampRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        if (!nabbaChampRef.current) return;
        const p = self.progress; // 0 → 1
        const vw = window.innerWidth;
        const x = vw * (1 - p); // De 100vw a 0 (desde la derecha)
        gsap.set(nabbaChampRef.current, { x });
      },
      onLeaveBack: () => {
        if (nabbaChampRef.current) gsap.set(nabbaChampRef.current, { visibility: 'hidden', x: window.innerWidth });
      }
    });
    
    // Hold (mantener visible para lectura)
    const nabbaHoldStartPx = nabbaStartPx + NABBA_ENTRY_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${nabbaHoldStartPx} top`,
      end: `+=${NABBA_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (nabbaChampRef.current) gsap.set(nabbaChampRef.current, { x: 0 });
      }
    });
    
    // Salida hacia la izquierda
    const NABBA_EXIT_PX = NOTCH_PX * 4; // 4 notchs para la salida
    const nabbaExitStartPx = nabbaHoldStartPx + NABBA_HOLD_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${nabbaExitStartPx} top`,
      end: `+=${NABBA_EXIT_PX}`,
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!nabbaChampRef.current) return;
        const p = self.progress; // 0 → 1
        const vw = window.innerWidth;
        const x = -vw * p; // De 0 a -100vw (hacia la izquierda)
        gsap.set(nabbaChampRef.current, { x });
      },
      onLeave: () => {
        if (nabbaChampRef.current) gsap.set(nabbaChampRef.current, { visibility: 'hidden' });
      },
      onEnterBack: () => {
        if (nabbaChampRef.current) gsap.set(nabbaChampRef.current, { visibility: 'visible' });
      },
      onLeaveBack: () => {
        if (nabbaChampRef.current) gsap.set(nabbaChampRef.current, { x: 0 });
      }
    });

    // ================= SUBCAMPEÓN MISTER UNIVERSO 2009 - ENTRADA DESDE LA DERECHA =================
    const MR_UNIVERSO_ENTRY_PX = NOTCH_PX * 4; // 4 notchs para la entrada
    const MR_UNIVERSO_HOLD_PX = NOTCH_PX * 5;  // 5 notchs de lectura
    const mrUniversoStartPx = nabbaExitStartPx + NABBA_EXIT_PX;
    
    if (mrUniversoRef.current) gsap.set(mrUniversoRef.current, { visibility: 'hidden', x: window.innerWidth });
    
    // Entrada desde la derecha
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${mrUniversoStartPx} top`,
      end: `+=${MR_UNIVERSO_ENTRY_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (mrUniversoRef.current) gsap.set(mrUniversoRef.current, { visibility: 'visible' });
      },
      onEnterBack: () => {
        if (mrUniversoRef.current) gsap.set(mrUniversoRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        if (!mrUniversoRef.current) return;
        const p = self.progress; // 0 → 1
        const vw = window.innerWidth;
        const x = vw * (1 - p); // De 100vw a 0 (desde la derecha)
        gsap.set(mrUniversoRef.current, { x });
      },
      onLeaveBack: () => {
        if (mrUniversoRef.current) gsap.set(mrUniversoRef.current, { visibility: 'hidden', x: window.innerWidth });
      }
    });
    
    // Hold (mantener visible para lectura)
    const mrUniversoHoldStartPx = mrUniversoStartPx + MR_UNIVERSO_ENTRY_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${mrUniversoHoldStartPx} top`,
      end: `+=${MR_UNIVERSO_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (mrUniversoRef.current) gsap.set(mrUniversoRef.current, { x: 0 });
      }
    });
    
    // Salida hacia la izquierda
    const MR_UNIVERSO_EXIT_PX = NOTCH_PX * 4; // 4 notchs para la salida
    const mrUniversoExitStartPx = mrUniversoHoldStartPx + MR_UNIVERSO_HOLD_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${mrUniversoExitStartPx} top`,
      end: `+=${MR_UNIVERSO_EXIT_PX}`,
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!mrUniversoRef.current) return;
        const p = self.progress; // 0 → 1
        const vw = window.innerWidth;
        const x = -vw * p; // De 0 a -100vw (hacia la izquierda)
        gsap.set(mrUniversoRef.current, { x });
      },
      onLeave: () => {
        if (mrUniversoRef.current) gsap.set(mrUniversoRef.current, { visibility: 'hidden' });
      },
      onEnterBack: () => {
        if (mrUniversoRef.current) gsap.set(mrUniversoRef.current, { visibility: 'visible' });
      },
      onLeaveBack: () => {
        if (mrUniversoRef.current) gsap.set(mrUniversoRef.current, { x: 0 });
      }
    });

    // ================= ARNOLD CLASSIC - ENTRADA DESDE LA DERECHA =================
    const ARNOLD_ENTRY_PX = NOTCH_PX * 4; // 4 notchs para la entrada
    const ARNOLD_HOLD_PX = NOTCH_PX * 5;  // 5 notchs de lectura
    const arnoldStartPx = mrUniversoExitStartPx + MR_UNIVERSO_EXIT_PX;
    
    if (arnoldClassicRef.current) gsap.set(arnoldClassicRef.current, { visibility: 'hidden', x: window.innerWidth });
    
    // Entrada desde la derecha
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${arnoldStartPx} top`,
      end: `+=${ARNOLD_ENTRY_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (arnoldClassicRef.current) gsap.set(arnoldClassicRef.current, { visibility: 'visible' });
      },
      onEnterBack: () => {
        if (arnoldClassicRef.current) gsap.set(arnoldClassicRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        if (!arnoldClassicRef.current) return;
        const p = self.progress; // 0 → 1
        const vw = window.innerWidth;
        const x = vw * (1 - p); // De 100vw a 0 (desde la derecha)
        gsap.set(arnoldClassicRef.current, { x });
      },
      onLeaveBack: () => {
        if (arnoldClassicRef.current) gsap.set(arnoldClassicRef.current, { visibility: 'hidden', x: window.innerWidth });
      }
    });
    
    // Hold (mantener visible para lectura)
    const arnoldHoldStartPx = arnoldStartPx + ARNOLD_ENTRY_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${arnoldHoldStartPx} top`,
      end: `+=${ARNOLD_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (arnoldClassicRef.current) gsap.set(arnoldClassicRef.current, { x: 0 });
      }
    });
    
    // Salida hacia la izquierda
    const ARNOLD_EXIT_PX = NOTCH_PX * 4; // 4 notchs para la salida
    const arnoldExitStartPx = arnoldHoldStartPx + ARNOLD_HOLD_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${arnoldExitStartPx} top`,
      end: `+=${ARNOLD_EXIT_PX}`,
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!arnoldClassicRef.current) return;
        const p = self.progress; // 0 → 1
        const vw = window.innerWidth;
        const x = -vw * p; // De 0 a -100vw (hacia la izquierda)
        gsap.set(arnoldClassicRef.current, { x });
      },
      onLeave: () => {
        if (arnoldClassicRef.current) gsap.set(arnoldClassicRef.current, { visibility: 'hidden' });
      },
      onEnterBack: () => {
        if (arnoldClassicRef.current) gsap.set(arnoldClassicRef.current, { visibility: 'visible' });
      },
      onLeaveBack: () => {
        if (arnoldClassicRef.current) gsap.set(arnoldClassicRef.current, { x: 0 });
      }
    });

    // ================= BEN WEIDER CLASSIC & BIG MAN MASTERS - ENTRADA DESDE LA DERECHA =================
    const BEN_WEIDER_ENTRY_PX = NOTCH_PX * 4; // 4 notchs para la entrada
    const BEN_WEIDER_HOLD_PX = NOTCH_PX * 5;  // 5 notchs de lectura
    const benWeiderStartPx = arnoldExitStartPx + ARNOLD_EXIT_PX;
    
    if (benWeiderRef.current) gsap.set(benWeiderRef.current, { visibility: 'hidden', x: window.innerWidth });
    
    // Entrada desde la derecha
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${benWeiderStartPx} top`,
      end: `+=${BEN_WEIDER_ENTRY_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (benWeiderRef.current) gsap.set(benWeiderRef.current, { visibility: 'visible' });
      },
      onEnterBack: () => {
        if (benWeiderRef.current) gsap.set(benWeiderRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        if (!benWeiderRef.current) return;
        const p = self.progress; // 0 → 1
        const vw = window.innerWidth;
        const x = vw * (1 - p); // De 100vw a 0 (desde la derecha)
        gsap.set(benWeiderRef.current, { x });
      },
      onLeaveBack: () => {
        if (benWeiderRef.current) gsap.set(benWeiderRef.current, { visibility: 'hidden', x: window.innerWidth });
      }
    });
    
    // Hold (mantener visible para lectura)
    const benWeiderHoldStartPx = benWeiderStartPx + BEN_WEIDER_ENTRY_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${benWeiderHoldStartPx} top`,
      end: `+=${BEN_WEIDER_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (benWeiderRef.current) gsap.set(benWeiderRef.current, { x: 0 });
      }
    });
    
    // Salida con zoom out
    const BEN_WEIDER_EXIT_PX = NOTCH_PX * 5; // 5 notchs para el zoom out
    const benWeiderExitStartPx = benWeiderHoldStartPx + BEN_WEIDER_HOLD_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${benWeiderExitStartPx} top`,
      end: `+=${BEN_WEIDER_EXIT_PX}`,
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!benWeiderRef.current) return;
        const p = self.progress; // 0 → 1
        const scale = 1 + (p * 0.5); // De 1.0 a 1.5 (zoom out)
        const opacity = 1 - p; // De 1 a 0 (fade out)
        gsap.set(benWeiderRef.current, { scale, opacity, x: 0 });
      },
      onLeave: () => {
        if (benWeiderRef.current) gsap.set(benWeiderRef.current, { visibility: 'hidden' });
      },
      onEnterBack: () => {
        if (benWeiderRef.current) gsap.set(benWeiderRef.current, { visibility: 'visible' });
      },
      onLeaveBack: () => {
        if (benWeiderRef.current) gsap.set(benWeiderRef.current, { scale: 1, opacity: 1, x: 0 });
      }
    });

    // ================= IMAGEN DE COACHING - ENTRADA Y SALIDA CON ZOOM OUT =================
    const COACHING_IMG_ENTRY_PX = NOTCH_PX * 5; // 5 notchs para zoom out entrada
    const COACHING_IMG_HOLD_PX = NOTCH_PX * 4;  // 4 notchs para contemplar
    const COACHING_IMG_EXIT_PX = NOTCH_PX * 5;  // 5 notchs para zoom out salida
    const coachingImgStartPx = benWeiderExitStartPx + BEN_WEIDER_EXIT_PX;
    
    if (coachingImageRef.current) gsap.set(coachingImageRef.current, { visibility: 'hidden', scale: 0.5, opacity: 0 });
    
    // Entrada con zoom out
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${coachingImgStartPx} top`,
      end: `+=${COACHING_IMG_ENTRY_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (coachingImageRef.current) gsap.set(coachingImageRef.current, { visibility: 'visible' });
      },
      onEnterBack: () => {
        if (coachingImageRef.current) gsap.set(coachingImageRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        if (!coachingImageRef.current) return;
        const p = self.progress; // 0 → 1
        const scale = 0.5 + (p * 0.5); // De 0.5 a 1.0 (zoom out)
        const opacity = p; // De 0 a 1 (fade in)
        gsap.set(coachingImageRef.current, { scale, opacity });
      },
      onLeaveBack: () => {
        if (coachingImageRef.current) gsap.set(coachingImageRef.current, { visibility: 'hidden', scale: 0.5, opacity: 0 });
      }
    });
    
    // Hold (mantener visible)
    const coachingImgHoldStartPx = coachingImgStartPx + COACHING_IMG_ENTRY_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${coachingImgHoldStartPx} top`,
      end: `+=${COACHING_IMG_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (coachingImageRef.current) gsap.set(coachingImageRef.current, { scale: 1, opacity: 1 });
      }
    });
    
    // Salida con zoom out (continúa alejándose)
    const coachingImgExitStartPx = coachingImgHoldStartPx + COACHING_IMG_HOLD_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${coachingImgExitStartPx} top`,
      end: `+=${COACHING_IMG_EXIT_PX}`,
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!coachingImageRef.current) return;
        const p = self.progress; // 0 → 1
        const scale = 1 + (p * 1); // De 1.0 a 2.0 (zoom out continuo)
        const opacity = 1 - p; // De 1 a 0 (fade out)
        gsap.set(coachingImageRef.current, { scale, opacity });
      },
      onLeave: () => {
        if (coachingImageRef.current) gsap.set(coachingImageRef.current, { visibility: 'hidden' });
      },
      onEnterBack: () => {
        if (coachingImageRef.current) gsap.set(coachingImageRef.current, { visibility: 'visible' });
      },
      onLeaveBack: () => {
        if (coachingImageRef.current) gsap.set(coachingImageRef.current, { scale: 1, opacity: 1 });
      }
    });

    // ================= 25+ AÑOS DE EXPERIENCIA - ENTRADA Y SALIDA CON ZOOM OUT =================
    const EXPERIENCE_ENTRY_PX = NOTCH_PX * 6; // 6 notchs para el zoom out entrada
    const EXPERIENCE_HOLD_PX = NOTCH_PX * 4;  // 4 notchs para contemplar
    const EXPERIENCE_EXIT_PX = NOTCH_PX * 5;  // 5 notchs para el zoom out salida
    const experienceStartPx = coachingImgExitStartPx + COACHING_IMG_EXIT_PX;
    
    if (experienceRef.current) gsap.set(experienceRef.current, { visibility: 'hidden', scale: 0.5, opacity: 0 });
    
    // Entrada con zoom out
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${experienceStartPx} top`,
      end: `+=${EXPERIENCE_ENTRY_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (experienceRef.current) gsap.set(experienceRef.current, { visibility: 'visible' });
      },
      onEnterBack: () => {
        if (experienceRef.current) gsap.set(experienceRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        if (!experienceRef.current) return;
        const p = self.progress; // 0 → 1
        const scale = 0.5 + (p * 0.5); // De 0.5 a 1.0 (zoom out)
        const opacity = p; // De 0 a 1 (fade in)
        gsap.set(experienceRef.current, { scale, opacity });
      },
      onLeaveBack: () => {
        if (experienceRef.current) gsap.set(experienceRef.current, { visibility: 'hidden', scale: 0.5, opacity: 0 });
      }
    });
    
    // Hold (mantener visible)
    const experienceHoldStartPx = experienceStartPx + EXPERIENCE_ENTRY_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${experienceHoldStartPx} top`,
      end: `+=${EXPERIENCE_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (experienceRef.current) gsap.set(experienceRef.current, { scale: 1, opacity: 1 });
      }
    });
    
    // Salida con zoom out
    const experienceExitStartPx = experienceHoldStartPx + EXPERIENCE_HOLD_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${experienceExitStartPx} top`,
      end: `+=${EXPERIENCE_EXIT_PX}`,
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!experienceRef.current) return;
        const p = self.progress; // 0 → 1
        const scale = 1 + (p * 1); // De 1.0 a 2.0 (zoom out)
        const opacity = 1 - p; // De 1 a 0 (fade out)
        gsap.set(experienceRef.current, { scale, opacity });
      },
      onLeave: () => {
        if (experienceRef.current) gsap.set(experienceRef.current, { visibility: 'hidden' });
      },
      onEnterBack: () => {
        if (experienceRef.current) gsap.set(experienceRef.current, { visibility: 'visible' });
      },
      onLeaveBack: () => {
        if (experienceRef.current) gsap.set(experienceRef.current, { scale: 1, opacity: 1 });
      }
    });

    // ================= 40+ TROFEOS - ENTRADA, HOLD Y SALIDA CON ZOOM OUT =================
    const TROPHIES_ENTRY_PX = NOTCH_PX * 6; // 6 notchs para el zoom out entrada
    const TROPHIES_HOLD_PX = NOTCH_PX * 4;  // 4 notchs para contemplar
    const TROPHIES_EXIT_PX = NOTCH_PX * 5;  // 5 notchs para el zoom out salida
    const trophiesStartPx = experienceExitStartPx + EXPERIENCE_EXIT_PX;
    
    if (trophiesRef.current) gsap.set(trophiesRef.current, { visibility: 'hidden', scale: 0.5, opacity: 0 });
    
    // Entrada con zoom out
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${trophiesStartPx} top`,
      end: `+=${TROPHIES_ENTRY_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (trophiesRef.current) gsap.set(trophiesRef.current, { visibility: 'visible' });
      },
      onEnterBack: () => {
        if (trophiesRef.current) gsap.set(trophiesRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        if (!trophiesRef.current) return;
        const p = self.progress; // 0 → 1
        const scale = 0.5 + (p * 0.5); // De 0.5 a 1.0 (zoom out)
        const opacity = p; // De 0 a 1 (fade in)
        gsap.set(trophiesRef.current, { scale, opacity });
      },
      onLeaveBack: () => {
        if (trophiesRef.current) gsap.set(trophiesRef.current, { visibility: 'hidden', scale: 0.5, opacity: 0 });
      }
    });
    
    // Hold (mantener visible)
    const trophiesHoldStartPx = trophiesStartPx + TROPHIES_ENTRY_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${trophiesHoldStartPx} top`,
      end: `+=${TROPHIES_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (trophiesRef.current) gsap.set(trophiesRef.current, { scale: 1, opacity: 1 });
      }
    });

    // Salida con zoom out
    const trophiesExitStartPx = trophiesHoldStartPx + TROPHIES_HOLD_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${trophiesExitStartPx} top`,
      end: `+=${TROPHIES_EXIT_PX}`,
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!trophiesRef.current) return;
        const p = self.progress; // 0 → 1
        const scale = 1 + (p * 1); // De 1.0 a 2.0 (zoom out)
        const opacity = 1 - p; // De 1 a 0 (fade out)
        gsap.set(trophiesRef.current, { scale, opacity });
      },
      onLeave: () => {
        if (trophiesRef.current) gsap.set(trophiesRef.current, { visibility: 'hidden' });
      },
      onEnterBack: () => {
        if (trophiesRef.current) gsap.set(trophiesRef.current, { visibility: 'visible' });
      },
      onLeaveBack: () => {
        if (trophiesRef.current) gsap.set(trophiesRef.current, { scale: 1, opacity: 1 });
      }
    });

    currentScrollPx += TROPHIES_ENTRY_PX + TROPHIES_HOLD_PX + TROPHIES_EXIT_PX;

    // ================= TEXTO "EL REGRESO TRIUNFAL" - ANIMACIÓN ÉPICA =================
    const TRIUMPH_ENTRY_PX = NOTCH_PX * 6;  // Entrada épica
    const TRIUMPH_HOLD_PX = NOTCH_PX * 4;   // Mantener visible
    const TRIUMPH_EXIT_PX = NOTCH_PX * 6;   // Salida épica
    const triumphStartPx = trophiesExitStartPx + TROPHIES_EXIT_PX;
    
    if (triumphTextRef.current) gsap.set(triumphTextRef.current, { visibility: 'hidden' });
    
    // Definir vectores dramáticos para cada palabra con rotaciones
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const triumphVectors = [
      { ref: triumphTitle1Ref, x: -vw * 2.0, y: -vh * 1.2, rot: -180 },  // "El Regreso" - desde muy lejos arriba-izquierda
      { ref: triumphTitle2Ref, x: vw * 2.2, y: -vh * 1.0, rot: 180 },    // "Triunfal:" - desde muy lejos arriba-derecha
      { ref: triumphTitle3Ref, x: -vw * 1.8, y: vh * 1.3, rot: -120 },   // "Más" - desde muy lejos abajo-izquierda
      { ref: triumphTitle4Ref, x: vw * 2.0, y: vh * 1.5, rot: 150 },     // "Fuerte" - desde muy lejos abajo-derecha
      { ref: triumphTitle5Ref, x: -vw * 2.3, y: -vh * 0.3, rot: -90 },   // "que" - desde muy lejos centro-izquierda
      { ref: triumphTitle6Ref, x: vw * 2.4, y: vh * 0.8, rot: 120 }      // "Nunca" - desde muy lejos centro-derecha
    ];
    
    // Función de easing para efecto de impacto (ease-out con rebote)
    const easeOutBack = (t: number): number => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    };
    
    // ENTRADA ÉPICA: Palabras entran con aceleración dramática y rotación + líneas de rayos
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${triumphStartPx} top`,
      end: `+=${TRIUMPH_ENTRY_PX}`,
      scrub: 1, // Scrub más suave para efecto dramático
      onEnter: () => {
        if (triumphTextRef.current) gsap.set(triumphTextRef.current, { visibility: 'visible' });
      },
      onEnterBack: () => {
        if (triumphTextRef.current) gsap.set(triumphTextRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        if (!triumphTextRef.current) return;
        const p = self.progress; // 0 → 1
        
        // Animación de líneas de fondo (rayos que aparecen rápidamente)
        if (triumphLinesRef.current) {
          const linesProgress = Math.min(1, p * 2); // Aparecen en la primera mitad
          const linesScale = 0.5 + (linesProgress * 0.5); // 0.5 → 1.0
          const linesOpacity = linesProgress * 0.6; // 0 → 0.6
          triumphLinesRef.current.style.transform = `scale(${linesScale})`;
          triumphLinesRef.current.style.opacity = String(linesOpacity);
        }
        
        // Movimiento épico con cascada y easing
        triumphVectors.forEach((vector, i) => {
          if (!vector.ref.current) return;
          
          // Delays escalonados dramáticos
          const delay = i * 0.12;
          const localProgress = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));
          
          // Aplicar easing para efecto de impacto
          const easedProgress = easeOutBack(localProgress);
          
          // Movimiento desde muy lejos + rotación dramática
          const x = vector.x * (1 - easedProgress);
          const y = vector.y * (1 - easedProgress);
          const rot = vector.rot * (1 - localProgress); // Rotación sin easing
          const scale = 0.3 + (easedProgress * 0.7); // Zoom in sutil (0.3 → 1.0)
          
          // Blur durante el movimiento para efecto de velocidad
          const blur = (1 - localProgress) * 8; // 8px → 0px
          
          vector.ref.current.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`;
          vector.ref.current.style.filter = `blur(${blur}px)`;
          vector.ref.current.style.opacity = '1';
        });
      },
      onLeaveBack: () => {
        if (triumphTextRef.current) gsap.set(triumphTextRef.current, { visibility: 'hidden' });
        if (triumphLinesRef.current) triumphLinesRef.current.style.opacity = '0';
      }
    });
    
    // HOLD: Mantener centrado y visible
    const triumphHoldStartPx = triumphStartPx + TRIUMPH_ENTRY_PX;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${triumphHoldStartPx} top`,
      end: `+=${TRIUMPH_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        // Mantener líneas visibles
        if (triumphLinesRef.current) {
          triumphLinesRef.current.style.transform = 'scale(1)';
          triumphLinesRef.current.style.opacity = '0.6';
        }
        // Mantener palabras centradas
        triumphVectors.forEach((vector) => {
          if (!vector.ref.current) return;
          vector.ref.current.style.transform = 'translate(0, 0) rotate(0deg) scale(1)';
          vector.ref.current.style.filter = 'blur(0px)';
          vector.ref.current.style.opacity = '1';
        });
      }
    });
    
    // Función de easing para explosión (ease-in con aceleración)
    const easeInCubic = (t: number): number => {
      return t * t * t;
    };
    
    // SALIDA ÉPICA: Explosión dramática hacia fuera con rotación + líneas desaparecen + párrafo aparece
    const triumphExitStartPx = triumphHoldStartPx + TRIUMPH_HOLD_PX;
    
    if (triumphParaRef.current) gsap.set(triumphParaRef.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${triumphExitStartPx} top`,
      end: `+=${TRIUMPH_EXIT_PX}`,
      scrub: 1, // Scrub suave para dramatismo
      onEnter: () => {
        if (triumphParaRef.current) gsap.set(triumphParaRef.current, { visibility: 'visible' });
      },
      onEnterBack: () => {
        if (triumphTextRef.current) gsap.set(triumphTextRef.current, { visibility: 'visible' });
        if (triumphParaRef.current) gsap.set(triumphParaRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        if (!triumphTextRef.current) return;
        const p = self.progress; // 0 → 1
        
        // Párrafo aparece con zoom out por detrás (z-index menor)
        if (triumphParaRef.current) {
          const paraScale = 1.5 - (p * 0.5); // 1.5 → 1.0 (zoom out)
          const paraOpacity = p; // 0 → 1 (fade in)
          triumphParaRef.current.style.transform = `scale(${paraScale})`;
          triumphParaRef.current.style.opacity = String(paraOpacity);
        }
        
        // Líneas de fondo desaparecen con explosión
        if (triumphLinesRef.current) {
          const linesScale = 1 + (p * 2); // 1.0 → 3.0 (zoom out dramático)
          const linesOpacity = 0.6 * (1 - p); // 0.6 → 0
          triumphLinesRef.current.style.transform = `scale(${linesScale})`;
          triumphLinesRef.current.style.opacity = String(linesOpacity);
        }
        
        // Explosión épica con aceleración creciente
        triumphVectors.forEach((vector, i) => {
          if (!vector.ref.current) return;
          
          // Delays escalonados para efecto cascada
          const delay = i * 0.08;
          const localProgress = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));
          
          // Aplicar easing cúbico para aceleración explosiva
          const easedProgress = easeInCubic(localProgress);
          
          // Explosión hacia afuera con rotación y zoom out
          const x = vector.x * easedProgress;
          const y = vector.y * easedProgress;
          const rot = vector.rot * localProgress; // Rotación creciente
          const scale = 1 + (easedProgress * 1.5); // Zoom out explosivo (1.0 → 2.5)
          
          // Blur creciente durante la explosión
          const blur = localProgress * 12; // 0px → 12px
          
          vector.ref.current.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`;
          vector.ref.current.style.filter = `blur(${blur}px)`;
          vector.ref.current.style.opacity = '1';
        });
      },
      onLeave: () => {
        if (triumphTextRef.current) gsap.set(triumphTextRef.current, { visibility: 'hidden' });
        if (triumphLinesRef.current) triumphLinesRef.current.style.opacity = '0';
      },
      onLeaveBack: () => {
        if (triumphParaRef.current) gsap.set(triumphParaRef.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
        // Resetear todas las palabras
        triumphVectors.forEach((vector) => {
          if (!vector.ref.current) return;
          vector.ref.current.style.transform = 'translate(0, 0) rotate(0deg) scale(1)';
          vector.ref.current.style.filter = 'blur(0px)';
          vector.ref.current.style.opacity = '1';
        });
        // Resetear líneas
        if (triumphLinesRef.current) {
          triumphLinesRef.current.style.transform = 'scale(1)';
          triumphLinesRef.current.style.opacity = '0.6';
        }
      }
    });
    
    currentScrollPx += TRIUMPH_ENTRY_PX + TRIUMPH_HOLD_PX + TRIUMPH_EXIT_PX;

    // ================= PÁRRAFO "CON LA MOTIVACIÓN RENOVADA" - HOLD Y SALIDA =================
    const TRIUMPH_PARA_HOLD_PX = NOTCH_PX * 4; // Mantener visible 4 notchs
    const TRIUMPH_PARA_EXIT_PX = NOTCH_PX * 4; // Salida hacia la derecha
    const triumphParaHoldStartPx = triumphExitStartPx + TRIUMPH_EXIT_PX;
    
    // Hold: Mantener el párrafo visible y centrado
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${triumphParaHoldStartPx} top`,
      end: `+=${TRIUMPH_PARA_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (!triumphParaRef.current) return;
        triumphParaRef.current.style.transform = 'scale(1)';
        triumphParaRef.current.style.opacity = '1';
      }
    });
    
    // Salida hacia la derecha + entrada de "Medalla de Oro" desde la izquierda
    const triumphParaExitStartPx = triumphParaHoldStartPx + TRIUMPH_PARA_HOLD_PX;
    
    if (goldMedalRef.current) gsap.set(goldMedalRef.current, { visibility: 'hidden', x: -window.innerWidth });
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${triumphParaExitStartPx} top`,
      end: `+=${TRIUMPH_PARA_EXIT_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (goldMedalRef.current) gsap.set(goldMedalRef.current, { visibility: 'visible' });
      },
      onEnterBack: () => {
        if (triumphParaRef.current) gsap.set(triumphParaRef.current, { visibility: 'visible' });
        if (goldMedalRef.current) gsap.set(goldMedalRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        const p = self.progress; // 0 → 1
        const vw = window.innerWidth;
        
        // Párrafo anterior sale hacia la derecha
        if (triumphParaRef.current) {
          const x = vw * p; // De 0 a 100vw (hacia la derecha)
          triumphParaRef.current.style.transform = `translateX(${x}px) scale(1)`;
          triumphParaRef.current.style.opacity = '1';
        }
        
        // Nueva frase entra desde la izquierda
        if (goldMedalRef.current) {
          const x = -vw * (1 - p); // De -100vw a 0 (desde la izquierda)
          gsap.set(goldMedalRef.current, { x });
        }
      },
      onLeave: () => {
        if (triumphParaRef.current) gsap.set(triumphParaRef.current, { visibility: 'hidden' });
      },
      onLeaveBack: () => {
        if (triumphParaRef.current) {
          triumphParaRef.current.style.transform = 'scale(1)';
          triumphParaRef.current.style.opacity = '1';
        }
        if (goldMedalRef.current) gsap.set(goldMedalRef.current, { visibility: 'hidden', x: -window.innerWidth });
      }
    });
    
    currentScrollPx += TRIUMPH_PARA_HOLD_PX + TRIUMPH_PARA_EXIT_PX;

    // ================= MÓDULO MEDALLA DE ORO - HOLD Y SALIDA =================
    const GOLD_MEDAL_HOLD_PX = NOTCH_PX * 4; // Mantener visible 4 notchs
    const GOLD_MEDAL_EXIT_PX = NOTCH_PX * 4; // Transición: oro sale izquierda, plata/bronce entra derecha
    const goldMedalHoldStartPx = triumphParaExitStartPx + TRIUMPH_PARA_EXIT_PX;
    
    // Hold: Mantener el módulo de oro visible y centrado
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${goldMedalHoldStartPx} top`,
      end: `+=${GOLD_MEDAL_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (!goldMedalRef.current) return;
        gsap.set(goldMedalRef.current, { x: 0 });
      }
    });
    
    // Transición: Oro sale izquierda + Plata/Bronce entra derecha
    const goldMedalExitStartPx = goldMedalHoldStartPx + GOLD_MEDAL_HOLD_PX;
    
    if (silverBronzeRef.current) gsap.set(silverBronzeRef.current, { visibility: 'hidden', x: window.innerWidth });
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${goldMedalExitStartPx} top`,
      end: `+=${GOLD_MEDAL_EXIT_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (silverBronzeRef.current) gsap.set(silverBronzeRef.current, { visibility: 'visible' });
      },
      onEnterBack: () => {
        if (goldMedalRef.current) gsap.set(goldMedalRef.current, { visibility: 'visible' });
        if (silverBronzeRef.current) gsap.set(silverBronzeRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        const p = self.progress; // 0 → 1
        const vw = window.innerWidth;
        
        // Módulo de oro sale hacia la izquierda
        if (goldMedalRef.current) {
          const x = -vw * p; // De 0 a -100vw (hacia la izquierda)
          gsap.set(goldMedalRef.current, { x });
        }
        
        // Módulo de plata/bronce entra desde la derecha
        if (silverBronzeRef.current) {
          const x = vw * (1 - p); // De 100vw a 0 (desde la derecha)
          gsap.set(silverBronzeRef.current, { x });
        }
      },
      onLeave: () => {
        if (goldMedalRef.current) gsap.set(goldMedalRef.current, { visibility: 'hidden' });
      },
      onLeaveBack: () => {
        if (goldMedalRef.current) gsap.set(goldMedalRef.current, { x: 0 });
        if (silverBronzeRef.current) gsap.set(silverBronzeRef.current, { visibility: 'hidden', x: window.innerWidth });
      }
    });
    
    currentScrollPx += GOLD_MEDAL_HOLD_PX + GOLD_MEDAL_EXIT_PX;

    // ================= MÓDULO PLATA/BRONCE - HOLD Y SALIDA =================
    const SILVER_BRONZE_HOLD_PX = NOTCH_PX * 4; // Mantener visible 4 notchs
    const SILVER_BRONZE_EXIT_PX = NOTCH_PX * 4; // Transición: plata/bronce sale derecha, tercer mejor entra izquierda
    const silverBronzeHoldStartPx = goldMedalExitStartPx + GOLD_MEDAL_EXIT_PX;
    
    // Hold: Mantener el módulo plata/bronce visible y centrado
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${silverBronzeHoldStartPx} top`,
      end: `+=${SILVER_BRONZE_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (!silverBronzeRef.current) return;
        gsap.set(silverBronzeRef.current, { x: 0 });
      }
    });
    
    // Transición: Plata/Bronce sale derecha + Tercer Mejor entra izquierda
    const silverBronzeExitStartPx = silverBronzeHoldStartPx + SILVER_BRONZE_HOLD_PX;
    
    if (bestBodybuilderRef.current) gsap.set(bestBodybuilderRef.current, { visibility: 'hidden', x: -window.innerWidth });
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${silverBronzeExitStartPx} top`,
      end: `+=${SILVER_BRONZE_EXIT_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (bestBodybuilderRef.current) gsap.set(bestBodybuilderRef.current, { visibility: 'visible' });
      },
      onEnterBack: () => {
        if (silverBronzeRef.current) gsap.set(silverBronzeRef.current, { visibility: 'visible' });
        if (bestBodybuilderRef.current) gsap.set(bestBodybuilderRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        const p = self.progress; // 0 → 1
        const vw = window.innerWidth;
        
        // Módulo de plata/bronce sale hacia la derecha
        if (silverBronzeRef.current) {
          const x = vw * p; // De 0 a 100vw (hacia la derecha)
          gsap.set(silverBronzeRef.current, { x });
        }
        
        // Módulo de tercer mejor entra desde la izquierda
        if (bestBodybuilderRef.current) {
          const x = -vw * (1 - p); // De -100vw a 0 (desde la izquierda)
          gsap.set(bestBodybuilderRef.current, { x });
        }
      },
      onLeave: () => {
        if (silverBronzeRef.current) gsap.set(silverBronzeRef.current, { visibility: 'hidden' });
      },
      onLeaveBack: () => {
        if (silverBronzeRef.current) gsap.set(silverBronzeRef.current, { x: 0 });
        if (bestBodybuilderRef.current) gsap.set(bestBodybuilderRef.current, { visibility: 'hidden', x: -window.innerWidth });
      }
    });
    
    currentScrollPx += SILVER_BRONZE_HOLD_PX + SILVER_BRONZE_EXIT_PX;

    // ================= MÓDULO TERCER MEJOR CULTURISTA - HOLD Y ZOOM OUT =================
    const BEST_BODYBUILDER_HOLD_PX = NOTCH_PX * 4; // Mantener visible 4 notchs
    const BEST_BODYBUILDER_EXIT_PX = NOTCH_PX * 5; // Salida con zoom out
    const bestBodybuilderHoldStartPx = silverBronzeExitStartPx + SILVER_BRONZE_EXIT_PX;
    
    // Hold: Mantener el módulo visible y centrado
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${bestBodybuilderHoldStartPx} top`,
      end: `+=${BEST_BODYBUILDER_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (!bestBodybuilderRef.current) return;
        gsap.set(bestBodybuilderRef.current, { x: 0, scale: 1, opacity: 1 });
      }
    });
    
    // Salida con zoom out + aparición del nuevo párrafo
    const bestBodybuilderExitStartPx = bestBodybuilderHoldStartPx + BEST_BODYBUILDER_HOLD_PX;
    
    if (newMeaningParaRef.current) gsap.set(newMeaningParaRef.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${bestBodybuilderExitStartPx} top`,
      end: `+=${BEST_BODYBUILDER_EXIT_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (newMeaningParaRef.current) gsap.set(newMeaningParaRef.current, { visibility: 'visible' });
      },
      onEnterBack: () => {
        if (bestBodybuilderRef.current) gsap.set(bestBodybuilderRef.current, { visibility: 'visible' });
        if (newMeaningParaRef.current) gsap.set(newMeaningParaRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        const p = self.progress; // 0 → 1
        
        // Módulo del tercer mejor: zoom out y fade out
        if (bestBodybuilderRef.current) {
          const scale = 1 + (p * 1.5); // 1.0 → 2.5 (zoom out)
          const opacity = 1 - p; // 1 → 0 (fade out)
          gsap.set(bestBodybuilderRef.current, { x: 0, scale, opacity });
        }
        
        // Nuevo párrafo: aparece con zoom out (z-index menor, por detrás)
        if (newMeaningParaRef.current) {
          const paraScale = 1.5 - (p * 0.5); // 1.5 → 1.0 (zoom out)
          const paraOpacity = p; // 0 → 1 (fade in)
          gsap.set(newMeaningParaRef.current, { scale: paraScale, opacity: paraOpacity });
        }
      },
      onLeave: () => {
        if (bestBodybuilderRef.current) gsap.set(bestBodybuilderRef.current, { visibility: 'hidden' });
      },
      onLeaveBack: () => {
        if (bestBodybuilderRef.current) gsap.set(bestBodybuilderRef.current, { x: 0, scale: 1, opacity: 1 });
        if (newMeaningParaRef.current) gsap.set(newMeaningParaRef.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
      }
    });
    
    currentScrollPx += BEST_BODYBUILDER_HOLD_PX + BEST_BODYBUILDER_EXIT_PX;

    // ================= PÁRRAFO "PERO ESTA VEZ..." - HOLD Y SALIDA DERECHA =================
    const NEW_MEANING_HOLD_PX = NOTCH_PX * 4; // Mantener visible 4 notchs
    const NEW_MEANING_EXIT_PX = NOTCH_PX * 4; // Salida hacia la derecha
    const newMeaningHoldStartPx = bestBodybuilderExitStartPx + BEST_BODYBUILDER_EXIT_PX;
    
    // Hold: Mantener el párrafo visible y centrado
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${newMeaningHoldStartPx} top`,
      end: `+=${NEW_MEANING_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (!newMeaningParaRef.current) return;
        gsap.set(newMeaningParaRef.current, { x: 0, scale: 1, opacity: 1 });
      }
    });
    
    // Salida hacia la derecha
    const newMeaningExitStartPx = newMeaningHoldStartPx + NEW_MEANING_HOLD_PX;
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${newMeaningExitStartPx} top`,
      end: `+=${NEW_MEANING_EXIT_PX}`,
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!newMeaningParaRef.current) return;
        const p = self.progress; // 0 → 1
        
        // Desplazamiento hacia la derecha
        const xOffset = p * window.innerWidth; // 0 → +100vw (sale por la derecha)
        
        gsap.set(newMeaningParaRef.current, { x: xOffset, scale: 1, opacity: 1 });
      },
      onLeave: () => {
        if (newMeaningParaRef.current) gsap.set(newMeaningParaRef.current, { visibility: 'hidden' });
      },
      onEnterBack: () => {
        if (newMeaningParaRef.current) gsap.set(newMeaningParaRef.current, { visibility: 'visible' });
      },
      onLeaveBack: () => {
        if (newMeaningParaRef.current) gsap.set(newMeaningParaRef.current, { x: 0, scale: 1, opacity: 1 });
      }
    });
    
    currentScrollPx += NEW_MEANING_HOLD_PX + NEW_MEANING_EXIT_PX;

    // ================= PÁRRAFO "ESE MISMO AÑO, FUE INVITADO A LA INDIA..." - ENTRADA DESDE DERECHA CON TYPEWRITER =================
    const indiaParaText = t.indiaParagraph;
    const INDIA_PARA_ENTRY_PX = NOTCH_PX * 4; // Entrada desde la derecha
    const INDIA_PARA_TYPE_PX = NOTCH_PX * 8; // Efecto de escritura
    const indiaParaEntryStartPx = newMeaningExitStartPx + NEW_MEANING_EXIT_PX;
    
    if (indiaParaRef.current) gsap.set(indiaParaRef.current, { visibility: 'hidden', x: window.innerWidth });
    
    // Entrada desde la derecha
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${indiaParaEntryStartPx} top`,
      end: `+=${INDIA_PARA_ENTRY_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (indiaParaRef.current) gsap.set(indiaParaRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        if (!indiaParaRef.current) return;
        const p = self.progress; // 0 → 1
        
        // Entrada desde la derecha
        const xOffset = (1 - p) * window.innerWidth; // 100vw → 0 (entra desde la derecha)
        
        gsap.set(indiaParaRef.current, { x: xOffset });
      },
      onLeaveBack: () => {
        if (indiaParaRef.current) {
          gsap.set(indiaParaRef.current, { visibility: 'hidden', x: window.innerWidth });
          const textEl = indiaParaRef.current.querySelector('p');
          if (textEl) textEl.textContent = '';
        }
      }
    });
    
    // Efecto typewriter sincronizado con el scroll
    const indiaParaTypeStartPx = indiaParaEntryStartPx + INDIA_PARA_ENTRY_PX;
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${indiaParaTypeStartPx} top`,
      end: `+=${INDIA_PARA_TYPE_PX}`,
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!indiaParaRef.current) return;
        const p = self.progress; // 0 → 1
        
        // Mantener centrado
        gsap.set(indiaParaRef.current, { x: 0 });
        
        // Efecto typewriter
        const textEl = indiaParaRef.current.querySelector('p');
        if (textEl) {
          const charsToShow = Math.floor(p * indiaParaText.length);
          textEl.textContent = indiaParaText.substring(0, charsToShow);
        }
      },
      onLeaveBack: () => {
        if (indiaParaRef.current) {
          const textEl = indiaParaRef.current.querySelector('p');
          if (textEl) textEl.textContent = '';
          gsap.set(indiaParaRef.current, { x: 0 });
        }
      }
    });
    
    currentScrollPx += INDIA_PARA_ENTRY_PX + INDIA_PARA_TYPE_PX;

    // ================= PÁRRAFO INDIA - HOLD Y SALIDA IZQUIERDA =================
    const INDIA_PARA_HOLD_PX = NOTCH_PX * 4; // Mantener visible 4 notchs
    const INDIA_PARA_EXIT_PX = NOTCH_PX * 4; // Salida hacia la izquierda
    const indiaParaHoldStartPx = indiaParaTypeStartPx + INDIA_PARA_TYPE_PX;
    
    // Hold: Mantener el párrafo visible y centrado con el texto completo
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${indiaParaHoldStartPx} top`,
      end: `+=${INDIA_PARA_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (!indiaParaRef.current) return;
        gsap.set(indiaParaRef.current, { x: 0 });
        const textEl = indiaParaRef.current.querySelector('p');
        if (textEl && textEl.textContent !== indiaParaText) {
          textEl.textContent = indiaParaText;
        }
      }
    });
    
    // Salida hacia la izquierda
    const indiaParaExitStartPx = indiaParaHoldStartPx + INDIA_PARA_HOLD_PX;
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${indiaParaExitStartPx} top`,
      end: `+=${INDIA_PARA_EXIT_PX}`,
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!indiaParaRef.current) return;
        const p = self.progress; // 0 → 1
        
        // Desplazamiento hacia la izquierda
        const xOffset = -p * window.innerWidth; // 0 → -100vw (sale por la izquierda)
        
        gsap.set(indiaParaRef.current, { x: xOffset });
        
        // Mantener el texto completo
        const textEl = indiaParaRef.current.querySelector('p');
        if (textEl && textEl.textContent !== indiaParaText) {
          textEl.textContent = indiaParaText;
        }
      },
      onLeave: () => {
        if (indiaParaRef.current) gsap.set(indiaParaRef.current, { visibility: 'hidden' });
      },
      onEnterBack: () => {
        if (indiaParaRef.current) gsap.set(indiaParaRef.current, { visibility: 'visible' });
      },
      onLeaveBack: () => {
        if (indiaParaRef.current) {
          gsap.set(indiaParaRef.current, { x: 0 });
          const textEl = indiaParaRef.current.querySelector('p');
          if (textEl) textEl.textContent = indiaParaText;
        }
      }
    });
    
    currentScrollPx += INDIA_PARA_HOLD_PX + INDIA_PARA_EXIT_PX;

    // ================= IMAGEN BERNAT-STAGE - ENTRADA DESDE IZQUIERDA =================
    const STAGE_IMAGE_ENTRY_PX = NOTCH_PX * 4; // Entrada desde la izquierda
    const STAGE_IMAGE_HOLD_PX = NOTCH_PX * 4; // Mantener visible
    const stageImageEntryStartPx = indiaParaExitStartPx + INDIA_PARA_EXIT_PX;
    
    if (stageImageRef.current) gsap.set(stageImageRef.current, { visibility: 'hidden', x: -window.innerWidth });
    
    // Entrada desde la izquierda
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${stageImageEntryStartPx} top`,
      end: `+=${STAGE_IMAGE_ENTRY_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (stageImageRef.current) gsap.set(stageImageRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        if (!stageImageRef.current) return;
        const p = self.progress; // 0 → 1
        
        // Entrada desde la izquierda
        const xOffset = (-1 + p) * window.innerWidth; // -100vw → 0 (entra desde la izquierda)
        
        gsap.set(stageImageRef.current, { x: xOffset });
      },
      onLeaveBack: () => {
        if (stageImageRef.current) gsap.set(stageImageRef.current, { visibility: 'hidden', x: -window.innerWidth });
      }
    });
    
    // Hold: Mantener la imagen visible y centrada
    const stageImageHoldStartPx = stageImageEntryStartPx + STAGE_IMAGE_ENTRY_PX;
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${stageImageHoldStartPx} top`,
      end: `+=${STAGE_IMAGE_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (!stageImageRef.current) return;
        gsap.set(stageImageRef.current, { x: 0 });
      }
    });
    
    // Salida hacia la izquierda
    const STAGE_IMAGE_EXIT_PX = NOTCH_PX * 4; // Salida hacia la izquierda
    const stageImageExitStartPx = stageImageHoldStartPx + STAGE_IMAGE_HOLD_PX;
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${stageImageExitStartPx} top`,
      end: `+=${STAGE_IMAGE_EXIT_PX}`,
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!stageImageRef.current) return;
        const p = self.progress; // 0 → 1
        
        // Desplazamiento hacia la izquierda
        const xOffset = -p * window.innerWidth; // 0 → -100vw (sale por la izquierda)
        
        gsap.set(stageImageRef.current, { x: xOffset });
      },
      onLeave: () => {
        if (stageImageRef.current) gsap.set(stageImageRef.current, { visibility: 'hidden' });
      },
      onEnterBack: () => {
        if (stageImageRef.current) gsap.set(stageImageRef.current, { visibility: 'visible' });
      },
      onLeaveBack: () => {
        if (stageImageRef.current) gsap.set(stageImageRef.current, { x: 0 });
      }
    });
    
    currentScrollPx += STAGE_IMAGE_ENTRY_PX + STAGE_IMAGE_HOLD_PX + STAGE_IMAGE_EXIT_PX;

    // ================= IMAGEN BERNAT-FAMILY - ENTRADA DESDE DERECHA =================
    const FAMILY_IMAGE_ENTRY_PX = NOTCH_PX * 4; // Entrada desde la derecha
    const FAMILY_IMAGE_HOLD_PX = NOTCH_PX * 4; // Mantener visible
    const familyImageEntryStartPx = stageImageExitStartPx + STAGE_IMAGE_EXIT_PX;
    
    if (familyImageRef.current) gsap.set(familyImageRef.current, { visibility: 'hidden', x: window.innerWidth });
    
    // Entrada desde la derecha
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${familyImageEntryStartPx} top`,
      end: `+=${FAMILY_IMAGE_ENTRY_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (familyImageRef.current) gsap.set(familyImageRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        if (!familyImageRef.current) return;
        const p = self.progress; // 0 → 1
        
        // Entrada desde la derecha
        const xOffset = (1 - p) * window.innerWidth; // 100vw → 0 (entra desde la derecha)
        
        gsap.set(familyImageRef.current, { x: xOffset });
      },
      onLeaveBack: () => {
        if (familyImageRef.current) gsap.set(familyImageRef.current, { visibility: 'hidden', x: window.innerWidth });
      }
    });
    
    // Hold: Mantener la imagen visible y centrada
    const familyImageHoldStartPx = familyImageEntryStartPx + FAMILY_IMAGE_ENTRY_PX;
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${familyImageHoldStartPx} top`,
      end: `+=${FAMILY_IMAGE_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (!familyImageRef.current) return;
        gsap.set(familyImageRef.current, { x: 0 });
      }
    });
    
    // Salida hacia la derecha + aparición del H2 "Mi Filosofía"
    const FAMILY_IMAGE_EXIT_PX = NOTCH_PX * 4; // Salida hacia la derecha
    const familyImageExitStartPx = familyImageHoldStartPx + FAMILY_IMAGE_HOLD_PX;
    
    if (philosophyTextRef.current) gsap.set(philosophyTextRef.current, { visibility: 'hidden', scale: 1.8, opacity: 0 });
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${familyImageExitStartPx} top`,
      end: `+=${FAMILY_IMAGE_EXIT_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (philosophyTextRef.current) gsap.set(philosophyTextRef.current, { visibility: 'visible' });
      },
      onEnterBack: () => {
        if (familyImageRef.current) gsap.set(familyImageRef.current, { visibility: 'visible' });
        if (philosophyTextRef.current) gsap.set(philosophyTextRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        const p = self.progress; // 0 → 1
        
        // Imagen sale hacia la derecha
        if (familyImageRef.current) {
          const xOffset = p * window.innerWidth; // 0 → +100vw (sale por la derecha)
          gsap.set(familyImageRef.current, { x: xOffset });
        }
        
        // H2 "Mi Filosofía" aparece con zoom out épico desde el centro (z-index menor, por detrás)
        if (philosophyTextRef.current) {
          const scale = 1.8 - (p * 0.8); // 1.8 → 1.0 (zoom out)
          const opacity = p; // 0 → 1 (fade in)
          const blur = 12 - (p * 12); // 12px → 0px (desenfoque a enfoque)
          
          gsap.set(philosophyTextRef.current, { 
            scale, 
            opacity,
            filter: `blur(${blur}px)`
          });
        }
      },
      onLeave: () => {
        if (familyImageRef.current) gsap.set(familyImageRef.current, { visibility: 'hidden' });
      },
      onLeaveBack: () => {
        if (familyImageRef.current) gsap.set(familyImageRef.current, { x: 0 });
        if (philosophyTextRef.current) gsap.set(philosophyTextRef.current, { visibility: 'hidden', scale: 1.8, opacity: 0 });
      }
    });
    
    currentScrollPx += FAMILY_IMAGE_ENTRY_PX + FAMILY_IMAGE_HOLD_PX + FAMILY_IMAGE_EXIT_PX;

    // ================= H2 "MI FILOSOFÍA" - HOLD =================
    const PHILOSOPHY_HOLD_PX = NOTCH_PX * 5; // Mantener visible 5 notchs
    const philosophyHoldStartPx = familyImageExitStartPx + FAMILY_IMAGE_EXIT_PX;
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${philosophyHoldStartPx} top`,
      end: `+=${PHILOSOPHY_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (!philosophyTextRef.current) return;
        gsap.set(philosophyTextRef.current, { scale: 1.0, opacity: 1, filter: 'blur(0px)' });
      }
    });
    
    currentScrollPx += PHILOSOPHY_HOLD_PX;

    // ================= H2 "MI FILOSOFÍA" - SALIDA DESFRAGMENTADA + ENTRADA PÁRRAFO SCORUS =================
    const PHILOSOPHY_EXIT_PX = NOTCH_PX * 5; // Salida desfragmentada
    const philosophyExitStartPx = philosophyHoldStartPx + PHILOSOPHY_HOLD_PX;
    
    // Vectores de dispersión para cada palabra (posiciones extremas fuera del viewport)
    const philosophyVectors = [
      { x: -2000, y: -1500, rot: -180 }, // "Mi" - arriba izquierda
      { x: 2000, y: -1200, rot: 220 },   // "Filosofía:" - arriba derecha
      { x: -1800, y: 800, rot: -140 },   // "Más" - abajo izquierda
      { x: 2200, y: 1000, rot: 160 },    // "Allá" - abajo derecha
      { x: -2100, y: 0, rot: -190 },     // "del" - izquierda centro
      { x: 2300, y: 500, rot: 200 }      // "Fitness" - derecha centro abajo
    ];
    
    if (scorusParaRef.current) gsap.set(scorusParaRef.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${philosophyExitStartPx} top`,
      end: `+=${PHILOSOPHY_EXIT_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (scorusParaRef.current) gsap.set(scorusParaRef.current, { visibility: 'visible' });
      },
      onEnterBack: () => {
        if (philosophyTextRef.current) gsap.set(philosophyTextRef.current, { visibility: 'visible' });
        if (scorusParaRef.current) gsap.set(scorusParaRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        const p = self.progress; // 0 → 1
        
        // Desfragmentación de palabras (dispersión radial)
        const wordRefs = [
          philosophyWord1Ref,
          philosophyWord2Ref,
          philosophyWord3Ref,
          philosophyWord4Ref,
          philosophyWord5Ref,
          philosophyWord6Ref
        ];
        
        wordRefs.forEach((ref, index) => {
          if (ref.current) {
            const vector = philosophyVectors[index];
            const x = p * vector.x; // 0 → posición extrema
            const y = p * vector.y;
            const rot = p * vector.rot; // 0 → rotación extrema
            const scale = 1 - (p * 0.5); // 1.0 → 0.5 (se encoge)
            const opacity = 1 - p; // 1 → 0 (fade out)
            
            gsap.set(ref.current, {
              x,
              y,
              rotation: rot,
              scale,
              opacity
            });
          }
        });
        
        // Nuevo párrafo aparece con zoom in por detrás (z-index menor)
        if (scorusParaRef.current) {
          const paraScale = 1.5 - (p * 0.5); // 1.5 → 1.0 (zoom in)
          const paraOpacity = p; // 0 → 1 (fade in)
          
          gsap.set(scorusParaRef.current, {
            scale: paraScale,
            opacity: paraOpacity
          });
        }
      },
      onLeave: () => {
        if (philosophyTextRef.current) gsap.set(philosophyTextRef.current, { visibility: 'hidden' });
      },
      onLeaveBack: () => {
        if (philosophyTextRef.current) gsap.set(philosophyTextRef.current, { scale: 1.0, opacity: 1, filter: 'blur(0px)' });
        if (scorusParaRef.current) gsap.set(scorusParaRef.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
        
        // Reset de palabras
        const wordRefs = [
          philosophyWord1Ref,
          philosophyWord2Ref,
          philosophyWord3Ref,
          philosophyWord4Ref,
          philosophyWord5Ref,
          philosophyWord6Ref
        ];
        
        wordRefs.forEach((ref) => {
          if (ref.current) {
            gsap.set(ref.current, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 });
          }
        });
      }
    });
    
    currentScrollPx += PHILOSOPHY_EXIT_PX;

    // ================= PÁRRAFO SCORUS - HOLD Y SALIDA ZOOM OUT + ENTRADA MÓDULO ENTRENAMIENTO =================
    const SCORUS_PARA_HOLD_PX = NOTCH_PX * 4; // Mantener visible 4 notchs
    const SCORUS_PARA_EXIT_PX = NOTCH_PX * 4; // Salida con zoom out
    const scorusParaHoldStartPx = philosophyExitStartPx + PHILOSOPHY_EXIT_PX;
    
    // Hold: Mantener el párrafo visible
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${scorusParaHoldStartPx} top`,
      end: `+=${SCORUS_PARA_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (!scorusParaRef.current) return;
        gsap.set(scorusParaRef.current, { scale: 1.0, opacity: 1 });
      }
    });
    
    // Salida con zoom out + entrada del módulo de entrenamiento
    const scorusParaExitStartPx = scorusParaHoldStartPx + SCORUS_PARA_HOLD_PX;
    
    if (trainingModuleRef.current) gsap.set(trainingModuleRef.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${scorusParaExitStartPx} top`,
      end: `+=${SCORUS_PARA_EXIT_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (trainingModuleRef.current) gsap.set(trainingModuleRef.current, { visibility: 'visible' });
      },
      onEnterBack: () => {
        if (scorusParaRef.current) gsap.set(scorusParaRef.current, { visibility: 'visible' });
        if (trainingModuleRef.current) gsap.set(trainingModuleRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        const p = self.progress; // 0 → 1
        
        // Párrafo Scorus: zoom out y fade out
        if (scorusParaRef.current) {
          const scale = 1 + (p * 1.5); // 1.0 → 2.5 (zoom out)
          const opacity = 1 - p; // 1 → 0 (fade out)
          gsap.set(scorusParaRef.current, { scale, opacity });
        }
        
        // Módulo entrenamiento: aparece con zoom out (z-index menor, por detrás)
        if (trainingModuleRef.current) {
          const moduleScale = 1.5 - (p * 0.5); // 1.5 → 1.0 (zoom out)
          const moduleOpacity = p; // 0 → 1 (fade in)
          gsap.set(trainingModuleRef.current, { scale: moduleScale, opacity: moduleOpacity });
        }
      },
      onLeave: () => {
        if (scorusParaRef.current) gsap.set(scorusParaRef.current, { visibility: 'hidden' });
      },
      onLeaveBack: () => {
        if (scorusParaRef.current) gsap.set(scorusParaRef.current, { scale: 1.0, opacity: 1 });
        if (trainingModuleRef.current) gsap.set(trainingModuleRef.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
      }
    });
    
    currentScrollPx += SCORUS_PARA_HOLD_PX + SCORUS_PARA_EXIT_PX;

    // ================= MÓDULO ENTRENAMIENTO - HOLD Y TRANSICIÓN A NUTRICIÓN =================
    const TRAINING_HOLD_PX = NOTCH_PX * 4;
    const TRAINING_EXIT_PX = NOTCH_PX * 4;
    const trainingHoldStartPx = scorusParaExitStartPx + SCORUS_PARA_EXIT_PX;
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${trainingHoldStartPx} top`,
      end: `+=${TRAINING_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (!trainingModuleRef.current) return;
        gsap.set(trainingModuleRef.current, { scale: 1.0, opacity: 1 });
      }
    });
    
    const trainingExitStartPx = trainingHoldStartPx + TRAINING_HOLD_PX;
    if (nutritionModuleRef.current) gsap.set(nutritionModuleRef.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${trainingExitStartPx} top`,
      end: `+=${TRAINING_EXIT_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (nutritionModuleRef.current) gsap.set(nutritionModuleRef.current, { visibility: 'visible' });
      },
      onEnterBack: () => {
        if (trainingModuleRef.current) gsap.set(trainingModuleRef.current, { visibility: 'visible' });
        if (nutritionModuleRef.current) gsap.set(nutritionModuleRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        const p = self.progress;
        if (trainingModuleRef.current) {
          const scale = 1 + (p * 1.5);
          const opacity = 1 - p;
          gsap.set(trainingModuleRef.current, { scale, opacity });
        }
        if (nutritionModuleRef.current) {
          const scale = 1.5 - (p * 0.5);
          const opacity = p;
          gsap.set(nutritionModuleRef.current, { scale, opacity });
        }
      },
      onLeave: () => {
        if (trainingModuleRef.current) gsap.set(trainingModuleRef.current, { visibility: 'hidden' });
      },
      onLeaveBack: () => {
        if (trainingModuleRef.current) gsap.set(trainingModuleRef.current, { scale: 1.0, opacity: 1 });
        if (nutritionModuleRef.current) gsap.set(nutritionModuleRef.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
      }
    });
    
    currentScrollPx += TRAINING_HOLD_PX + TRAINING_EXIT_PX;

    // ================= MÓDULO NUTRICIÓN - HOLD Y TRANSICIÓN A SEGUIMIENTO =================
    const NUTRITION_HOLD_PX = NOTCH_PX * 4;
    const NUTRITION_EXIT_PX = NOTCH_PX * 4;
    const nutritionHoldStartPx = trainingExitStartPx + TRAINING_EXIT_PX;
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${nutritionHoldStartPx} top`,
      end: `+=${NUTRITION_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (!nutritionModuleRef.current) return;
        gsap.set(nutritionModuleRef.current, { scale: 1.0, opacity: 1 });
      }
    });
    
    const nutritionExitStartPx = nutritionHoldStartPx + NUTRITION_HOLD_PX;
    if (trackingModuleRef.current) gsap.set(trackingModuleRef.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${nutritionExitStartPx} top`,
      end: `+=${NUTRITION_EXIT_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (trackingModuleRef.current) gsap.set(trackingModuleRef.current, { visibility: 'visible' });
      },
      onEnterBack: () => {
        if (nutritionModuleRef.current) gsap.set(nutritionModuleRef.current, { visibility: 'visible' });
        if (trackingModuleRef.current) gsap.set(trackingModuleRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        const p = self.progress;
        if (nutritionModuleRef.current) {
          const scale = 1 + (p * 1.5);
          const opacity = 1 - p;
          gsap.set(nutritionModuleRef.current, { scale, opacity });
        }
        if (trackingModuleRef.current) {
          const scale = 1.5 - (p * 0.5);
          const opacity = p;
          gsap.set(trackingModuleRef.current, { scale, opacity });
        }
      },
      onLeave: () => {
        if (nutritionModuleRef.current) gsap.set(nutritionModuleRef.current, { visibility: 'hidden' });
      },
      onLeaveBack: () => {
        if (nutritionModuleRef.current) gsap.set(nutritionModuleRef.current, { scale: 1.0, opacity: 1 });
        if (trackingModuleRef.current) gsap.set(trackingModuleRef.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
      }
    });
    
    currentScrollPx += NUTRITION_HOLD_PX + NUTRITION_EXIT_PX;

    // ================= MÓDULO SEGUIMIENTO - HOLD Y TRANSICIÓN A REBORN =================
    const TRACKING_HOLD_PX = NOTCH_PX * 4;
    const TRACKING_EXIT_PX = NOTCH_PX * 4;
    const trackingHoldStartPx = nutritionExitStartPx + NUTRITION_EXIT_PX;
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${trackingHoldStartPx} top`,
      end: `+=${TRACKING_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (!trackingModuleRef.current) return;
        gsap.set(trackingModuleRef.current, { scale: 1.0, opacity: 1 });
      }
    });
    
    const trackingExitStartPx = trackingHoldStartPx + TRACKING_HOLD_PX;
    if (rebornModuleRef.current) gsap.set(rebornModuleRef.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${trackingExitStartPx} top`,
      end: `+=${TRACKING_EXIT_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (rebornModuleRef.current) gsap.set(rebornModuleRef.current, { visibility: 'visible' });
      },
      onEnterBack: () => {
        if (trackingModuleRef.current) gsap.set(trackingModuleRef.current, { visibility: 'visible' });
        if (rebornModuleRef.current) gsap.set(rebornModuleRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        const p = self.progress;
        if (trackingModuleRef.current) {
          const scale = 1 + (p * 1.5);
          const opacity = 1 - p;
          gsap.set(trackingModuleRef.current, { scale, opacity });
        }
        if (rebornModuleRef.current) {
          const scale = 1.5 - (p * 0.5);
          const opacity = p;
          gsap.set(rebornModuleRef.current, { scale, opacity });
        }
      },
      onLeave: () => {
        if (trackingModuleRef.current) gsap.set(trackingModuleRef.current, { visibility: 'hidden' });
      },
      onLeaveBack: () => {
        if (trackingModuleRef.current) gsap.set(trackingModuleRef.current, { scale: 1.0, opacity: 1 });
        if (rebornModuleRef.current) gsap.set(rebornModuleRef.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
      }
    });
    
    currentScrollPx += TRACKING_HOLD_PX + TRACKING_EXIT_PX;

    // ================= MÓDULO REBORN - HOLD Y TRANSICIÓN A SCORUS GYM =================
    const REBORN_HOLD_PX = NOTCH_PX * 4;
    const REBORN_EXIT_PX = NOTCH_PX * 4;
    const rebornHoldStartPx = trackingExitStartPx + TRACKING_EXIT_PX;
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${rebornHoldStartPx} top`,
      end: `+=${REBORN_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (!rebornModuleRef.current) return;
        gsap.set(rebornModuleRef.current, { scale: 1.0, opacity: 1 });
      }
    });
    
    const rebornExitStartPx = rebornHoldStartPx + REBORN_HOLD_PX;
    if (scorusGymModuleRef.current) gsap.set(scorusGymModuleRef.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${rebornExitStartPx} top`,
      end: `+=${REBORN_EXIT_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (scorusGymModuleRef.current) gsap.set(scorusGymModuleRef.current, { visibility: 'visible' });
      },
      onEnterBack: () => {
        if (rebornModuleRef.current) gsap.set(rebornModuleRef.current, { visibility: 'visible' });
        if (scorusGymModuleRef.current) gsap.set(scorusGymModuleRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        const p = self.progress;
        if (rebornModuleRef.current) {
          const scale = 1 + (p * 1.5);
          const opacity = 1 - p;
          gsap.set(rebornModuleRef.current, { scale, opacity });
        }
        if (scorusGymModuleRef.current) {
          const scale = 1.5 - (p * 0.5);
          const opacity = p;
          gsap.set(scorusGymModuleRef.current, { scale, opacity });
        }
      },
      onLeave: () => {
        if (rebornModuleRef.current) gsap.set(rebornModuleRef.current, { visibility: 'hidden' });
      },
      onLeaveBack: () => {
        if (rebornModuleRef.current) gsap.set(rebornModuleRef.current, { scale: 1.0, opacity: 1 });
        if (scorusGymModuleRef.current) gsap.set(scorusGymModuleRef.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
      }
    });
    
    currentScrollPx += REBORN_HOLD_PX + REBORN_EXIT_PX;

    // ================= MÓDULO SCORUS GYM - HOLD Y EXIT =================
    const SCORUS_GYM_HOLD_PX = NOTCH_PX * 5;
    const SCORUS_GYM_EXIT_PX = NOTCH_PX * 5; // Duración del zoom out de salida
    const scorusGymHoldStartPx = rebornExitStartPx + REBORN_EXIT_PX;
    
    // Hold: mantener visible
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${scorusGymHoldStartPx} top`,
      end: `+=${SCORUS_GYM_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (!scorusGymModuleRef.current) return;
        gsap.set(scorusGymModuleRef.current, { scale: 1.0, opacity: 1 });
      }
    });
    
    const scorusGymExitStartPx = scorusGymHoldStartPx + SCORUS_GYM_HOLD_PX;
    
    // Exit: zoom out épico
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${scorusGymExitStartPx} top`,
      end: `+=${SCORUS_GYM_EXIT_PX}`,
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!scorusGymModuleRef.current) return;
        // Zoom out: escala de 1.0 a 2.5, opacidad de 1 a 0
        const scale = 1.0 + (self.progress * 1.5); // 1.0 → 2.5
        const opacity = 1 - self.progress; // 1 → 0
        gsap.set(scorusGymModuleRef.current, { scale, opacity });
      },
      onLeaveBack: () => {
        if (scorusGymModuleRef.current) {
          gsap.set(scorusGymModuleRef.current, { scale: 1.0, opacity: 1 });
        }
      },
      onLeave: () => {
        if (scorusGymModuleRef.current) {
          gsap.set(scorusGymModuleRef.current, { visibility: 'hidden' });
        }
      }
    });
    
    currentScrollPx += SCORUS_GYM_HOLD_PX + SCORUS_GYM_EXIT_PX;

    // ================= PÁRRAFO HOLÍSTICO - APARECE CON ZOOM OUT =================
    const HOLISTIC_ENTRY_PX = NOTCH_PX * 5; // Duración del zoom out de entrada
    const HOLISTIC_HOLD_PX = NOTCH_PX * 4; // Mantener visible
    const holisticEntryStartPx = scorusGymExitStartPx + SCORUS_GYM_EXIT_PX;
    
    // Estado inicial: oculto, escalado grande
    if (holisticParaRef.current) {
      gsap.set(holisticParaRef.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
    }
    
    // Entry: zoom out (aparece detrás del módulo ScorusGYM que sale)
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${holisticEntryStartPx} top`,
      end: `+=${HOLISTIC_ENTRY_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        if (holisticParaRef.current) gsap.set(holisticParaRef.current, { visibility: 'visible' });
      },
      onUpdate: (self) => {
        if (!holisticParaRef.current) return;
        // Zoom out: escala de 1.5 a 1.0, opacidad de 0 a 1
        const scale = 1.5 - (self.progress * 0.5); // 1.5 → 1.0
        const opacity = self.progress; // 0 → 1
        gsap.set(holisticParaRef.current, { scale, opacity });
      },
      onLeaveBack: () => {
        if (holisticParaRef.current) {
          gsap.set(holisticParaRef.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
        }
      }
    });
    
    const holisticHoldStartPx = holisticEntryStartPx + HOLISTIC_ENTRY_PX;
    
    // Hold: mantener visible
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${holisticHoldStartPx} top`,
      end: `+=${HOLISTIC_HOLD_PX}`,
      scrub: scrubValue,
      onUpdate: () => {
        if (!holisticParaRef.current) return;
        gsap.set(holisticParaRef.current, { scale: 1.0, opacity: 1 });
      }
    });
    
    const holisticExitStartPx = holisticHoldStartPx + HOLISTIC_HOLD_PX;
    const HOLISTIC_EXIT_PX = NOTCH_PX * 5; // Duración del zoom out de salida
    
    // Exit: zoom out épico
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${holisticExitStartPx} top`,
      end: `+=${HOLISTIC_EXIT_PX}`,
      scrub: scrubValue,
      onUpdate: (self) => {
        if (!holisticParaRef.current) return;
        // Zoom out: escala de 1.0 a 2.5, opacidad de 1 a 0
        const scale = 1.0 + (self.progress * 1.5); // 1.0 → 2.5
        const opacity = 1 - self.progress; // 1 → 0
        gsap.set(holisticParaRef.current, { scale, opacity });
      },
      onLeaveBack: () => {
        if (holisticParaRef.current) {
          gsap.set(holisticParaRef.current, { scale: 1.0, opacity: 1 });
        }
      },
      onLeave: () => {
        if (holisticParaRef.current) {
          gsap.set(holisticParaRef.current, { visibility: 'hidden' });
        }
      }
    });
    
    currentScrollPx += HOLISTIC_ENTRY_PX + HOLISTIC_HOLD_PX + HOLISTIC_EXIT_PX;

    // ================= ANIMACIÓN GEOMÉTRICA DE CIERRE ÉPICA =================
    const GEOMETRIC_CLOSURE_PX = NOTCH_PX * 20; // Animación larga y épica (20 notches)
    const geometricClosureStartPx = holisticExitStartPx + HOLISTIC_EXIT_PX;
    
    // Estado inicial: piezas geométricas invisibles, fondo negro invisible, CTA invisible
    if (geometricClosureRef.current) {
      gsap.set(geometricClosureRef.current, { visibility: 'hidden' });
    }
    if (finalBlackBgRef.current) {
      gsap.set(finalBlackBgRef.current, { visibility: 'hidden', opacity: 0 });
    }
    if (finalCtaRef.current) {
      gsap.set(finalCtaRef.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
    }
    
    // Animación de cierre geométrico (épica y progresiva)
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${geometricClosureStartPx} top`,
      end: `+=${GEOMETRIC_CLOSURE_PX}`,
      scrub: 0.5, // Scrub más rápido para efecto épico
      onEnter: () => {
        if (geometricClosureRef.current) {
          gsap.set(geometricClosureRef.current, { visibility: 'visible' });
        }
        if (finalBlackBgRef.current) {
          gsap.set(finalBlackBgRef.current, { visibility: 'visible' });
        }
        if (finalCtaRef.current) {
          gsap.set(finalCtaRef.current, { visibility: 'visible' });
        }
      },
      onUpdate: (self) => {
        if (!geometricClosureRef.current) return;
        
        // El fondo negro aparece gradualmente detrás de las piezas
        if (finalBlackBgRef.current) {
          const bgOpacity = self.progress; // 0 → 1
          gsap.set(finalBlackBgRef.current, { opacity: bgOpacity });
        }
        
        // El CTA aparece en la segunda mitad y PERMANECE VISIBLE
        if (finalCtaRef.current) {
          if (self.progress < 0.5) {
            // Primera mitad: oculto
            gsap.set(finalCtaRef.current, { scale: 1.5, opacity: 0 });
          } else {
            // Segunda mitad: aparece con zoom out
            const ctaProgress = (self.progress - 0.5) / 0.5; // 0 → 1
            const scale = 1.5 - (ctaProgress * 0.5); // 1.5 → 1.0
            const opacity = ctaProgress; // 0 → 1
            gsap.set(finalCtaRef.current, { scale, opacity });
          }
        }
        
        // Seleccionar todas las piezas geométricas
        const pieces = geometricClosureRef.current.querySelectorAll('.geo-piece');
        
        pieces.forEach((piece, index) => {
          const totalPieces = pieces.length;
          
          // Determinar dirección de entrada de la pieza
          const direction = piece.getAttribute('data-direction');
          
          // Progreso individual escalonado para efecto dramático
          const pieceDelay = (index / totalPieces) * 0.25; // 25% de delay máximo
          const adjustedProgress = Math.max(0, Math.min(1, (self.progress - pieceDelay) / (1 - pieceDelay)));
          
          // Ease dramático (ease-out-cubic para entrada suave pero impactante)
          const easedProgress = 1 - Math.pow(1 - adjustedProgress, 3);
          
          // Calcular posición según dirección
          let translateX = 0;
          let translateY = 0;
          
          if (direction === 'top') {
            translateY = -100 + (easedProgress * 100); // -100% → 0%
          } else if (direction === 'bottom') {
            translateY = 100 - (easedProgress * 100); // 100% → 0%
          } else if (direction === 'left') {
            translateX = -100 + (easedProgress * 100); // -100% → 0%
          } else if (direction === 'right') {
            translateX = 100 - (easedProgress * 100); // 100% → 0%
          } else if (direction === 'top-left') {
            translateX = -100 + (easedProgress * 100);
            translateY = -100 + (easedProgress * 100);
          } else if (direction === 'top-right') {
            translateX = 100 - (easedProgress * 100);
            translateY = -100 + (easedProgress * 100);
          } else if (direction === 'bottom-left') {
            translateX = -100 + (easedProgress * 100);
            translateY = 100 - (easedProgress * 100);
          } else if (direction === 'bottom-right') {
            translateX = 100 - (easedProgress * 100);
            translateY = 100 - (easedProgress * 100);
          }
          
          // Aplicar transformación con rotación sutil para efecto más dinámico
          const rotation = (1 - easedProgress) * 5 * (index % 2 === 0 ? 1 : -1); // Rotación sutil
          gsap.set(piece, {
            x: `${translateX}%`,
            y: `${translateY}%`,
            rotation: rotation,
            opacity: 1
          });
        });
      },
      onLeaveBack: () => {
        if (geometricClosureRef.current) {
          gsap.set(geometricClosureRef.current, { visibility: 'hidden' });
        }
        if (finalBlackBgRef.current) {
          gsap.set(finalBlackBgRef.current, { visibility: 'hidden', opacity: 0 });
        }
        if (finalCtaRef.current) {
          gsap.set(finalCtaRef.current, { visibility: 'hidden', scale: 1.5, opacity: 0 });
        }
      },
      onLeave: () => {
        // Al salir, el CTA PERMANECE VISIBLE para siempre
        if (finalCtaRef.current) {
          gsap.set(finalCtaRef.current, { scale: 1.0, opacity: 1, visibility: 'visible' });
        }
      }
    });
    
    currentScrollPx += GEOMETRIC_CLOSURE_PX;

    // ================= OCULTAR CONTAINERREF PARA MOSTRAR FOOTER =================
    // Después de la animación geométrica, ocultamos el containerRef para que el footer sea visible
    // EL CTA PERMANECE VISIBLE durante todo este proceso
    const FINAL_HIDE_PX = NOTCH_PX * 2; // Solo 2 notches para transición rápida
    
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${geometricClosureStartPx + GEOMETRIC_CLOSURE_PX} top`,
      end: `+=${FINAL_HIDE_PX}`,
      scrub: scrubValue,
      onUpdate: (self) => {
        // Desvanecer el containerRef gradualmente
        if (containerRef.current) {
          const opacity = 1 - self.progress; // 1 → 0
          gsap.set(containerRef.current, { opacity });
        }
        // EL CTA PERMANECE VISIBLE - NO SE DESVANECE
        if (finalCtaRef.current) {
          gsap.set(finalCtaRef.current, { 
            scale: 1.0, 
            opacity: 1, 
            visibility: 'visible',
            pointerEvents: 'auto'
          });
        }
      },
      onLeave: () => {
        // Al salir, ocultar completamente el containerRef para que no bloquee el footer
        if (containerRef.current) {
          gsap.set(containerRef.current, { 
            opacity: 0, 
            visibility: 'hidden',
            pointerEvents: 'none',
            display: 'none' 
          });
        }
        // El CTA con position sticky ya se comporta correctamente y se detiene antes del footer
      },
      onEnterBack: () => {
        // Al volver, mostrar el containerRef
        if (containerRef.current) {
          gsap.set(containerRef.current, { 
            opacity: 1, 
            visibility: 'visible',
            pointerEvents: 'auto',
            display: 'flex'
          });
        }
        // El CTA con position sticky permanece sin cambios
        if (finalCtaRef.current) {
          gsap.set(finalCtaRef.current, { 
            scale: 1.0, 
            opacity: 1, 
            visibility: 'visible',
            pointerEvents: 'auto'
          });
        }
      }
    });
    
    currentScrollPx += FINAL_HIDE_PX;

    // ================= CTA SEGUIR EL SCROLL NATURALMENTE =================
    // Después de que el CTA aparece, casi inmediatamente se llega al footer
    const CTA_STATIC_WAIT = NOTCH_PX * 0.3; // Solo 0.3 notchs - llegada casi instantánea al footer
    currentScrollPx += CTA_STATIC_WAIT; // Añadir el espacio de espera al scroll total
    const ctaMoveStartPx = geometricClosureStartPx + GEOMETRIC_CLOSURE_PX + CTA_STATIC_WAIT;
    
    // ScrollTrigger para mover el CTA hacia arriba después de la espera
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${ctaMoveStartPx} top`,
      end: 'bottom bottom',
      scrub: 1, // Scrub más lento para transición más suave
      onUpdate: (self) => {
        if (!finalCtaRef.current) return;
        
        // Verificar si el CTA está visible
        const ctaVisibility = window.getComputedStyle(finalCtaRef.current).visibility;
        if (ctaVisibility === 'hidden') return;
        
        const footer = document.querySelector('footer');
        if (!footer) return;
        
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const ctaHeight = finalCtaRef.current.offsetHeight;
        const margin = 40;
        
        // Si el footer está subiendo y va a chocar con el CTA, desplazar el CTA hacia arriba
        if (footerRect.top < windowHeight) {
          // Calcular cuánto necesita subir el CTA para evitar el footer
          const overlap = windowHeight - footerRect.top + margin;
          if (overlap > 0) {
            // Usar gsap.to para transición suave (no gsap.set que es instantáneo)
            gsap.to(finalCtaRef.current, { 
              y: -overlap, 
              duration: 0.3,
              ease: 'power2.out',
              overwrite: true
            });
          }
        } else {
          // Footer no visible, posición normal con transición suave
          gsap.to(finalCtaRef.current, { 
            y: 0, 
            duration: 0.3,
            ease: 'power2.out',
            overwrite: true
          });
        }
      },
      onLeaveBack: () => {
        // Al volver atrás, resetear posición con transición
        if (finalCtaRef.current) {
          gsap.to(finalCtaRef.current, { 
            y: 0, 
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      }
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
    const COMP_TITLE = t.sacrificeCompetitionTitle;
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
      scrub: scrubValue,
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
    
    // Calcular el punto de inicio de la transición: 95% del totalScroll del primer video
    // para que el segundo video entre cuando el primero está en sus últimos frames
    const video1TransitionStartPx = totalScroll * 0.95;
    
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
      start: `+=${video1TransitionStartPx} top`,
      end: `+=${VIDEO_TRANSITION_PX}`,
      scrub: scrubValue,
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
    
    // Actualizar currentScrollPx para reflejar el nuevo punto después de la transición
    currentScrollPx = video1TransitionStartPx + VIDEO_TRANSITION_PX;
    
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
    const VIDEO3_SCRUB_PX = isMobile ? 4000 : 5500; // Extendido para más narrativa
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
      scrub: scrubValue,
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
    const VIDEO4_SCRUB_PX = isMobile ? 4000 : 5500; // Extendido para más narrativa
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
      scrub: scrubValue,
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

    // ============ FUNCIONES CANVAS 5 (legacy) ============

    const drawToCanvas5 = (img: HTMLImageElement) => {
      const canvas = canvas5Ref.current;
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

    const frameStepMobile5 = 6; // salto agresivo en móvil
    const effectiveFrameStep5 = isMobile ? frameStepMobile5 : 1;
    const effectiveFrames5Count = frames5Count ? Math.floor(((frames5Count - 1) / effectiveFrameStep5)) + 1 : undefined;

    const loadFrame5 = (index: number) => new Promise<HTMLImageElement>((resolve, reject) => {
      if (!frames5Pattern || !frames5Count) return reject('no-pattern');
      const cached = imageCache5Ref.current.get(index);
      if (cached) return resolve(cached);
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      // Índice lógico → número de frame real (saltando en móvil)
      const base = typeof frames5Start === 'number' ? frames5Start : 86400;
      const frameNumber = base + ((index - 1) * effectiveFrameStep5);
      const padded = String(frameNumber).padStart(8, '0');
      // Usamos pattern con {index} que se sustituye por el número con padding de 8 dígitos
      img.src = isMobile
        ? frames5Pattern.replace('{index}', padded).replace('/legacy-frames/', '/legacy-frames/mobile-webp/')
        : frames5Pattern.replace('{index}', padded);
      img.onload = () => { imageCache5Ref.current.set(index, img); resolve(img); };
      img.onerror = (e) => reject(e);
    });

    const preloadAround5 = (center: number) => {
      if (!frames5Count) return;
      const radius = 8;
      for (let i = Math.max(1, center - radius); i <= Math.min(frames5Count, center + radius); i++) {
        if (!imageCache5Ref.current.has(i)) {
          loadFrame5(i).catch(() => {});
        }
      }
    };

    const tryEnableCanvas5 = async () => {
      if (!frames5Pattern || !frames5Count) return false;
      try {
        const first = await loadFrame5(1);
        drawToCanvas5(first);
        preloadAround5(1);
        setUseCanvas5(true);
        return true;
      } catch {
        setUseCanvas5(false);
        return false;
      }
    };

    // ============ SCRUBBING DEL QUINTO VIDEO ==========
    const VIDEO5_SCRUB_PX = isMobile ? 4000 : 5500; // Extendido para más narrativa
    const video5StartPx = currentScrollPx; // comienza tras el cuarto

    const setupCanvas5Scrub = () => {
      if (!useCanvas5 || !frames5Count) return;
      const onUpdate = (self: ScrollTrigger) => {
        const total5 = effectiveFrames5Count ?? frames5Count;
        const idx = Math.max(1, Math.min(total5!, Math.round(self.progress * (total5! - 1)) + 1));
        if (idx === currentFrame5Ref.current) return;
        currentFrame5Ref.current = idx;
        if (drawing5Ref.current) return;
        drawing5Ref.current = true;
        loadFrame5(idx)
          .then((img) => {
            drawToCanvas5(img);
            preloadAround5(idx);
            drawing5Ref.current = false;
          })
          .catch(() => { drawing5Ref.current = false; });
      };

      ScrollTrigger.create({
        trigger: scrollEl as Element,
        start: `+=${video5StartPx} top`,
        end: `+=${VIDEO5_SCRUB_PX}`,
        scrub: 0.1,
        onEnter: () => {
          // Forzar primer frame exacto al entrar en el rango
          currentFrame5Ref.current = 1;
          loadFrame5(1).then((img) => drawToCanvas5(img)).catch(() => {});
        },
        onEnterBack: () => {
          currentFrame5Ref.current = 1;
          loadFrame5(1).then((img) => drawToCanvas5(img)).catch(() => {});
        },
        onUpdate,
      });
    };

    (async () => {
      const enabled5 = await tryEnableCanvas5();
      if (enabled5) {
        setupCanvas5Scrub();
      }
    })();

    // Transición PUSH: video5 entra por la DERECHA y empuja video4 hacia la IZQUIERDA
    const VIDEO5_PUSH_PX = isMobile ? 600 : 800;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${video5StartPx} top`,
      end: `+=${VIDEO5_PUSH_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        // Al iniciar el push, garantizar que se vea el PRIMER frame
        currentFrame5Ref.current = 1;
        if (canvas5Ref.current) gsap.set(canvas5Ref.current, { visibility: 'visible' });
        if (video5OverlayRef.current) gsap.set(video5OverlayRef.current, { visibility: 'visible' });
        loadFrame5(1).then((img) => drawToCanvas5(img)).catch(() => {});
      },
      onEnterBack: () => {
        currentFrame5Ref.current = 1;
        if (canvas5Ref.current) gsap.set(canvas5Ref.current, { visibility: 'visible' });
        if (video5OverlayRef.current) gsap.set(video5OverlayRef.current, { visibility: 'visible' });
        loadFrame5(1).then((img) => drawToCanvas5(img)).catch(() => {});
      },
      onUpdate: (self) => {
        const vw = window.innerWidth;
        // canvas4 sale a la IZQUIERDA
        if (canvas4Ref.current) gsap.set(canvas4Ref.current, { x: -vw * self.progress });
        if (video4OverlayRef.current) gsap.set(video4OverlayRef.current, { x: -vw * self.progress });
        // canvas5 entra desde la DERECHA
        if (canvas5Ref.current) gsap.set(canvas5Ref.current, { x: vw * (1 - self.progress), visibility: 'visible' });
        if (video5OverlayRef.current) gsap.set(video5OverlayRef.current, { x: vw * (1 - self.progress), visibility: 'visible' });
      },
      onLeaveBack: () => {
        if (canvas4Ref.current) gsap.set(canvas4Ref.current, { x: 0 });
        if (video4OverlayRef.current) gsap.set(video4OverlayRef.current, { x: 0 });
        if (canvas5Ref.current) gsap.set(canvas5Ref.current, { x: '100vw', visibility: 'hidden' });
        if (video5OverlayRef.current) gsap.set(video5OverlayRef.current, { x: '100vw', visibility: 'hidden' });
      }
    });

    currentScrollPx += VIDEO5_PUSH_PX + VIDEO5_SCRUB_PX;

    // ============ FUNCIONES CANVAS 6 (epilogue) ============

    const drawToCanvas6 = (img: HTMLImageElement) => {
      const canvas = canvas6Ref.current;
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

    const frameStepMobile6 = 6; // salto agresivo en móvil
    const effectiveFrameStep6 = isMobile ? frameStepMobile6 : 1;
    const effectiveFrames6Count = frames6Count ? Math.floor(((frames6Count - 1) / effectiveFrameStep6)) + 1 : undefined;

    const loadFrame6 = (index: number) => new Promise<HTMLImageElement>((resolve, reject) => {
      if (!frames6Pattern || !frames6Count) return reject('no-pattern');
      const cached = imageCache6Ref.current.get(index);
      if (cached) return resolve(cached);
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      // Índice lógico → número de frame real (saltando en móvil)
      const base = typeof frames6Start === 'number' ? frames6Start : 86400;
      const frameNumber = base + ((index - 1) * effectiveFrameStep6);
      const padded = String(frameNumber).padStart(8, '0');
      // Usamos pattern con {index} que se sustituye por el número con padding de 8 dígitos
      img.src = isMobile
        ? frames6Pattern.replace('{index}', padded).replace('/epilogue-frames/', '/epilogue-frames/mobile-webp/')
        : frames6Pattern.replace('{index}', padded);
      img.onload = () => { imageCache6Ref.current.set(index, img); resolve(img); };
      img.onerror = (e) => reject(e);
    });

    const preloadAround6 = (center: number) => {
      if (!frames6Count) return;
      const radius = 8;
      for (let i = Math.max(1, center - radius); i <= Math.min(frames6Count, center + radius); i++) {
        if (!imageCache6Ref.current.has(i)) {
          loadFrame6(i).catch(() => {});
        }
      }
    };

    const tryEnableCanvas6 = async () => {
      if (!frames6Pattern || !frames6Count) return false;
      try {
        const first = await loadFrame6(1);
        drawToCanvas6(first);
        preloadAround6(1);
        setUseCanvas6(true);
        return true;
      } catch {
        setUseCanvas6(false);
        return false;
      }
    };

    // ============ SCRUBBING DEL SEXTO VIDEO ==========
    const VIDEO6_SCRUB_PX = isMobile ? 2500 : 3500; // Reducido para que no se congele tanto
    const video6StartPx = currentScrollPx; // comienza tras el quinto

    const setupCanvas6Scrub = () => {
      if (!useCanvas6 || !frames6Count) return;
      const onUpdate = (self: ScrollTrigger) => {
        const total6 = effectiveFrames6Count ?? frames6Count;
        const idx = Math.max(1, Math.min(total6!, Math.round(self.progress * (total6! - 1)) + 1));
        if (idx === currentFrame6Ref.current) return;
        currentFrame6Ref.current = idx;
        if (drawing6Ref.current) return;
        drawing6Ref.current = true;
        loadFrame6(idx)
          .then((img) => {
            drawToCanvas6(img);
            preloadAround6(idx);
            drawing6Ref.current = false;
          })
          .catch(() => { drawing6Ref.current = false; });
      };

      ScrollTrigger.create({
        trigger: scrollEl as Element,
        start: `+=${video6StartPx} top`,
        end: `+=${VIDEO6_SCRUB_PX}`,
        scrub: 0.1,
        onEnter: () => {
          // Forzar primer frame exacto al entrar en el rango
          currentFrame6Ref.current = 1;
          loadFrame6(1).then((img) => drawToCanvas6(img)).catch(() => {});
        },
        onEnterBack: () => {
          currentFrame6Ref.current = 1;
          loadFrame6(1).then((img) => drawToCanvas6(img)).catch(() => {});
        },
        onUpdate,
      });
    };

    (async () => {
      const enabled6 = await tryEnableCanvas6();
      if (enabled6) {
        setupCanvas6Scrub();
      }
    })();

    // Transición PUSH: video6 entra por la IZQUIERDA y empuja video5 hacia la DERECHA
    const VIDEO6_PUSH_PX = isMobile ? 600 : 800;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${video6StartPx} top`,
      end: `+=${VIDEO6_PUSH_PX}`,
      scrub: scrubValue,
      onEnter: () => {
        // Al iniciar el push, garantizar que se vea el PRIMER frame
        currentFrame6Ref.current = 1;
        if (canvas6Ref.current) gsap.set(canvas6Ref.current, { visibility: 'visible' });
        if (video6OverlayRef.current) gsap.set(video6OverlayRef.current, { visibility: 'visible' });
        loadFrame6(1).then((img) => drawToCanvas6(img)).catch(() => {});
      },
      onEnterBack: () => {
        currentFrame6Ref.current = 1;
        if (canvas6Ref.current) gsap.set(canvas6Ref.current, { visibility: 'visible' });
        if (video6OverlayRef.current) gsap.set(video6OverlayRef.current, { visibility: 'visible' });
        loadFrame6(1).then((img) => drawToCanvas6(img)).catch(() => {});
      },
      onUpdate: (self) => {
        const vw = window.innerWidth;
        // canvas5 sale a la DERECHA
        if (canvas5Ref.current) gsap.set(canvas5Ref.current, { x: vw * self.progress });
        if (video5OverlayRef.current) gsap.set(video5OverlayRef.current, { x: vw * self.progress });
        // canvas6 entra desde la IZQUIERDA
        if (canvas6Ref.current) gsap.set(canvas6Ref.current, { x: -vw * (1 - self.progress), visibility: 'visible' });
        if (video6OverlayRef.current) gsap.set(video6OverlayRef.current, { x: -vw * (1 - self.progress), visibility: 'visible' });
      },
      onLeaveBack: () => {
        if (canvas5Ref.current) gsap.set(canvas5Ref.current, { x: 0 });
        if (video5OverlayRef.current) gsap.set(video5OverlayRef.current, { x: 0 });
        if (canvas6Ref.current) gsap.set(canvas6Ref.current, { x: '-100vw', visibility: 'hidden' });
        if (video6OverlayRef.current) gsap.set(video6OverlayRef.current, { x: '-100vw', visibility: 'hidden' });
      }
    });

    currentScrollPx += VIDEO6_PUSH_PX + VIDEO6_SCRUB_PX;

    // Añadir espacio adicional al final para permitir scroll completo hasta el footer
    // Solo lo suficiente para que el footer sea visible
    const EXTRA_FINAL_SCROLL = isMobile ? window.innerHeight * 1.5 : window.innerHeight * 1;
    currentScrollPx += EXTRA_FINAL_SCROLL;

    // En móvil: ocultar antes al hacer scroll hacia arriba (margen de retroceso)
    const BACK_HIDE_MARGIN = isMobile ? 0.8 : 1;
    ScrollTrigger.create({
      trigger: scrollEl as Element,
      start: `+=${totalScroll * (TITLE_FLIP_START + BACK_HIDE_MARGIN)} top`,
      end: `+=${totalScroll}`,
      onEnterBack: () => {
        if (nextTitleBlockRef.current) gsap.set(nextTitleBlockRef.current, { opacity: 0 });
      },
      onLeave: () => {
        // Resetear completamente el H2 cuando se pasa de largo hacia adelante
        if (nextTitleInnerRef.current) {
          gsap.set(nextTitleInnerRef.current, { x: -window.innerWidth, y: -LIFT_MAX_PX });
        }
      },
      onLeaveBack: () => {
        // Resetear completamente el H2 cuando se vuelve hacia atrás más allá del inicio
        if (nextTitleBlockRef.current) {
          gsap.set(nextTitleBlockRef.current, { opacity: 1 });
          const spansUp = nextTitleBlockRef.current.querySelectorAll('.flip-up');
          const spansDown = nextTitleBlockRef.current.querySelectorAll('.flip-down');
          gsap.set(spansUp, { rotateX: TITLE_FLIP_ANGLE });
          gsap.set(spansDown, { rotateX: -TITLE_FLIP_ANGLE });
        }
        if (nextTitleInnerRef.current) {
          gsap.set(nextTitleInnerRef.current, { x: 0, y: 0 });
        }
        // Resetear también el párrafo
        if (nextBodyRef.current) {
          nextBodyRef.current.textContent = '';
        }
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
        scrub: scrubValue,
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

    // ================= SISTEMA DE SCROLL SNAP MAGNÉTICO (SOLO MÓVIL) =================
    // En móvil, cuando el usuario termina de hacer swipe, el scroll se "engancha"
    // automáticamente al módulo más cercano, completando la animación de forma brusca.
    let scrollSnapTimeoutId: number | undefined;
    let isSnapScrolling = false;
    
    const snapScrollHandler = () => {
      if (!isMobile || isSnapScrolling) return;
      
      // Limpiar timeout anterior
      if (scrollSnapTimeoutId) clearTimeout(scrollSnapTimeoutId);
      
      // Esperar 150ms después del último evento de scroll para detectar que el usuario terminó
      scrollSnapTimeoutId = window.setTimeout(() => {
        const currentScroll = window.scrollY;
        
        // Definir todos los puntos de parada (módulos importantes)
        // Estos están basados en las posiciones calculadas de las animaciones
        const snapPoints = [
          0, // Inicio
          totalScroll * 0.12, // Después del intro (cita de Arnold)
          quoteEndPx, // Fin de la cita
          newH2HoldStartPx, // "Entrenador Personal..." visible
          newH2ExitStartPx, // Fin del hold del H2
          experienceParaStartPx, // Inicio del párrafo de experiencia
          experienceParaTypeStartPx, // Párrafo de experiencia completo
          experienceParaEndPx, // Fin del párrafo de experiencia
          moveStartPx, // Después del flip del título
          slideOutStartPx, // Inicio de slide out
          imageSlideOutStartPx, // Slide out de imagen
          paragraphsScrollStartPx, // Scroll de párrafos
          quote2StartPx, // Segunda cita
          quote2TypeStartPx, // Segunda cita typing
          quote2ExitStartPx, // Salida segunda cita
          tabsZoomStartPx, // Inicio de tabs (zoom)
          tabsScrollStartPx, // Tabs scroll
          nutritionTypingStartPx, // Nutrition typing
          tabsExitStartPx, // Salida de tabs
          paraStartPx, // Inicio del párrafo largo "El Sacrificio..."
          paraTypeStartPx, // Párrafo typing
          compExitStartPx, // Salida del módulo de competición
          quote3SlideStartPx, // Salida de la tercera cita
          fatherParaStartPx, // Párrafo del padre
          fatherParaSlideStartPx, // Fin del párrafo del padre
          sonChallengeStartPx, // "Why don't you compete again, dad?"
          sonChallengeSlideStartPx, // H2 sale
          sonParaStartPx, // Párrafo del hijo
          sonParaSlideStartPx, // Salida del párrafo del hijo
          imgStartPx, // Imagen entra
          imgHoldStartPx, // Imagen hold
          imgCollapseStartPx, // Imagen colapsa
          gymStartPx, // Módulo del gimnasio
          gymParaExitStartPx, // Salida párrafo gym
          nabbaStartPx, // NABBA 2006
          nabbaHoldStartPx, // NABBA hold
          mrUniversoStartPx, // Mr Universo
          mrUniversoHoldStartPx, // Mr Universo hold
          arnoldStartPx, // Arnold Classic
          arnoldHoldStartPx, // Arnold hold
          benWeiderStartPx, // Ben Weider
          benWeiderHoldStartPx, // Ben Weider hold
          experienceStartPx, // Años de experiencia
          trophiesStartPx, // Trofeos
          // ... más puntos según sea necesario
        ];
        
        // Encontrar el punto de snap más cercano
        let closestPoint = snapPoints[0];
        let minDistance = Math.abs(currentScroll - snapPoints[0]);
        
        for (const point of snapPoints) {
          const distance = Math.abs(currentScroll - point);
          if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
          }
        }
        
        // Solo hacer snap si la distancia es mayor a 50px (para evitar snaps innecesarios)
        if (minDistance > 50) {
          isSnapScrolling = true;
          
          // Hacer scroll suave al punto más cercano
          window.scrollTo({
            top: closestPoint,
            behavior: 'smooth'
          });
          
          // Permitir nuevo snap después de 600ms
          setTimeout(() => {
            isSnapScrolling = false;
          }, 600);
        }
      }, 150);
    };
    
    if (isMobile) {
      window.addEventListener('scroll', snapScrollHandler, { passive: true });
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      window.removeEventListener('resize', handleResize);
      
      // Cleanup para event listeners de móvil
      if (preventOverscrollHandler) {
        document.removeEventListener('touchmove', preventOverscrollHandler);
      }
      if (preventPullToRefreshHandler) {
        document.removeEventListener('touchmove', preventPullToRefreshHandler);
      }
      if (touchStartHandler) {
        document.removeEventListener('touchstart', touchStartHandler);
      }
      
      // Cleanup del scroll snap
      if (isMobile) {
        window.removeEventListener('scroll', snapScrollHandler);
        if (scrollSnapTimeoutId) clearTimeout(scrollSnapTimeoutId);
      }
    };
  }, [framesPattern, framesCount, frames2Pattern, frames2Count, frames3Pattern, frames3Count, frames4Pattern, frames4Count, frames5Pattern, frames5Count, useCanvas, useCanvas2, useCanvas3, useCanvas4, useCanvas5]);

  // Calcular altura total necesaria para el scroll de forma aproximada pero precisa
  // Basado en el contenido real de animaciones (1 notch = 800px)
  const isMobileDevice = typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false;
  const estimatedScrollHeight = typeof window !== 'undefined' 
    ? (isMobileDevice 
        ? 800 * 3  // ~50 notchs para móvil = 40,000px
        : 800 * 3  // ~40 notchs para desktop = 32,000px
      )
    : 10000;

  return (
    <>
    {/* Spacer invisible que genera la altura del documento para el scroll */}
    <div style={{ height: `${estimatedScrollHeight}px`, width: '1px' }} aria-hidden="true"></div>
    
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
        <canvas ref={canvasRef} className="absolute inset-0 -z-20 w-full h-full will-change-transform" style={{ display: useCanvas ? 'block' : 'none', transform: 'translateZ(0)' }} />
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
        <canvas ref={canvas2Ref} className="absolute inset-0 -z-19 w-full h-full will-change-transform" style={{ display: useCanvas2 ? 'block' : 'none', transform: 'translateZ(0)' }} />
      )}

      {/* Canvas flipbook para tercer video (challenge) */}
      {(frames3Pattern && frames3Count) && (
        <canvas ref={canvas3Ref} className="absolute inset-0 -z-18 w-full h-full will-change-transform" style={{ display: useCanvas3 ? 'block' : 'none', transform: 'translateZ(0)' }} />
      )}
      {/* Overlay sutil para el tercer video */}
      <div ref={video3OverlayRef} className="absolute inset-0 -z-17 bg-black/40" style={{ display: useCanvas3 ? 'block' : 'none' }} />

      {/* Canvas flipbook para cuarto video (final) */}
      {(frames4Pattern && frames4Count) && (
        <canvas ref={canvas4Ref} className="absolute inset-0 -z-16 w-full h-full will-change-transform" style={{ display: useCanvas4 ? 'block' : 'none', transform: 'translateZ(0)' }} />
      )}
      {/* Overlay sutil para el cuarto video */}
      <div ref={video4OverlayRef} className="absolute inset-0 -z-15 bg-black/40" style={{ display: useCanvas4 ? 'block' : 'none' }} />

      {/* Canvas flipbook para quinto video (legacy) */}
      {(frames5Pattern && frames5Count) && (
        <canvas ref={canvas5Ref} className="absolute inset-0 -z-14 w-full h-full will-change-transform" style={{ display: useCanvas5 ? 'block' : 'none', transform: 'translateZ(0)' }} />
      )}
      {/* Overlay sutil para el quinto video */}
      <div ref={video5OverlayRef} className="absolute inset-0 -z-13 bg-black/40" style={{ display: useCanvas5 ? 'block' : 'none' }} />

      {/* Canvas flipbook para sexto video (epilogue) */}
      {(frames6Pattern && frames6Count) && (
        <canvas ref={canvas6Ref} className="absolute inset-0 -z-12 w-full h-full will-change-transform" style={{ display: useCanvas6 ? 'block' : 'none', transform: 'translateZ(0)' }} />
      )}
      {/* Overlay sutil para el sexto video */}
      <div ref={video6OverlayRef} className="absolute inset-0 -z-11 bg-black/40" style={{ display: useCanvas6 ? 'block' : 'none' }} />

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
              {t.quote1}
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
          <div ref={gymSubtitleRef} className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-white/80 mb-1" style={{ opacity: 0 }}>{t.gymSubtitle}</div>
          {/* Título con outline rojo en primera palabra y blanco en resto */}
          <h2 ref={gymTitleTextRef} className="text-left text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight will-change-transform">
            {(() => {
              const titleWords = t.gymTitle.split(' ');
              return (
                <>
                  <span className="text-transparent [text-shadow:0_0_0_rgba(0,0,0,0)] [webkit-text-stroke:2px_rgb(220,38,38)] mr-2">{titleWords[0]}</span>
                  <span className="text-white">{titleWords.slice(1).join(' ')}</span>
                </>
              );
            })()}
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
              {t.gymIntroParagraph}
            </p>
          </div>
        </div>
      </div>

      {/* Campeón NABBA 2006 - Entrada desde la derecha con estilo Netflix */}
      <div ref={nabbaChampRef} className="fixed inset-0 z-[69] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden' }}>
        <div className="relative mx-4 md:mx-8 w-full max-w-3xl">
          {/* Glow de fondo rojo */}
          <div className="absolute -inset-8 bg-red-600/20 blur-[100px] rounded-full" />
          
          {/* Contenedor principal con glassmorphism */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-2xl opacity-60 blur-[8px] bg-[linear-gradient(135deg,rgba(229,9,20,0.7),rgba(255,255,255,0.1),rgba(229,9,20,0.7))]" />
            <div className="relative rounded-2xl border border-white/20 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.7)] px-6 py-8 md:px-10 md:py-12">
              {/* Barra roja superior */}
              <div className="absolute top-0 left-0 h-2 w-32 md:w-48 bg-gradient-to-r from-red-600 to-red-500 rounded-tr-2xl rounded-tl-2xl shadow-[0_0_20px_rgba(220,38,38,0.8)]" />
              
              {/* Layout responsive: móvil = columna, desktop = fila con logo a la derecha */}
              <div className="flex flex-col md:flex-row md:items-start md:gap-8">
                {/* Contenido principal */}
                <div className="flex-1">
                  {/* Subtítulo */}
                  <div className="mb-3 text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-red-500">
                    {t.nabbaSubtitle}
                  </div>
                  
                  {/* Título principal */}
                  <h3 className="mb-4 text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-white">
                      {t.nabbaTitle}
                    </span>
                  </h3>
                  
                  {/* Categoría */}
                  <div className="border-l-4 border-red-600 pl-4 py-2">
                    <p className="text-base md:text-lg font-semibold text-gray-200 leading-relaxed">
                      {t.nabbaCategory}<br/>
                      <span className="text-red-400">{t.nabbaCategorySubtitle}</span>
                    </p>
                  </div>
                  
                  {/* Logo NABBA pequeño - solo visible en móvil */}
                  <div className="mt-8 mb-6 flex justify-center md:hidden">
                    <div className="relative w-32">
                      <img 
                        src="/images/about/biography/campeon-NABBA.webp" 
                        alt="Logo NABBA"
                        className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
                      />
                    </div>
                  </div>
                  
                  {/* Detalle adicional */}
                  <div className="pt-4 border-t border-white/10 md:mt-6">
                    <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                      {t.nabbaDescription}
                    </p>
                  </div>
                </div>
                
                {/* Logo NABBA - solo visible en desktop, a la derecha */}
                <div className="hidden md:flex md:items-center md:justify-center md:flex-shrink-0">
                  <div className="relative w-40 lg:w-48">
                    <img 
                      src="/images/about/biography/campeon-NABBA.webp" 
                      alt="Logo NABBA"
                      className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subcampeón NAC Mister Universo 2009 - Entrada desde la derecha con estilo Netflix */}
      <div ref={mrUniversoRef} className="fixed inset-0 z-[69] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden' }}>
        <div className="relative mx-4 md:mx-8 w-full max-w-3xl">
          {/* Glow de fondo rojo */}
          <div className="absolute -inset-8 bg-red-600/20 blur-[100px] rounded-full" />
          
          {/* Contenedor principal con glassmorphism */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-2xl opacity-60 blur-[8px] bg-[linear-gradient(135deg,rgba(229,9,20,0.7),rgba(255,255,255,0.1),rgba(229,9,20,0.7))]" />
            <div className="relative rounded-2xl border border-white/20 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.7)] px-6 py-8 md:px-10 md:py-12">
              {/* Barra roja superior */}
              <div className="absolute top-0 left-0 h-2 w-32 md:w-48 bg-gradient-to-r from-red-600 to-red-500 rounded-tr-2xl rounded-tl-2xl shadow-[0_0_20px_rgba(220,38,38,0.8)]" />
              
              {/* Layout responsive: móvil = columna, desktop = fila con logo a la derecha */}
              <div className="flex flex-col md:flex-row md:items-start md:gap-8">
                {/* Contenido principal */}
                <div className="flex-1">
                  {/* Subtítulo */}
                  <div className="mb-3 text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-red-500">
                    {t.mrUniverseSubtitle}
                  </div>
                  
                  {/* Título principal */}
                  <h3 className="mb-4 text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-white">
                      {t.mrUniverseTitle}
                    </span>
                  </h3>
                  
                  {/* Año */}
                  <div className="border-l-4 border-red-600 pl-4 py-2">
                    <p className="text-base md:text-lg font-semibold text-gray-200 leading-relaxed">
                      <span className="text-red-400">2009</span>
                    </p>
                  </div>
                  
                  {/* Logo Mister Universo pequeño - solo visible en móvil */}
                  <div className="mt-8 mb-6 flex justify-center md:hidden">
                    <div className="relative w-32">
                      <img 
                        src="/images/about/biography/mr universo.webp" 
                        alt="Logo NAC Mister Universo"
                        className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
                      />
                    </div>
                  </div>
                  
                  {/* Detalle adicional */}
                  <div className="pt-4 border-t border-white/10 md:mt-6">
                    <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                      {t.mrUniverseDescription}
                    </p>
                  </div>
                </div>
                
                {/* Logo Mister Universo - solo visible en desktop, a la derecha */}
                <div className="hidden md:flex md:items-center md:justify-center md:flex-shrink-0">
                  <div className="relative w-40 lg:w-48">
                    <img 
                      src="/images/about/biography/mr universo.webp" 
                      alt="Logo NAC Mister Universo"
                      className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Arnold Classic Columbus & Madrid - Entrada desde la derecha con estilo Netflix */}
      <div ref={arnoldClassicRef} className="fixed inset-0 z-[69] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden' }}>
        <div className="relative mx-4 md:mx-8 w-full max-w-3xl">
          {/* Glow de fondo rojo */}
          <div className="absolute -inset-8 bg-red-600/20 blur-[100px] rounded-full" />
          
          {/* Contenedor principal con glassmorphism */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-2xl opacity-60 blur-[8px] bg-[linear-gradient(135deg,rgba(229,9,20,0.7),rgba(255,255,255,0.1),rgba(229,9,20,0.7))]" />
            <div className="relative rounded-2xl border border-white/20 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.7)] px-6 py-8 md:px-10 md:py-12">
              {/* Barra roja superior */}
              <div className="absolute top-0 left-0 h-2 w-32 md:w-48 bg-gradient-to-r from-red-600 to-red-500 rounded-tr-2xl rounded-tl-2xl shadow-[0_0_20px_rgba(220,38,38,0.8)]" />
              
              {/* Layout responsive: móvil = columna, desktop = fila con logo a la derecha */}
              <div className="flex flex-col md:flex-row md:items-start md:gap-8">
                {/* Contenido principal */}
                <div className="flex-1">
                  {/* Subtítulo */}
                  <div className="mb-3 text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-red-500">
                    {t.arnoldClassicSubtitle}
                  </div>
                  
                  {/* Título principal */}
                  <h3 className="mb-4 text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-white">
                      {t.arnoldClassicTitle}
                    </span>
                  </h3>
                  
                  {/* Ubicaciones */}
                  <div className="border-l-4 border-red-600 pl-4 py-2">
                    <p className="text-base md:text-lg font-semibold text-gray-200 leading-relaxed">
                      {t.arnoldClassicDetail}
                    </p>
                  </div>
                  
                  {/* Logo Arnold Classic pequeño - solo visible en móvil */}
                  <div className="mt-8 mb-6 flex justify-center md:hidden">
                    <div className="relative w-32">
                      <img 
                        src="/images/about/biography/arnol classic.webp" 
                        alt="Logo Arnold Classic"
                        className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
                      />
                    </div>
                  </div>
                  
                  {/* Detalle adicional */}
                  <div className="pt-4 border-t border-white/10 md:mt-6">
                    <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                      {t.arnoldClassicDescription}
                    </p>
                  </div>
                </div>
                
                {/* Logo Arnold Classic - solo visible en desktop, a la derecha */}
                <div className="hidden md:flex md:items-center md:justify-center md:flex-shrink-0">
                  <div className="relative w-40 lg:w-48">
                    <img 
                      src="/images/about/biography/arnol classic.webp" 
                      alt="Logo Arnold Classic"
                      className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ben Weider Classic & Big Man Masters - Entrada desde la derecha con estilo Netflix */}
      <div ref={benWeiderRef} className="fixed inset-0 z-[69] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden' }}>
        <div className="relative mx-4 md:mx-8 w-full max-w-3xl">
          {/* Glow de fondo rojo */}
          <div className="absolute -inset-8 bg-red-600/20 blur-[100px] rounded-full" />
          
          {/* Contenedor principal con glassmorphism */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-2xl opacity-60 blur-[8px] bg-[linear-gradient(135deg,rgba(229,9,20,0.7),rgba(255,255,255,0.1),rgba(229,9,20,0.7))]" />
            <div className="relative rounded-2xl border border-white/20 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.7)] px-6 py-8 md:px-10 md:py-12">
              {/* Barra roja superior */}
              <div className="absolute top-0 left-0 h-2 w-32 md:w-48 bg-gradient-to-r from-red-600 to-red-500 rounded-tr-2xl rounded-tl-2xl shadow-[0_0_20px_rgba(220,38,38,0.8)]" />
              
              {/* Layout responsive: móvil = columna, desktop = fila con logo a la derecha */}
              <div className="flex flex-col md:flex-row md:items-start md:gap-8">
                {/* Contenido principal */}
                <div className="flex-1">
                  {/* Subtítulo */}
                  <div className="mb-3 text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-red-500">
                    {t.benWeiderSubtitle}
                  </div>
                  
                  {/* Título principal */}
                  <h3 className="mb-4 text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-white">
                      {t.benWeiderTitle}
                    </span>
                  </h3>
                  
                  {/* Competiciones */}
                  <div className="border-l-4 border-red-600 pl-4 py-2">
                    <p className="text-base md:text-lg font-semibold text-gray-200 leading-relaxed">
                      {t.benWeiderCategory}<br/>
                      <span className="text-gray-400 text-sm">(+40 {lang === 'es' ? 'años' : 'years'})</span>
                    </p>
                  </div>
                  
                  {/* Logo Ben Weider pequeño - solo visible en móvil */}
                  <div className="mt-8 mb-6 flex justify-center md:hidden">
                    <div className="relative w-32">
                      <img 
                        src="/images/about/biography/benweider.webp" 
                        alt="Logo Ben Weider"
                        className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
                      />
                    </div>
                  </div>
                  
                  {/* Detalle adicional */}
                  <div className="pt-4 border-t border-white/10 md:mt-6">
                    <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                      {t.benWeiderDetail}
                    </p>
                  </div>
                </div>
                
                {/* Logo Ben Weider - solo visible en desktop, a la derecha */}
                <div className="hidden md:flex md:items-center md:justify-center md:flex-shrink-0">
                  <div className="relative w-40 lg:w-48">
                    <img 
                      src="/images/about/biography/benweider.webp" 
                      alt="Logo Ben Weider"
                      className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Imagen de coaching - Zoom out entrada y salida */}
      <div ref={coachingImageRef} className="fixed inset-0 z-[69] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden' }}>
        <div className="pointer-events-none relative w-full max-w-md md:max-w-xl px-6 md:px-0">
          {/* Glow rojo y marco glass */}
          <div className="absolute -inset-1 rounded-3xl opacity-60 blur-sm bg-[linear-gradient(135deg,rgba(229,9,20,0.5),rgba(255,255,255,0.08),rgba(229,9,20,0.5))]" />
          <div className="relative rounded-3xl border border-white/15 bg-black/40 backdrop-blur-md overflow-hidden">
            <div className="absolute top-0 left-0 h-1.5 w-24 md:w-36 bg-red-600 rounded-tr-3xl rounded-tl-3xl" />
            <img src="/images/about/entrenadores lau-ber-88.jpg" alt="Bernat coaching" className="w-full h-auto object-contain" />
          </div>
        </div>
      </div>

      {/* 25+ Años de experiencia - Entrada y salida con zoom out estilo glassmorphism */}
      <div ref={experienceRef} className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden' }}>
        <div className="relative mx-4 md:mx-8">
          
          {/* Contenedor circular glassmorphism */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-full opacity-60 blur-[6px] bg-[linear-gradient(135deg,rgba(229,9,20,0.6),rgba(255,255,255,0.08),rgba(229,9,20,0.6))]" />
            <div className="relative rounded-full border border-white/10 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.6)] w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
              
              {/* Layout centrado */}
              <div className="flex flex-col items-center text-center px-8">
                
                {/* Icono de trofeo/estrella monocolor */}
                <div className="mb-6">
                  <svg className="w-16 h-16 md:w-20 md:h-20 text-red-600 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                
                {/* Número 25+ */}
                <div className="mb-4">
                  <div className="text-6xl md:text-7xl font-black leading-none tracking-tighter">
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-100 to-red-500">
                      {t.experienceYears.replace('+', '')}<span className="text-red-500">+</span>
                    </span>
                  </div>
                </div>
                
                {/* Texto de experiencia */}
                <div className="space-y-1">
                  <p className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white">
                    {t.experienceLabel}
                  </p>
                </div>
                
                {/* Separador sutil */}
                <div className="mt-4 mb-3 w-16 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent" />
                
                {/* Subtexto */}
                <p className="text-xs md:text-sm text-gray-400 font-medium">
                  {t.experienceSince}
                </p>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 40+ Trofeos - Entrada con zoom out estilo glassmorphism */}
      <div ref={trophiesRef} className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden' }}>
        <div className="relative mx-4 md:mx-8">
          
          {/* Contenedor circular glassmorphism */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-full opacity-60 blur-[6px] bg-[linear-gradient(135deg,rgba(229,9,20,0.6),rgba(255,255,255,0.08),rgba(229,9,20,0.6))]" />
            <div className="relative rounded-full border border-white/10 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.6)] w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
              
              {/* Layout centrado */}
              <div className="flex flex-col items-center text-center px-8">
                
                {/* Icono de trofeo monocolor */}
                <div className="mb-6">
                  <svg className="w-16 h-16 md:w-20 md:h-20 text-red-600 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 3v18a1 1 0 0 0 1 1h1.293L12 17.293 16.707 22H18a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1zm5 6a2 2 0 1 1 4 0v.989c.917.507 2 1.476 2 2.511 0 1.657-1.343 3-3 3H11c-1.657 0-3-1.343-3-3 0-1.035 1.083-2.004 2-2.511V9z"/>
                  </svg>
                </div>
                
                {/* Número 40+ */}
                <div className="mb-4">
                  <div className="text-6xl md:text-7xl font-black leading-none tracking-tighter">
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-100 to-red-500">
                      {t.trophiesCount.replace('+', '')}<span className="text-red-500">+</span>
                    </span>
                  </div>
                </div>
                
                {/* Texto de trofeos */}
                <div className="space-y-1">
                  <p className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white">
                    {t.trophiesLabel}
                  </p>
                </div>
                
                {/* Separador sutil */}
                <div className="mt-4 mb-3 w-16 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent" />
                
                {/* Subtexto */}
                <p className="text-xs md:text-sm text-gray-400 font-medium">
                  En competiciones élite
                </p>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Párrafo "Con la motivación renovada..." - Aparece mientras H2 se desfragmenta (z-index menor) */}
      <div ref={triumphParaRef} className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden', opacity: 0, transform: 'scale(1.5)' }}>
        <div className="pointer-events-none relative mx-4 md:mx-0 w-full max-w-2xl">
          <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[6px] bg-[linear-gradient(135deg,rgba(229,9,20,0.6),rgba(255,255,255,0.08),rgba(229,9,20,0.6))]" />
          <div className="relative rounded-3xl border border-white/10 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.6)] px-6 py-8 md:px-12 md:py-12">
            <div className="absolute top-0 left-0 h-1.5 w-28 md:w-40 bg-red-600 rounded-tr-3xl rounded-tl-3xl" />
            <p className="text-base md:text-lg leading-relaxed text-gray-100">
              {t.triumphParagraph}
            </p>
          </div>
        </div>
      </div>

      {/* Medalla de Oro 2018 - Entrada desde la izquierda con estilo Netflix */}
      <div ref={goldMedalRef} className="fixed inset-0 z-[69] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden' }}>
        <div className="relative mx-4 md:mx-8 w-full max-w-3xl">
          {/* Glow de fondo dorado */}
          <div className="absolute -inset-8 bg-yellow-500/20 blur-[100px] rounded-full" />
          
          {/* Contenedor principal con glassmorphism */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-2xl opacity-60 blur-[8px] bg-[linear-gradient(135deg,rgba(234,179,8,0.7),rgba(255,255,255,0.1),rgba(234,179,8,0.7))]" />
            <div className="relative rounded-2xl border border-white/20 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.7)] px-6 py-8 md:px-10 md:py-12">
              {/* Barra dorada superior */}
              <div className="absolute top-0 left-0 h-2 w-32 md:w-48 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-tr-2xl rounded-tl-2xl shadow-[0_0_20px_rgba(234,179,8,0.8)]" />
              
              {/* Layout responsive: móvil = columna, desktop = fila con icono a la izquierda */}
              <div className="flex flex-col md:flex-row md:items-center md:gap-8">
                
                {/* Icono de medalla SVG - solo visible en desktop */}
                <div className="hidden md:flex md:items-center md:justify-center md:flex-shrink-0">
                  <svg className="w-24 h-24 lg:w-28 lg:h-28 text-yellow-500 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {/* Cinta superior */}
                    <path d="M12 2L10 8L8 2L6 8L4 2" strokeLinecap="round" strokeLinejoin="round"/>
                    {/* Círculo de la medalla */}
                    <circle cx="12" cy="15" r="7" strokeWidth="2"/>
                    {/* Estrella interior */}
                    <path d="M12 11L12.5 13L14.5 13.5L12.5 14L12 16L11.5 14L9.5 13.5L11.5 13L12 11Z" fill="currentColor" strokeWidth="0"/>
                  </svg>
                </div>
                
                {/* Contenido principal */}
                <div className="flex-1">
                  {/* Subtítulo */}
                  <div className="mb-3 text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-yellow-500">
                    {t.goldMedalSubtitle}
                  </div>
                  
                  {/* Título principal */}
                  <h3 className="mb-4 text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-white">
                      {t.goldMedalTitle}
                    </span>
                  </h3>
                  
                  {/* Información */}
                  <div className="border-l-4 border-yellow-500 pl-4 py-2">
                    <p className="text-base md:text-lg font-semibold text-gray-200 leading-relaxed">
                      {t.goldMedalSeason}
                    </p>
                  </div>
                  
                  {/* Icono pequeño - solo visible en móvil */}
                  <div className="mt-8 mb-6 flex justify-center md:hidden">
                    <svg className="w-20 h-20 text-yellow-500 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      {/* Cinta superior */}
                      <path d="M12 2L10 8L8 2L6 8L4 2" strokeLinecap="round" strokeLinejoin="round"/>
                      {/* Círculo de la medalla */}
                      <circle cx="12" cy="15" r="7" strokeWidth="2"/>
                      {/* Estrella interior */}
                      <path d="M12 11L12.5 13L14.5 13.5L12.5 14L12 16L11.5 14L9.5 13.5L11.5 13L12 11Z" fill="currentColor" strokeWidth="0"/>
                    </svg>
                  </div>
                  
                  {/* Detalle adicional */}
                  <div className="pt-4 border-t border-white/10 md:mt-6">
                    <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                      {t.goldMedalDescription}
                    </p>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medallas de Plata y Bronce - Entrada desde la derecha con estilo Netflix */}
      <div ref={silverBronzeRef} className="fixed inset-0 z-[69] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden' }}>
        <div className="relative mx-4 md:mx-8 w-full max-w-3xl">
          {/* Glow de fondo plateado */}
          <div className="absolute -inset-8 bg-gray-400/20 blur-[100px] rounded-full" />
          
          {/* Contenedor principal con glassmorphism */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-2xl opacity-60 blur-[8px] bg-[linear-gradient(135deg,rgba(156,163,175,0.7),rgba(255,255,255,0.1),rgba(156,163,175,0.7))]" />
            <div className="relative rounded-2xl border border-white/20 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.7)] px-6 py-8 md:px-10 md:py-12">
              {/* Barra plateada superior con toque bronce */}
              <div className="absolute top-0 left-0 h-2 w-32 md:w-48 bg-gradient-to-r from-gray-400 via-gray-300 to-amber-600 rounded-tr-2xl rounded-tl-2xl shadow-[0_0_20px_rgba(156,163,175,0.8)]" />
              
              {/* Layout responsive: móvil = columna, desktop = fila con iconos a la izquierda */}
              <div className="flex flex-col md:flex-row md:items-center md:gap-8">
                
                {/* Iconos de medallas SVG - solo visible en desktop */}
                <div className="hidden md:flex md:items-center md:justify-center md:gap-3 md:flex-shrink-0">
                  {/* Medalla de plata */}
                  <svg className="w-16 h-16 lg:w-20 lg:h-20 text-gray-400 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L10 8L8 2L6 8L4 2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="15" r="7" strokeWidth="2"/>
                    <path d="M12 11L12.5 13L14.5 13.5L12.5 14L12 16L11.5 14L9.5 13.5L11.5 13L12 11Z" fill="currentColor" strokeWidth="0"/>
                  </svg>
                  {/* Medalla de bronce */}
                  <svg className="w-14 h-14 lg:w-16 lg:h-16 text-amber-600 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L10 8L8 2L6 8L4 2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="15" r="7" strokeWidth="2"/>
                    <path d="M12 11L12.5 13L14.5 13.5L12.5 14L12 16L11.5 14L9.5 13.5L11.5 13L12 11Z" fill="currentColor" strokeWidth="0"/>
                  </svg>
                </div>
                
                {/* Contenido principal */}
                <div className="flex-1">
                  {/* Subtítulo */}
                  <div className="mb-3 text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-gray-400">
                   {t.silverBronzeSubtitle}
                  </div>
                  
                  {/* Título principal */}
                  <h3 className="mb-4 text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-white">
                     {t.silverBronzeTitle}
                    </span>
                  </h3>
                  
                  {/* Información */}
                  <div className="border-l-4 border-gray-400 pl-4 py-2">
                    <p className="text-base md:text-lg font-semibold text-gray-200 leading-relaxed">
                     {t.silverBronzeMedals} <span className="text-gray-300">{t.silverBronzeSilver}</span><br/>
                     <span className="text-amber-500">{t.silverBronzeAnd} {t.silverBronzeBronze}</span>
                    </p>
                  </div>
                  
                  {/* Iconos pequeños - solo visible en móvil */}
                  <div className="mt-8 mb-6 flex justify-center gap-3 md:hidden">
                    <svg className="w-16 h-16 text-gray-400 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2L10 8L8 2L6 8L4 2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="15" r="7" strokeWidth="2"/>
                      <path d="M12 11L12.5 13L14.5 13.5L12.5 14L12 16L11.5 14L9.5 13.5L11.5 13L12 11Z" fill="currentColor" strokeWidth="0"/>
                    </svg>
                    <svg className="w-14 h-14 text-amber-600 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2L10 8L8 2L6 8L4 2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="15" r="7" strokeWidth="2"/>
                      <path d="M12 11L12.5 13L14.5 13.5L12.5 14L12 16L11.5 14L9.5 13.5L11.5 13L12 11Z" fill="currentColor" strokeWidth="0"/>
                    </svg>
                  </div>
                  
                  {/* Detalle adicional */}
                  <div className="pt-4 border-t border-white/10 md:mt-6">
                    <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                     {t.silverBronzeDetail}
                    </p>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tercer Mejor Culturista del Año - Entrada desde la izquierda con estilo Netflix */}
      <div ref={bestBodybuilderRef} className="fixed inset-0 z-[69] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden' }}>
        <div className="relative mx-4 md:mx-8 w-full max-w-3xl">
          {/* Glow de fondo bronce */}
          <div className="absolute -inset-8 bg-amber-600/20 blur-[100px] rounded-full" />
          
          {/* Contenedor principal con glassmorphism */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-2xl opacity-60 blur-[8px] bg-[linear-gradient(135deg,rgba(217,119,6,0.7),rgba(255,255,255,0.1),rgba(217,119,6,0.7))]" />
            <div className="relative rounded-2xl border border-white/20 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.7)] px-6 py-8 md:px-10 md:py-12">
              {/* Barra bronce superior */}
              <div className="absolute top-0 left-0 h-2 w-32 md:w-48 bg-gradient-to-r from-amber-700 to-amber-500 rounded-tr-2xl rounded-tl-2xl shadow-[0_0_20px_rgba(217,119,6,0.8)]" />
              
              {/* Layout responsive: móvil = columna, desktop = fila con icono a la izquierda */}
              <div className="flex flex-col md:flex-row md:items-center md:gap-8">
                
                {/* Icono de trofeo SVG - solo visible en desktop */}
                <div className="hidden md:flex md:items-center md:justify-center md:flex-shrink-0">
                  <svg className="w-24 h-24 lg:w-28 lg:h-28 text-amber-600 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {/* Copa */}
                    <path d="M6 9H3C3 11.5 4 13 6 13" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 9H21C21 11.5 20 13 18 13" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 9V6C6 5.5 6.5 5 7 5H17C17.5 5 18 5.5 18 6V9" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 13V14C6 15.5 7 17 9 17.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 13V14C18 15.5 17 17 15 17.5" strokeLinecap="round" strokeLinejoin="round"/>
                    {/* Base */}
                    <path d="M10 17.5V19H14V17.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 19H16V21H8V19Z" strokeLinecap="round" strokeLinejoin="round"/>
                    {/* Número 3 en el centro */}
                    <text x="12" y="11" fontSize="6" fill="currentColor" textAnchor="middle" fontWeight="bold">3</text>
                  </svg>
                </div>
                
                {/* Contenido principal */}
                <div className="flex-1">
                  {/* Subtítulo */}
                  <div className="mb-3 text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-amber-600">
                   {t.bestBodybuilderSubtitle}
                  </div>
                  
                  {/* Título principal */}
                  <h3 className="mb-4 text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-white">
                     {t.bestBodybuilderTitle}
                    </span>
                  </h3>
                  
                  {/* Información */}
                  <div className="border-l-4 border-amber-600 pl-4 py-2">
                    <p className="text-base md:text-lg font-semibold text-gray-200 leading-relaxed">
                     {t.bestBodybuilderNamed} <span className="text-amber-500">{t.bestBodybuilderThird}</span><br/>
                     <span className="text-amber-400">{t.bestBodybuilderBest}</span>
                    </p>
                  </div>
                  
                  {/* Icono pequeño - solo visible en móvil */}
                  <div className="mt-8 mb-6 flex justify-center md:hidden">
                    <svg className="w-20 h-20 text-amber-600 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 9H3C3 11.5 4 13 6 13" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18 9H21C21 11.5 20 13 18 13" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 9V6C6 5.5 6.5 5 7 5H17C17.5 5 18 5.5 18 6V9" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 13V14C6 15.5 7 17 9 17.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18 13V14C18 15.5 17 17 15 17.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 17.5V19H14V17.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 19H16V21H8V19Z" strokeLinecap="round" strokeLinejoin="round"/>
                      <text x="12" y="11" fontSize="6" fill="currentColor" textAnchor="middle" fontWeight="bold">3</text>
                    </svg>
                  </div>
                  
                  {/* Detalle adicional */}
                  <div className="pt-4 border-t border-white/10 md:mt-6">
                    <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                     {t.bestBodybuilderDetail}
                    </p>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Párrafo "Pero esta vez..." - Aparece con zoom out detrás del módulo anterior (z-index menor) */}
      <div ref={newMeaningParaRef} className="fixed inset-0 z-[68] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden', opacity: 0, transform: 'scale(1.5)' }}>
        <div className="pointer-events-none relative mx-4 md:mx-0 w-full max-w-3xl">
          <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[6px] bg-[linear-gradient(135deg,rgba(229,9,20,0.6),rgba(255,255,255,0.08),rgba(229,9,20,0.6))]" />
          <div className="relative rounded-3xl border border-white/10 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.6)] px-6 py-8 md:px-12 md:py-12">
            <div className="absolute top-0 left-0 h-1.5 w-28 md:w-40 bg-red-600 rounded-tr-3xl rounded-tl-3xl" />
            <p className="text-base md:text-lg leading-relaxed text-gray-100">
              {t.newMeaningParagraph}
            </p>
          </div>
        </div>
      </div>

      {/* Párrafo "Ese mismo año, fue invitado a la India..." - Entrada desde derecha con efecto typewriter */}
      <div ref={indiaParaRef} className="fixed inset-0 z-[68] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden' }}>
        <div className="pointer-events-none relative mx-4 md:mx-0 w-full max-w-3xl">
          <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[6px] bg-[linear-gradient(135deg,rgba(229,9,20,0.6),rgba(255,255,255,0.08),rgba(229,9,20,0.6))]" />
          <div className="relative rounded-3xl border border-white/10 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.6)] px-6 py-8 md:px-12 md:py-12">
            <div className="absolute top-0 left-0 h-1.5 w-28 md:w-40 bg-red-600 rounded-tr-3xl rounded-tl-3xl" />
            <p className="text-base md:text-lg leading-relaxed text-gray-100">
              {/* El texto se llenará dinámicamente con el efecto typewriter */}
            </p>
          </div>
        </div>
      </div>

      {/* Imagen bernat-stage - Entrada desde izquierda con estética glassmorphism */}
      <div ref={stageImageRef} className="fixed inset-0 z-[69] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden' }}>
        <div className="pointer-events-none relative w-full max-w-2xl md:max-w-3xl px-6 md:px-0">
          {/* Glow rojo y marco glass */}
          <div className="absolute -inset-1 rounded-3xl opacity-60 blur-sm bg-[linear-gradient(135deg,rgba(229,9,20,0.5),rgba(255,255,255,0.08),rgba(229,9,20,0.5))]" />
          <div className="relative rounded-3xl border border-white/15 bg-black/40 backdrop-blur-md overflow-hidden">
            <div className="absolute top-0 left-0 h-1.5 w-24 md:w-36 bg-red-600 rounded-tr-3xl rounded-tl-3xl" />
            <img src="/images/about/biography/bernat-stage.webp" alt="Bernat on stage" className="w-full h-auto object-contain" />
          </div>
        </div>
      </div>

      {/* Imagen bernat-family - Entrada desde derecha con estética glassmorphism */}
      <div ref={familyImageRef} className="fixed inset-0 z-[69] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden' }}>
        <div className="pointer-events-none relative w-full max-w-2xl md:max-w-3xl px-6 md:px-0">
          {/* Glow rojo y marco glass */}
          <div className="absolute -inset-1 rounded-3xl opacity-60 blur-sm bg-[linear-gradient(135deg,rgba(229,9,20,0.5),rgba(255,255,255,0.08),rgba(229,9,20,0.5))]" />
          <div className="relative rounded-3xl border border-white/15 bg-black/40 backdrop-blur-md overflow-hidden">
            <div className="absolute top-0 left-0 h-1.5 w-24 md:w-36 bg-red-600 rounded-tr-3xl rounded-tl-3xl" />
            <img src="/images/about/biography/bernat-family.webp" alt="Bernat with students in India" className="w-full h-auto object-contain" />
          </div>
        </div>
      </div>

      {/* H2 "Mi Filosofía: Más Allá del Fitness" - Aparece desde el centro con zoom out épico */}
      <div ref={philosophyTextRef} className="fixed inset-0 z-[68] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden', opacity: 0, transform: 'scale(1.8)' }}>
        <div className="relative w-full max-w-6xl px-6 md:px-12">
          
          {/* Líneas decorativas de fondo */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
            {/* Línea horizontal superior */}
            <div className="absolute left-0 top-1/3 w-full h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />
            {/* Línea horizontal inferior */}
            <div className="absolute left-0 bottom-1/3 w-full h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />
          </div>

          {/* Subtítulo pequeño arriba */}
          <div className="mb-4 text-center">
            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-red-600 opacity-80">
               {t.gymSubtitle}
            </p>
          </div>
          
          {/* Título principal - cada palabra es fragmentable */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black uppercase leading-tight tracking-tight text-center">
            {(() => {
              if (lang === 'es') {
                return (
                  <>
            <span className="block mb-2">
                      <span ref={philosophyWord1Ref} className="inline-block text-white will-change-transform mr-3">{t.philosophyWord1}</span>
                      <span ref={philosophyWord2Ref} className="inline-block text-red-600 will-change-transform">{t.philosophyWord2}</span>
            </span>
            <span className="block">
                      <span ref={philosophyWord3Ref} className="inline-block text-white will-change-transform mr-3">{t.philosophyWord3}</span>
                      <span ref={philosophyWord4Ref} className="inline-block text-white will-change-transform mr-3">{t.philosophyWord4}</span>
                      <span ref={philosophyWord5Ref} className="inline-block text-white will-change-transform mr-3">{t.philosophyWord5}</span>
                      <span ref={philosophyWord6Ref} className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-600 will-change-transform">{t.philosophyWord6}</span>
            </span>
                  </>
                );
              } else if (lang === 'en') {
                return (
                  <>
                    <span className="block mb-2">
                      <span ref={philosophyWord1Ref} className="inline-block text-white will-change-transform mr-3">{t.philosophyWord1}</span>
                      <span ref={philosophyWord2Ref} className="inline-block text-red-600 will-change-transform">{t.philosophyWord2}</span>
                    </span>
                    <span className="block">
                      <span ref={philosophyWord3Ref} className="inline-block text-white will-change-transform mr-3">{t.philosophyWord3}</span>
                      <span ref={philosophyWord4Ref} className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-600 will-change-transform">{t.philosophyWord4}</span>
                    </span>
                  </>
                );
              } else if (lang === 'fr') {
                return (
                  <>
                    <span className="block mb-2">
                      <span ref={philosophyWord1Ref} className="inline-block text-white will-change-transform mr-3">{t.philosophyWord1}</span>
                      <span ref={philosophyWord2Ref} className="inline-block text-red-600 will-change-transform">{t.philosophyWord2}</span>
                    </span>
                    <span className="block">
                      <span ref={philosophyWord3Ref} className="inline-block text-white will-change-transform mr-3">{t.philosophyWord3}</span>
                      <span ref={philosophyWord4Ref} className="inline-block text-white will-change-transform mr-3">{t.philosophyWord4}</span>
                      <span ref={philosophyWord5Ref} className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-600 will-change-transform">{t.philosophyWord5}</span>
                    </span>
                  </>
                );
              }
            })()}
          </h2>

          {/* Línea decorativa inferior */}
          <div className="mt-6 flex justify-center">
            <div className="w-32 md:w-48 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-full" />
          </div>
        </div>
      </div>

      {/* Párrafo "Tras su exitosa carrera..." - Aparece con zoom in detrás del H2 (z-index menor) */}
      <div ref={scorusParaRef} className="fixed inset-0 z-[67] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden', opacity: 0, transform: 'scale(1.5)' }}>
        <div className="pointer-events-none relative mx-4 md:mx-0 w-full max-w-3xl">
          <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[6px] bg-[linear-gradient(135deg,rgba(229,9,20,0.6),rgba(255,255,255,0.08),rgba(229,9,20,0.6))]" />
          <div className="relative rounded-3xl border border-white/10 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.6)] px-6 py-8 md:px-12 md:py-12">
            <div className="absolute top-0 left-0 h-1.5 w-28 md:w-40 bg-red-600 rounded-tr-3xl rounded-tl-3xl" />
            <p className="text-base md:text-lg leading-relaxed text-gray-100">
              {t.scorusFitnessParagraph}
            </p>
          </div>
        </div>
      </div>

      {/* Módulo "Entrenamiento" - Aparece con zoom out (z-index menor, por detrás del párrafo) */}
      <div ref={trainingModuleRef} className="fixed inset-0 z-[66] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden', opacity: 0, transform: 'scale(1.5)' }}>
        <div className="relative mx-4 md:mx-8 w-full max-w-md">
          <div className="absolute -inset-6 bg-red-600/20 blur-[80px] rounded-full" />
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[8px] bg-[linear-gradient(135deg,rgba(229,9,20,0.7),rgba(255,255,255,0.1),rgba(229,9,20,0.7))]" />
            <div className="relative rounded-3xl border border-white/20 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.7)] px-8 py-12">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6">
                  <svg className="w-16 h-16 md:w-20 md:h-20 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                  </svg>
                </div>
                <h3 className="mb-3 text-2xl md:text-3xl font-black uppercase tracking-tight text-white">{t.trainingModuleTitle}</h3>
                <div className="mb-4 w-16 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
                <p className="text-sm md:text-base text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.trainingModuleDescription }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Módulo "Nutrición" */}
      <div ref={nutritionModuleRef} className="fixed inset-0 z-[66] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden', opacity: 0, transform: 'scale(1.5)' }}>
        <div className="relative mx-4 md:mx-8 w-full max-w-md">
          <div className="absolute -inset-6 bg-red-600/20 blur-[80px] rounded-full" />
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[8px] bg-[linear-gradient(135deg,rgba(229,9,20,0.7),rgba(255,255,255,0.1),rgba(229,9,20,0.7))]" />
            <div className="relative rounded-3xl border border-white/20 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.7)] px-8 py-12">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6">
                  <svg className="w-16 h-16 md:w-20 md:h-20 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20ZM13 7H11V11H7V13H11V17H13V13H17V11H13V7Z"/>
                  </svg>
                </div>
                <h3 className="mb-3 text-2xl md:text-3xl font-black uppercase tracking-tight text-white">{t.nutritionModuleTitle}</h3>
                <div className="mb-4 w-16 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
                <p className="text-sm md:text-base text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.nutritionModuleDescription }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Módulo "Seguimiento" */}
      <div ref={trackingModuleRef} className="fixed inset-0 z-[66] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden', opacity: 0, transform: 'scale(1.5)' }}>
        <div className="relative mx-4 md:mx-8 w-full max-w-md">
          <div className="absolute -inset-6 bg-red-600/20 blur-[80px] rounded-full" />
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[8px] bg-[linear-gradient(135deg,rgba(229,9,20,0.7),rgba(255,255,255,0.1),rgba(229,9,20,0.7))]" />
            <div className="relative rounded-3xl border border-white/20 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.7)] px-8 py-12">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6">
                  <svg className="w-16 h-16 md:w-20 md:h-20 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"/>
                  </svg>
                </div>
                <h3 className="mb-3 text-2xl md:text-3xl font-black uppercase tracking-tight text-white">{t.trackingModuleTitle}</h3>
                <div className="mb-4 w-16 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
                <p className="text-sm md:text-base text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.trackingModuleDescription }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Módulo "REBORN y Scorus Campus" */}
      <div ref={rebornModuleRef} className="fixed inset-0 z-[66] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden', opacity: 0, transform: 'scale(1.5)' }}>
        <div className="relative mx-4 md:mx-8 w-full max-w-md">
          <div className="absolute -inset-6 bg-red-600/20 blur-[80px] rounded-full" />
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[8px] bg-[linear-gradient(135deg,rgba(229,9,20,0.7),rgba(255,255,255,0.1),rgba(229,9,20,0.7))]" />
            <div className="relative rounded-3xl border border-white/20 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.7)] px-8 py-12">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6">
                  <svg className="w-16 h-16 md:w-20 md:h-20 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L4 5V11C4 16.55 7.84 21.74 13 23C18.16 21.74 22 16.55 22 11V5L14 2L12 2ZM12 4.18L20 7V11C20 15.52 17.02 19.69 13 20.93C8.98 19.69 6 15.52 6 11V7L12 4.18ZM10.59 13.41L8.83 11.66L7.41 13.07L10.59 16.24L16.59 10.24L15.17 8.83L10.59 13.41Z"/>
                  </svg>
                </div>
                <h3 className="mb-3 text-2xl md:text-3xl font-black uppercase tracking-tight text-white" dangerouslySetInnerHTML={{ __html: t.rebornModuleTitle }} />
                <div className="mb-4 w-16 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
                <p className="text-sm md:text-base text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.rebornModuleDescription }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Módulo "ScorusGYM" */}
      <div ref={scorusGymModuleRef} className="fixed inset-0 z-[66] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden', opacity: 0, transform: 'scale(1.5)' }}>
        <div className="relative mx-4 md:mx-8 w-full max-w-md">
          <div className="absolute -inset-6 bg-red-600/20 blur-[80px] rounded-full" />
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[8px] bg-[linear-gradient(135deg,rgba(229,9,20,0.7),rgba(255,255,255,0.1),rgba(229,9,20,0.7))]" />
            <div className="relative rounded-3xl border border-white/20 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.7)] px-8 py-12">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6">
                  <svg className="w-16 h-16 md:w-20 md:h-20 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.5 5.5C14.59 5.5 15.5 4.58 15.5 3.5C15.5 2.38 14.59 1.5 13.5 1.5C12.39 1.5 11.5 2.38 11.5 3.5C11.5 4.58 12.39 5.5 13.5 5.5ZM9.89 19.38L10.89 15L13 17V23H15V15.5L12.89 13.5L13.5 10.5C14.79 12 16.79 13 19 13V11C17.09 11 15.5 10 14.69 8.58L13.69 7C13.29 6.4 12.69 6 12 6C11.69 6 11.5 6.08 11.19 6.08L6 8.28V13H8V9.58L9.79 8.88L8.19 17L3.29 16L2.89 18L9.89 19.38Z"/>
                  </svg>
                </div>
                <h3 className="mb-3 text-2xl md:text-3xl font-black uppercase tracking-tight text-white">{t.scorusGymModuleTitle}</h3>
                <div className="mb-4 w-16 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
                <p className="text-sm md:text-base text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.scorusGymModuleDescription }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Párrafo "Su enfoque es holístico..." - Aparece con zoom out después de ScorusGYM */}
      <div ref={holisticParaRef} className="fixed inset-0 z-[66] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden', opacity: 0, transform: 'scale(1.5)' }}>
        <div className="pointer-events-none relative mx-4 md:mx-0 w-full max-w-3xl">
          <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[6px] bg-[linear-gradient(135deg,rgba(229,9,20,0.6),rgba(255,255,255,0.08),rgba(229,9,20,0.6))]" />
          <div className="relative rounded-3xl border border-white/10 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.6)] px-6 py-8 md:px-12 md:py-12">
            <div className="absolute top-0 left-0 h-1.5 w-28 md:w-40 bg-red-600 rounded-tr-3xl rounded-tl-3xl" />
            <p className="text-base md:text-lg leading-relaxed text-gray-100">
              {t.holisticParagraph}
            </p>
          </div>
        </div>
      </div>

      {/* Fondo negro final (aparece detrás de las piezas geométricas) */}
      <div ref={finalBlackBgRef} className="fixed inset-0 z-[5] will-change-transform" style={{ visibility: 'hidden', opacity: 0 }}>
        <div className="absolute inset-0 bg-black" />
      </div>

      {/* Animación geométrica de cierre épica */}
      <div ref={geometricClosureRef} className="fixed inset-0 z-[67] pointer-events-none will-change-transform" style={{ visibility: 'hidden' }}>
        
        {/* Pieza SUPERIOR IZQUIERDA - Grande e irregular */}
        <div className="geo-piece absolute top-0 left-0 w-[45%] h-[40%] will-change-transform" data-direction="top-left" style={{ transform: 'translate(-100%, -100%)' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,0 L100,0 L85,45 Q70,55 55,60 L40,70 Q25,80 15,90 L0,100 Z" fill="url(#gradTopLeft)" />
            <defs>
              <linearGradient id="gradTopLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#000', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#0a0a0a', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#000', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Pieza SUPERIOR DERECHA - Grande e irregular */}
        <div className="geo-piece absolute top-0 right-0 w-[45%] h-[40%] will-change-transform" data-direction="top-right" style={{ transform: 'translate(100%, -100%)' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
            <path d="M100,0 L0,0 L15,45 Q30,55 45,60 L60,70 Q75,80 85,90 L100,100 Z" fill="url(#gradTopRight)" />
            <defs>
              <linearGradient id="gradTopRight" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#000', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#0a0a0a', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#000', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Pieza INFERIOR IZQUIERDA - Grande e irregular */}
        <div className="geo-piece absolute bottom-0 left-0 w-[45%] h-[40%] will-change-transform" data-direction="bottom-left" style={{ transform: 'translate(-100%, 100%)' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,100 L0,0 L15,10 Q30,20 40,30 L55,40 Q70,45 85,55 L100,100 Z" fill="url(#gradBottomLeft)" />
            <defs>
              <linearGradient id="gradBottomLeft" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#000', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#0a0a0a', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#000', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Pieza INFERIOR DERECHA - Grande e irregular */}
        <div className="geo-piece absolute bottom-0 right-0 w-[45%] h-[40%] will-change-transform" data-direction="bottom-right" style={{ transform: 'translate(100%, 100%)' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
            <path d="M100,100 L100,0 L85,10 Q70,20 60,30 L45,40 Q30,45 15,55 L0,100 Z" fill="url(#gradBottomRight)" />
            <defs>
              <linearGradient id="gradBottomRight" x1="100%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#000', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#0a0a0a', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#000', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Pieza SUPERIOR CENTRAL - Conecta las superiores */}
        <div className="geo-piece absolute top-0 left-[40%] w-[20%] h-[25%] will-change-transform" data-direction="top" style={{ transform: 'translateY(-100%)' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,0 L100,0 L90,50 Q50,70 10,50 Z" fill="url(#gradTop)" />
            <defs>
              <linearGradient id="gradTop" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#000', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#0a0a0a', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Pieza INFERIOR CENTRAL - Conecta las inferiores */}
        <div className="geo-piece absolute bottom-0 left-[40%] w-[20%] h-[25%] will-change-transform" data-direction="bottom" style={{ transform: 'translateY(100%)' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,100 L10,50 Q50,30 90,50 L100,100 Z" fill="url(#gradBottom)" />
            <defs>
              <linearGradient id="gradBottom" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#000', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#0a0a0a', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Pieza IZQUIERDA CENTRAL - Conecta las izquierdas */}
        <div className="geo-piece absolute top-[35%] left-0 w-[15%] h-[30%] will-change-transform" data-direction="left" style={{ transform: 'translateX(-100%)' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,0 L50,10 Q70,50 50,90 L0,100 Z" fill="url(#gradLeft)" />
            <defs>
              <linearGradient id="gradLeft" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" style={{ stopColor: '#000', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#0a0a0a', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Pieza DERECHA CENTRAL - Conecta las derechas */}
        <div className="geo-piece absolute top-[35%] right-0 w-[15%] h-[30%] will-change-transform" data-direction="right" style={{ transform: 'translateX(100%)' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
            <path d="M100,0 L50,10 Q30,50 50,90 L100,100 Z" fill="url(#gradRight)" />
            <defs>
              <linearGradient id="gradRight" x1="100%" y1="50%" x2="0%" y2="50%">
                <stop offset="0%" style={{ stopColor: '#000', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#0a0a0a', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Líneas geométricas con efecto glow rojo */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Línea diagonal principal (top-left a bottom-right) */}
          <div className="absolute top-[15%] left-[20%] w-[60%] h-[2px] bg-gradient-to-r from-transparent via-red-600/80 to-transparent rotate-[-45deg] origin-left shadow-[0_0_10px_rgba(229,9,20,0.8)]" style={{ transformOrigin: '0% 50%' }} />
          
          {/* Línea diagonal secundaria (top-right a bottom-left) */}
          <div className="absolute top-[20%] right-[15%] w-[55%] h-[2px] bg-gradient-to-r from-transparent via-red-600/70 to-transparent rotate-[45deg] origin-right shadow-[0_0_10px_rgba(229,9,20,0.7)]" style={{ transformOrigin: '100% 50%' }} />
          
          {/* Líneas más pequeñas */}
          <div className="absolute top-[40%] left-[10%] w-[30%] h-[1px] bg-gradient-to-r from-transparent via-red-500/60 to-transparent rotate-[20deg] shadow-[0_0_8px_rgba(229,9,20,0.6)]" />
          <div className="absolute bottom-[35%] right-[20%] w-[35%] h-[1px] bg-gradient-to-r from-transparent via-red-500/60 to-transparent rotate-[-30deg] shadow-[0_0_8px_rgba(229,9,20,0.6)]" />
        </div>
      </div>

      {/* Texto "El Regreso Triunfal" - Estilo similar a "Títulos y Logros Internacionales" */}
      <div ref={triumphTextRef} className="fixed inset-0 z-[71] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden' }}>
        <div className="relative w-full max-w-6xl px-6 md:px-12">
          
          {/* Líneas diagonales de fondo (efecto épico con animación) */}
          <div ref={triumphLinesRef} className="absolute inset-0 pointer-events-none overflow-hidden will-change-transform" style={{ opacity: 0, transform: 'scale(0.5)' }}>
            {/* Línea 1 */}
            <div className="absolute" style={{ left: '15%', top: '10%' }}>
              <div className="h-[120px] w-[8px] bg-gradient-to-b from-red-500 via-red-600 to-transparent rotate-[135deg] origin-top shadow-[0_0_24px_rgba(239,68,68,0.9)]" />
            </div>
            {/* Línea 2 */}
            <div className="absolute" style={{ left: '35%', top: '5%' }}>
              <div className="h-[90px] w-[6px] bg-gradient-to-b from-pink-500 via-red-500 to-transparent rotate-[135deg] origin-top shadow-[0_0_18px_rgba(236,72,153,0.8)]" />
            </div>
            {/* Línea 3 */}
            <div className="absolute" style={{ right: '25%', bottom: '15%' }}>
              <div className="h-[110px] w-[7px] bg-gradient-to-b from-red-600 via-red-700 to-transparent rotate-[135deg] origin-top shadow-[0_0_22px_rgba(220,38,38,0.9)]" />
            </div>
            {/* Línea 4 */}
            <div className="absolute" style={{ right: '45%', bottom: '10%' }}>
              <div className="h-[85px] w-[5px] bg-gradient-to-b from-red-500 via-pink-600 to-transparent rotate-[135deg] origin-top shadow-[0_0_16px_rgba(239,68,68,0.75)]" />
            </div>
          </div>

          {/* Subtítulo pequeño arriba */}
          <div className="mb-4 text-center">
            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-white opacity-70">
              {t.gymSubtitle}
            </p>
          </div>
          
          {/* Título principal - cada palabra es fragmentable */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black uppercase leading-tight tracking-tight text-center">
            {(() => {
              const title = t.triumphTitle;
              if (lang === 'es') {
                return (
                  <>
            <span className="block">
              <span ref={triumphTitle1Ref} className="inline-block text-red-600 will-change-transform mr-3" style={{ opacity: 1 }}>El Regreso</span>
              <span ref={triumphTitle2Ref} className="inline-block text-white will-change-transform" style={{ opacity: 1 }}>Triunfal:</span>
            </span>
            <span className="block text-white">
              <span ref={triumphTitle3Ref} className="inline-block will-change-transform mr-3" style={{ opacity: 1 }}>Más</span>
              <span ref={triumphTitle4Ref} className="inline-block will-change-transform mr-3" style={{ opacity: 1 }}>Fuerte</span>
              <span ref={triumphTitle5Ref} className="inline-block will-change-transform mr-3" style={{ opacity: 1 }}>que</span>
              <span ref={triumphTitle6Ref} className="inline-block will-change-transform" style={{ opacity: 1 }}>Nunca</span>
            </span>
                  </>
                );
              } else if (lang === 'en') {
                return (
                  <>
                    <span className="block">
                      <span ref={triumphTitle1Ref} className="inline-block text-red-600 will-change-transform mr-3" style={{ opacity: 1 }}>The Triumphant</span>
                      <span ref={triumphTitle2Ref} className="inline-block text-white will-change-transform" style={{ opacity: 1 }}>Return:</span>
                    </span>
                    <span className="block text-white">
                      <span ref={triumphTitle3Ref} className="inline-block will-change-transform mr-3" style={{ opacity: 1 }}>Stronger</span>
                      <span ref={triumphTitle4Ref} className="inline-block will-change-transform mr-3" style={{ opacity: 1 }}>Than</span>
                      <span ref={triumphTitle5Ref} className="inline-block will-change-transform mr-3" style={{ opacity: 1 }}>Ever</span>
                    </span>
                  </>
                );
              } else if (lang === 'fr') {
                return (
                  <>
                    <span className="block text-white">
                      <span ref={triumphTitle1Ref} className="inline-block will-change-transform mr-3" style={{ opacity: 1 }}>Le</span>
                      <span ref={triumphTitle2Ref} className="inline-block text-red-600 will-change-transform mr-3" style={{ opacity: 1 }}>Retour</span>
                      <span ref={triumphTitle3Ref} className="inline-block will-change-transform" style={{ opacity: 1 }}>Triomphal</span>
                    </span>
                  </>
                );
              }
            })()}
          </h2>
        </div>
      </div>

      {/* Contenido inicial (Bernat Scorus) */}
      <div className="container relative z-10 max-w-3xl px-4 text-center select-none">
        <h2 className="mb-4 text-5xl md:text-7xl font-black uppercase tracking-tight leading-none">
          <span ref={titleLeftRef} className="inline-block will-change-transform">{t.introName.split(' ')[0]} </span>
          <span ref={titleRightRef} className="inline-block text-red-600 will-change-transform">{t.introName.split(' ')[1]}</span>
        </h2>
        <h3 ref={subtitleRef} className="mb-6 text-sm md:text-base font-semibold uppercase tracking-widest text-red-500 will-change-transform">
          {t.introSubtitle}
        </h3>
        <p ref={bodyRef} className="mx-auto max-w-2xl text-sm md:text-lg leading-relaxed text-gray-200 will-change-transform">
          {t.introBody}
        </p>
      </div>

      {/* Nuevo bloque: solo H2 (sobre el vídeo) */}
      <div ref={nextTitleBlockRef} className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
        <div ref={nextTitleInnerRef} className="container max-w-5xl px-4 md:px-8 will-change-transform">
          <h2 ref={nextTitleRef} className="text-center text-3xl md:text-5xl font-black uppercase tracking-tight text-white will-change-transform">
            {t.titleChildhood.split(' ').map((word, index) => {
              const isHighlighted = index >= 4; // Resaltar a partir de la palabra "Primeros"
              const animClass = index % 2 === 0 ? 'flip-up' : 'flip-down';
              const colorClass = isHighlighted ? 'text-transparent bg-clip-text [background-image:linear-gradient(90deg,rgba(229,9,20,1),rgba(229,9,20,1))]' : '';
              return (
                <span key={index} className={`${animClass} inline-block ${index > 0 ? (index === 3 || index === 4 ? 'ml-3' : 'ml-2') : ''} ${colorClass}`}>
                  {word}
                </span>
              );
            })}
          </h2>
          <div className="mt-4 max-w-3xl mx-auto text-base md:text-lg leading-relaxed text-gray-100 text-left">
            <span ref={nextBodyRef}></span>
          </div>
        </div>
      </div>

      {/* NUEVO H2: Entrenador Personal en Alicante y Campeón del Mundo */}
      <div ref={newH2Ref} className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden', opacity: 0, transform: 'scale(1.5)' }}>
        <div className="relative w-full max-w-6xl px-6 md:px-12">
          
          {/* Líneas decorativas de fondo sutiles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
            <div className="absolute left-0 top-1/3 w-full h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />
            <div className="absolute left-0 bottom-1/3 w-full h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />
          </div>

          {/* Subtítulo pequeño */}
          <div className="mb-4 text-center">
            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-red-600 opacity-80">
              {t.introName}
            </p>
          </div>
          
          {/* Título principal */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black uppercase leading-tight tracking-tight text-center">
            {(() => {
              const title = t.newH2Title;
              if (lang === 'es') {
                return (
                  <>
            <span className="block mb-2">
              <span className="text-red-600">Entrenador Personal</span>
            </span>
            <span className="block mb-2">
              <span className="text-white">en Alicante</span>
            </span>
            <span className="block">
              <span className="text-white">y </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-600">Campeón del Mundo</span>
            </span>
            <span className="block">
              <span className="text-white">de </span>
              <span className="text-red-600">Culturismo</span>
            </span>
                  </>
                );
              } else if (lang === 'en') {
                return (
                  <>
                    <span className="block mb-2">
                      <span className="text-red-600">Personal Trainer</span>
                    </span>
                    <span className="block mb-2">
                      <span className="text-white">in Alicante</span>
                    </span>
                    <span className="block">
                      <span className="text-white">and </span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-600">World Bodybuilding</span>
                    </span>
                    <span className="block">
                      <span className="text-red-600">Champion</span>
                    </span>
                  </>
                );
              } else if (lang === 'fr') {
                return (
                  <>
                    <span className="block mb-2">
                      <span className="text-red-600">Entraîneur Personnel</span>
                    </span>
                    <span className="block mb-2">
                      <span className="text-white">à Alicante</span>
                    </span>
                    <span className="block">
                      <span className="text-white">et </span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-600">Champion du Monde</span>
                    </span>
                    <span className="block">
                      <span className="text-white">de </span>
                      <span className="text-red-600">Culturisme</span>
                    </span>
                  </>
                );
              }
            })()}
          </h2>

          {/* Línea decorativa inferior */}
          <div className="mt-6 flex justify-center">
            <div className="w-32 md:w-48 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-full" />
          </div>
        </div>
      </div>

      {/* NUEVO PÁRRAFO: Experiencia de 25 años (con efecto de escritura) */}
      <div ref={experienceParaRef} className="fixed inset-0 z-[69] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden', opacity: 0 }}>
        <div className="pointer-events-none relative mx-4 md:mx-0 w-full max-w-3xl">
          <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[6px] bg-[linear-gradient(135deg,rgba(229,9,20,0.6),rgba(255,255,255,0.08),rgba(229,9,20,0.6))]" />
          <div className="relative rounded-3xl border border-white/10 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.6)] px-6 py-8 md:px-12 md:py-12">
            <div className="absolute top-0 left-0 h-1.5 w-28 md:w-40 bg-red-600 rounded-tr-3xl rounded-tl-3xl" />
            <p ref={experienceParaTextRef} className="text-base md:text-lg leading-relaxed text-gray-100 whitespace-pre-wrap will-change-transform"></p>
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
                   {t.tabProgresionLabel}
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
                   {t.tabWorkoutLabel}
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
                   {t.tabNutricionLabel}
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

    {/* CTA FINAL - FUERA del containerRef para que NO desaparezca */}
    <div ref={finalCtaRef} className="fixed inset-0 z-[45] flex items-center justify-center pointer-events-none will-change-transform" style={{ visibility: 'hidden', opacity: 0, transform: 'scale(1.5)' }}>
      <div className="relative mx-4 md:mx-8 w-full max-w-5xl">
        <div className="relative">
          <div className="absolute -inset-0.5 rounded-3xl opacity-60 blur-[6px] bg-[linear-gradient(135deg,rgba(229,9,20,0.6),rgba(255,255,255,0.08),rgba(229,9,20,0.6))]" />
          <div className="relative rounded-3xl border border-white/10 bg-black/70 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.6)] px-4 py-6 md:px-16 md:py-16">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1.5 w-20 md:w-48 bg-red-600 rounded-bl-3xl rounded-br-3xl" />
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1 h-20 md:h-48 bg-gradient-to-b from-transparent via-red-600 to-transparent" />
            <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1 h-20 md:h-48 bg-gradient-to-b from-transparent via-red-600 to-transparent" />
            <h2 className="mb-3 md:mb-6 text-center text-2xl md:text-5xl lg:text-6xl font-black uppercase leading-tight tracking-tight">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-red-500 to-white">
                {t.ctaTitle}
              </span>
              <span className="block mt-1 md:mt-2 text-red-600">
                {t.ctaSubtitle}
              </span>
            </h2>
            <div className="mb-4 md:mb-8 flex justify-center">
              <div className="w-20 md:w-48 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-full" />
            </div>
            <div className="mb-4 md:mb-10 max-w-3xl mx-auto">
              <p className="text-sm md:text-xl lg:text-2xl text-center leading-relaxed text-gray-100 font-medium">
                {t.ctaDescription}
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 md:gap-4">
              <p className="text-base md:text-2xl text-white font-bold text-center px-2">
                {t.ctaText}
              </p>
              <a 
                href={t.contactUrl} 
                className="pointer-events-auto group relative inline-flex items-center justify-center px-6 py-3 md:px-14 md:py-6 text-base md:text-2xl font-black uppercase tracking-wider text-white transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-red-600 to-red-700 rounded-xl transition-all duration-300" />
                <div className="absolute inset-0 rounded-xl border-2 border-red-500/50 group-hover:border-red-400 transition-all duration-300" />
                <span className="relative z-10 flex items-center gap-2 md:gap-3">
                  {t.ctaButton}
                  <svg className="w-5 h-5 md:w-7 md:h-7 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </a>
            </div>
            <div className="mt-4 md:mt-10 flex justify-center">
              <div className="w-16 md:w-40 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Botón flotante "Scroll to Top" (solo móvil) */}
    {showScrollTop && (
      <button
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          // Esperar a que termine el scroll y refrescar ScrollTrigger
          setTimeout(() => {
            if (typeof window !== 'undefined' && (window as any).ScrollTrigger) {
              (window as any).ScrollTrigger.refresh();
            }
          }, 800);
        }}
        className="md:hidden fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full shadow-lg shadow-red-600/50 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 will-change-transform animate-fadeInUp"
        style={{
          background: 'linear-gradient(135deg, #e50914 0%, #c4070f 100%)',
        }}
        aria-label="Volver arriba"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-white" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    )}

    </>
  );
}
