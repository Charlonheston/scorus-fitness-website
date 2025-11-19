import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

const STRAPI_URL = process.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';
const TOKEN = process.env.STRAPI_API_TOKEN || '';

async function fetchAPI(endpoint, method = 'GET', body = null) {
  const res = await fetch(`${STRAPI_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(TOKEN && { Authorization: `Bearer ${TOKEN}` })
    },
    ...(body && { body: JSON.stringify(body) })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.substring(0, 200)}`);
  }
  return res.json();
}

// Obtener datos necesarios
console.log('📋 Obteniendo datos de Strapi...\n');

const [tagsRes, categoriesRes, authorsRes] = await Promise.all([
  fetchAPI('/api/tags?pagination[pageSize]=100'),
  fetchAPI('/api/categories?pagination[pageSize]=100'),
  fetchAPI('/api/authors?pagination[pageSize]=100')
]);

const tags = tagsRes.data || [];
const categories = categoriesRes.data || [];
const authors = authorsRes.data || [];

// Tags relevantes
const relevantTagSlugs = [
  'mentalidad',
  'motivacion',
  'habitos-saludables',
  'entrenamiento',
  'fitness',
  'desarrollo-personal',
  'consistencia',
  'objetivos-fitness'
];

const tagIds = relevantTagSlugs
  .map(slug => tags.find(t => (t.attributes?.slug || t.slug || '').toLowerCase() === slug))
  .filter(Boolean)
  .map(t => t.documentId || t.id);

// Categoría: Entrenamiento o General
const trainingCategory = categories.find(c => {
  const name = (c.attributes?.name || c.name || '').toLowerCase();
  return name.includes('entrenamiento') || name.includes('fitness') || name.includes('general');
}) || categories[0];

// Autor (Bernat Scorus)
const author = authors.find(a => {
  const name = (a.attributes?.name || a.name || '').toLowerCase();
  return name.includes('bernat') || name.includes('scorus');
}) || authors[0];

console.log(`✅ Tags encontradas: ${tagIds.length}`);
console.log(`✅ Categoría: ${trainingCategory ? (trainingCategory.attributes?.name || trainingCategory.name) : 'No encontrada'}`);
console.log(`✅ Autor: ${author ? (author.attributes?.name || author.name) : 'No encontrado'}\n`);

// Contenido del artículo - Tema: La ciencia detrás de la motivación en el fitness
const articleContent = `<h2>¿Por qué fallamos en el gimnasio? La verdad que nadie te cuenta</h2>

<p>Llevas tres semanas entrenando como un loco. Te duele todo el cuerpo, has cambiado tu alimentación y te sientes orgulloso. Pero algo pasa: la cuarta semana empiezas a faltar. La quinta, faltas dos días. La sexta... ya ni te acuerdas de cuándo fue la última vez que pisaste el gimnasio.</p>

<p>Si esto te suena familiar, no eres el único. <strong>El 80% de las personas que empiezan en el gimnasio abandonan antes de los 3 meses</strong>. Y no es porque sean débiles o no tengan fuerza de voluntad. Es porque nadie les enseñó cómo funciona realmente la motivación.</p>

<h2>La motivación no es un sentimiento, es un sistema</h2>

<p>El error más grande que cometemos es esperar a "sentirnos motivados" para entrenar. La motivación no es algo que aparece mágicamente un lunes por la mañana. <strong>La motivación es el resultado de un sistema</strong>, no la causa.</p>

<blockquote>
<p><strong>La verdad incómoda:</strong> Si esperas a sentirte motivado para entrenar, entrenarás 3 días al mes. Los días que te sientas bien, con energía, sin estrés y con ganas. Pero esos días son raros.</p>
</blockquote>

<p>Los atletas profesionales no entrenan porque están motivados. Entrenan porque tienen un sistema que les obliga a hacerlo incluso cuando no quieren. Y aquí está el secreto: <strong>cuando entrenas sin ganas, es cuando más creces</strong>.</p>

<h2>El ciclo de la motivación: cómo funciona realmente</h2>

<p>La motivación funciona en un ciclo de tres fases:</p>

<h3>Fase 1: La chispa inicial</h3>

<p>Algo te impulsa a empezar. Puede ser una foto, un comentario, un evento, una promesa que te hiciste. Esta fase dura entre 1 y 3 semanas. Es cuando todo es nuevo, emocionante y sientes que puedes conquistar el mundo.</p>

<h3>Fase 2: La realidad</h3>

<p>Después de la chispa viene la realidad. Te das cuenta de que entrenar duele, que requiere tiempo, que no ves resultados inmediatos. Esta es la fase donde el 80% abandona. <strong>Esta fase es normal</strong>. No significa que estés haciendo algo mal. Significa que estás humano.</p>

<h3>Fase 3: El hábito</h3>

<p>Si superas la fase 2 (y puedes hacerlo), entrenar se convierte en parte de quién eres. Ya no necesitas motivación porque entrenar es tan natural como cepillarte los dientes. Esta fase puede tardar entre 2 y 6 meses en llegar, dependiendo de la persona.</p>

<h2>Los 5 errores que matan tu motivación</h2>

<h3>1. Buscar resultados inmediatos</h3>

<p>El cuerpo humano no cambia en semanas. Cambia en meses. Si esperas ver resultados visibles en 30 días, te vas a frustrar. Los cambios reales empiezan a ser visibles después de 8-12 semanas de entrenamiento consistente.</p>

<h3>2. Compararte con otros</h3>

<p>Instagram está lleno de transformaciones "antes y después" que parecen milagrosas. La mayoría son falsas, editadas o de personas con genética privilegiada. <strong>Tu única competencia eres tú mismo de ayer</strong>. Compararte con otros es el camino más rápido a la frustración.</p>

<h3>3. Hacer demasiado demasiado pronto</h3>

<p>Empezar entrenando 6 días a la semana con dieta estricta es la receta perfecta para el abandono. Tu cuerpo y tu mente necesitan adaptarse gradualmente. Empieza con 3 días a la semana y ve aumentando.</p>

<h3>4. No tener un plan claro</h3>

<p>Ir al gimnasio sin saber qué hacer es como ir de viaje sin mapa. Te pierdes, te frustras y acabas yéndote a casa. Necesitas un plan de entrenamiento específico para tus objetivos.</p>

<h3>5. Depender de la fuerza de voluntad</h3>

<p>La fuerza de voluntad es un recurso limitado. Se agota. En lugar de depender de ella, crea sistemas que hagan que entrenar sea fácil. Prepara tu ropa la noche anterior. Ten un horario fijo. Elimina las decisiones que te hacen dudar.</p>

<h2>Cómo construir un sistema que funcione</h2>

<p>Un sistema es mejor que un objetivo porque un objetivo puede fallar, pero un sistema te lleva hacia adelante incluso cuando fallas.</p>

<h3>El sistema de los 3 pilares:</h3>

<ol>
<li><strong>Rutina:</strong> Entrena a la misma hora, los mismos días. Tu cerebro se acostumbra y deja de resistirse.</li>

<li><strong>Preparación:</strong> Prepara todo la noche anterior. Ropa, comida, botella de agua. Elimina fricción.</li>

<li><strong>Medición:</strong> Registra tus entrenamientos. No para compararte, sino para ver tu progreso real. Los números no mienten.</li>
</ol>

<h2>La regla de los 2 minutos</h2>

<p>Cuando no tengas ganas de entrenar, aplica la regla de los 2 minutos: <strong>"Solo voy a ir al gimnasio y hacer 2 minutos de ejercicio"</strong>.</p>

<p>Una vez que estés ahí, haciendo ejercicio, tu cerebro cambiará. Ya no será "¿entreno o no entreno?", será "¿hago 20 minutos más o 30?". El 90% de las veces, esos 2 minutos se convertirán en un entrenamiento completo.</p>

<p>El truco es eliminar la decisión de "ir o no ir". La decisión ya está tomada: vas a ir. Solo tienes que decidir cuánto tiempo entrenarás una vez que estés ahí.</p>

<h2>La verdad sobre la disciplina</h2>

<p>La disciplina no es hacer lo que quieres hacer. La disciplina es hacer lo que debes hacer incluso cuando no quieres hacerlo.</p>

<p>Y aquí está la parte que nadie te dice: <strong>la disciplina duele al principio, pero después se vuelve adictiva</strong>. Cuando superas la resistencia mental de entrenar sin ganas, te sientes invencible. Esa sensación es mejor que cualquier droga.</p>

<blockquote>
<p><strong>La disciplina es libertad.</strong> Cuando entrenas de forma consistente, te liberas de la ansiedad de "¿debería estar entrenando?", de la culpa de "no he entrenado esta semana", de la frustración de "no veo resultados". Te liberas porque ya no es una decisión. Es parte de quién eres.</p>
</blockquote>

<h2>El poder de los pequeños compromisos</h2>

<p>No necesitas comprometerte a entrenar 6 días a la semana durante un año. Eso es abrumador y te va a hacer fallar.</p>

<p>En su lugar, haz pequeños compromisos:</p>

<ul>
<li><strong>Semana 1-2:</strong> "Voy a entrenar 3 veces esta semana"</li>
<li><strong>Semana 3-4:</strong> "Voy a entrenar 3 veces esta semana y añadiré 10 minutos de cardio"</li>
<li><strong>Mes 2:</strong> "Voy a entrenar 4 veces por semana"</li>
</ul>

<p>Cada pequeño compromiso cumplido te da confianza para el siguiente. Es como subir escalones: no intentas saltar 10 escalones de golpe, subes uno a uno.</p>

<h2>La mentalidad del atleta profesional</h2>

<p>Los atletas profesionales no entrenan porque quieren. Entrenan porque es su trabajo. Y tú también puedes adoptar esa mentalidad.</p>

<p>No pienses "¿tengo ganas de entrenar hoy?". Piensa "¿un atleta profesional faltaría a entrenar porque no tiene ganas?". La respuesta es no. Y si quieres resultados profesionales, necesitas disciplina profesional.</p>

<h2>Conclusión: deja de buscar motivación y empieza a construir sistemas</h2>

<p>La motivación es temporal. Los sistemas son permanentes. En lugar de esperar a sentirte motivado, construye un sistema que funcione incluso cuando no lo estés.</p>

<p>Recuerda:</p>

<ul>
<li>La motivación es el resultado, no la causa</li>
<li>El 80% abandona en la fase 2 (la realidad). Sé parte del 20%</li>
<li>Los sistemas superan a la fuerza de voluntad</li>
<li>La disciplina duele al principio, pero después se vuelve adictiva</li>
<li>Los pequeños compromisos construyen grandes resultados</li>
</ul>

<p>No necesitas más motivación. Necesitas un sistema. Y ahora ya sabes cómo construirlo.</p>

<p><strong>La pregunta no es "¿cuándo voy a estar motivado?". La pregunta es "¿qué sistema voy a crear hoy para entrenar mañana, incluso si no tengo ganas?".</strong></p>`;

const articleData = {
  title: 'La verdad sobre la motivación en el fitness: por qué el 80% abandona y cómo ser parte del 20%',
  slug: 'verdad-sobre-motivacion-fitness',
  excerpt: 'Descubre por qué el 80% de las personas abandona el gimnasio antes de los 3 meses y cómo construir un sistema que funcione incluso cuando no tengas ganas de entrenar. La ciencia detrás de la motivación y la disciplina en el fitness.',
  content: articleContent,
  date: new Date().toISOString().split('T')[0],
  publishedAt: new Date().toISOString(),
  locale: 'es',
  tags: tagIds,
  categories: trainingCategory ? [trainingCategory.documentId || trainingCategory.id] : [],
  author: author ? (author.documentId || author.id) : null
};

console.log('📝 Creando artículo...\n');
console.log('Título:', articleData.title);
console.log('Slug:', articleData.slug);
console.log('Tags:', tagIds.length);
console.log('Categoría:', trainingCategory ? (trainingCategory.attributes?.name || trainingCategory.name) : 'Sin categoría');
console.log('Autor:', author ? (author.attributes?.name || author.name) : 'Sin autor\n');

try {
  const result = await fetchAPI('/api/articles', 'POST', { data: articleData });
  console.log('\n✅ Artículo creado exitosamente!');
  console.log('ID:', result.data?.id || result.data?.documentId);
  
  // Publicar el artículo
  if (result.data?.documentId) {
    await fetchAPI(`/api/articles/${result.data.documentId}/actions/publish`, 'POST');
    console.log('✅ Artículo publicado');
  } else if (result.data?.id) {
    await fetchAPI(`/api/articles/${result.data.id}/actions/publish`, 'POST');
    console.log('✅ Artículo publicado');
  }
} catch (error) {
  console.error('\n❌ Error:', error.message);
  if (error.message.includes('already exists') || error.message.includes('duplicate')) {
    console.log('\n⚠️  El artículo ya existe. ¿Quieres actualizarlo?');
  }
}

