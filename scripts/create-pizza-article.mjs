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

// Tags relevantes para el artículo de pizza fit
const relevantTagSlugs = [
  'recetas-fitness',
  'recetas-proteicas',
  'nutricion-deportiva',
  'comida-post-entreno',
  'comida-pre-entreno',
  'habitos-saludables',
  'dieta-definicion',
  'perder-grasa'
];

const tagIds = relevantTagSlugs
  .map(slug => tags.find(t => (t.attributes?.slug || t.slug || '').toLowerCase() === slug))
  .filter(Boolean)
  .map(t => t.documentId || t.id);

// Categoría: Nutrición
const nutritionCategory = categories.find(c => {
  const name = (c.attributes?.name || c.name || '').toLowerCase();
  return name.includes('nutrición') || name.includes('nutricion');
});

// Autor (Bernat Scorus probablemente)
const author = authors.find(a => {
  const name = (a.attributes?.name || a.name || '').toLowerCase();
  return name.includes('bernat') || name.includes('scorus');
}) || authors[0];

console.log(`✅ Tags encontradas: ${tagIds.length}`);
console.log(`✅ Categoría: ${nutritionCategory ? (nutritionCategory.attributes?.name || nutritionCategory.name) : 'No encontrada'}`);
console.log(`✅ Autor: ${author ? (author.attributes?.name || author.name) : 'No encontrado'}\n`);

// Contenido del artículo mejorado
const articleContent = `<h2>¿Por qué una pizza fit es la mejor opción para tu dieta?</h2>

<p>Cuando decidimos cambiar nuestros hábitos alimentarios y adoptar un estilo de vida más saludable, uno de los primeros pensamientos que nos viene a la mente es: "¿Tendré que renunciar para siempre a mis comidas favoritas?". La buena noticia es que no tiene por qué ser así.</p>

<p>Como dice el <strong>refrán popular</strong>: <em>"Somos lo que comemos"</em>. Si queremos ser sanos y fuertes, la nutrición es la base más importante. Lo que comamos representa más del <strong>70% de los resultados</strong> que consigamos, tanto para perder peso, ganar músculo o mantener nuestro estado actual.</p>

<h2>La importancia de la preparación en tu dieta fitness</h2>

<p>Comer bien no es fácil. Mucha de la comida sana es cara y, como bien sabes si has ido a cualquier franquicia, la ensalada suele ser de lo más caro y muchas veces te queda con hambre.</p>

<p>El mundo no está diseñado para facilitar una alimentación saludable, por eso debemos estar preparados. Si no estás preparado, tarde o temprano las fuerzas del mundo que te llevan a la mala vida ganarán, y <strong>no puedes permitir eso</strong>.</p>

<h3>¿Qué necesitas para empezar?</h3>

<p>Lo primero que necesitas es una guía que seguir: una <strong>dieta personalizada</strong>, hecha para ti y tus necesidades específicas. Si eres una mujer que mide 1,58cm no necesitas lo mismo que un chico de 1,84cm. Una dieta debe tener en cuenta:</p>

<ul>
<li><strong>Altura</strong> y peso corporal</li>
<li><strong>Tipo de cuerpo</strong> (ectomorfo, endomorfo, mesomorfo)</li>
<li><strong>Alergias</strong> e intolerancias alimentarias</li>
<li><strong>Gustos</strong> y preferencias culinarias</li>
<li><strong>Objetivos</strong> específicos (pérdida de grasa, ganancia de masa muscular, mantenimiento)</li>
</ul>

<h2>Las dietas extremas no funcionan: el enfoque correcto</h2>

<p>Hay dos maneras de enfocar una dieta. La primera es cambiar tus hábitos y volverte una persona sana de un día para otro. Piensas: "He comido lo que he querido durante estos años, ¿por qué unos meses lo haga todo perfecto no pasa nada?". Estoy de acuerdo contigo, no pasa nada. Pero... ¿tu objetivo es adelgazar y luego engordar? ¿Ganar el objetivo solo un tiempo?</p>

<blockquote>
<p><strong>Las dietas extremas no funcionan.</strong> El objetivo no es adelgazar 10 kilos en 1 mes, es tener una vida sana, una nutrición equilibrada. Que tengas un cuerpo espectacular debe ser la <strong>consecuencia de tu estilo de vida</strong>, no un objetivo aislado.</p>
</blockquote>

<p>Un cuerpo bonito es la consecuencia y no la causa. La causa es una nutrición sana y un ejercicio adecuado a ti.</p>

<h2>Estudia lo que comes: entiende los nutrientes</h2>

<p>Es muy importante que entiendas qué comes y sepas qué nutrientes necesita tu cuerpo. Al final, comemos para nutrir nuestro organismo. El objetivo es comer aquella comida que más cosas buenas nos dé a cambio de las menos malas.</p>

<ul>
<li><strong>Si quieres adelgazar:</strong> debes priorizar la fruta, la verdura, la comida limpia, evitar el aceite en exceso y huir de las grasas saturadas.</li>
<li><strong>Si buscas ganar volumen o muscular:</strong> debes buscar grasas buenas, proteínas de calidad, carbohidratos complejos, etc.</li>
</ul>

<h2>Receta para hacer una pizza fit: la solución perfecta</h2>

<p>Cada uno tiene sus gustos relacionados con la comida. Cuando uno se decide a cambiar sus hábitos alimentarios y pasar a una dieta más sana, pronto se dará cuenta que echa de menos algunos platos. Lo que antes parecía un buen plan de un sábado por la noche ahora resulta ser una fuente excesiva de calorías.</p>

<p>Obviamente tengo en mente una pizza llena de queso y otros ingredientes. ¿A quién no le gusta? La bomba calórica no es sólo el queso derretido. La masa tradicional es otro mundo de calorías que se debe evitar en un estilo de vida fitness.</p>

<h3>¿Por qué hacer tu propia pizza fit?</h3>

<p>Además, comprando una pizza preparada, como cualquier otra comida procesada, nunca sabes qué es exactamente lo que comes. Menos mal existen alternativas saludables.</p>

<p>Al seguir leyendo te darás cuenta de cómo se hace la masa de pizza sana y fitness. Además, comento los ingredientes de pizza que no perjudicarán tu dieta.</p>

<p><strong>Importante:</strong> Hay que tener claro que queriendo comer pizza y no una tortita con ingredientes por encima, no encontrarás una receta con cero hidratos. Cada masa los tiene. La cuestión es saber cómo comerlos y conocer bien las cantidades de los hidratos ingeridos.</p>

<h2>Ingredientes para una pizza fit mediana</h2>

<h3>Para la masa (la base de tu pizza saludable):</h3>

<ul>
<li><strong>30 gramos de salvado de avena</strong> - Rico en fibra y proteína</li>
<li><strong>40 gramos de harina de soja</strong> - Alta en proteína vegetal</li>
<li><strong>3 claras de huevo</strong> - Proteína pura de alta calidad</li>
<li><strong>1 cucharadita de levadura</strong> (no muy llena) - Para que la masa suba</li>
<li><strong>Sal al gusto</strong> - Para realzar el sabor</li>
</ul>

<h3>Para los toppings (ingredientes saludables):</h3>

<ul>
<li><strong>Salsa de tomate sin azúcares añadidos</strong> - Base nutritiva y baja en calorías</li>
<li><strong>Queso rallado</strong> (el que prefieras: fit, 0%, sin gluten, etc.) - Fuente de proteína y calcio</li>
<li><strong>Pimiento rojo</strong> - Rico en vitamina C y antioxidantes</li>
<li><strong>2 latas de atún</strong> - Proteína magra y omega-3</li>
<li><strong>Aceitunas negras</strong> - Grasas saludables y sabor mediterráneo</li>
<li><strong>Orégano</strong> - Aromático y lleno de antioxidantes</li>
</ul>

<h2>Pasos para preparar tu pizza fit casera</h2>

<p>Preparar una masa de pizza casera es fácil y es la mejor forma de controlar lo que comes. De esta manera te ahorras los ingredientes desconocidos, conservantes, azúcares añadidos u otros aditivos. Saber lo que se come es una de las cosas más importantes en una dieta sana.</p>

<p>Hay mucha gente que tiene miedo a preparar una masa de pizza, sin embargo esta es fácil y no tiene misterio ninguno. Para mezclar bien la masa necesitarás una <strong>batidora de mano</strong>, así que tenlo en cuenta a la hora de elegir el recipiente donde quieras mezclar los ingredientes para la masa de pizza fit.</p>

<h3>Instrucciones paso a paso:</h3>

<ol>
<li><strong>Mezcla los ingredientes secos:</strong> Mezcla el salvado de avena, la harina de soja y las claras de huevo usando una batidora de mano, hasta que no se queden ningunos grumos. La consistencia debe ser uniforme.</li>

<li><strong>Añade la sal y la levadura:</strong> Añade la sal y la levadura. Sigue mezclando un rato más para que se integren bien.</li>

<li><strong>Prepara la sartén:</strong> Unta la sartén con aceite (si usas aceite en spray será más fácil que llegue a todas las partes de la sartén y que gastes menos aceite) para que la masa no se pegue a la hora de darle la vuelta.</li>

<li><strong>Cocina la masa:</strong> Cuando el aceite esté caliente, echa la masa y procura que se quede redonda y uniforme. Dependiendo del fuego, espera hasta que la masa cuaje. Sabrás que está cuajada en el momento cuando no quede líquida por encima. Cuando cuaje, dale la vuelta. Si la sartén estaba bien untada en aceite, no debería pegarse nada.</li>

<li><strong>Añade los ingredientes:</strong> Cuando la masa esté hecha, la sacas y añades los ingredientes que hayas elegido: salsa de tomate, queso, atún, pimiento, aceitunas y orégano.</li>

<li><strong>Gratina en el horno:</strong> Coloca la pizza en un papel del horno y métela al horno hasta que se gratine el queso. ¡Lista para disfrutar!</li>
</ol>

<h2>Variaciones y consejos para tu pizza fit</h2>

<p>Esta receta incluye el queso, pero hay personas a quien les gusta la pizza sin queso. En este caso, meterla al horno es opcional, ya que serviría sólo para calentar el resto de los ingredientes.</p>

<p>De la misma manera puedes cambiar perfectamente los ingredientes que le eches a tu pizza. Hay muchas recetas que recomiendan hacer pizzas vegetarianas o sin gluten. Todo esto depende de la <strong>dieta personalizada</strong> que tengas y obviamente, de tus gustos.</p>

<h3>Consejos finales:</h3>

<ul>
<li><strong>Experimenta con diferentes toppings:</strong> Pollo a la plancha, verduras asadas, champiñones, espinacas... Las opciones son infinitas.</li>
<li><strong>Controla las porciones:</strong> Aunque sea "fit", todo en exceso puede ser contraproducente.</li>
<li><strong>Prepara masa extra:</strong> Puedes hacer más cantidad y congelarla para tenerla lista cuando la necesites.</li>
</ul>

<p>Si haces una pizza casera según esta receta te aseguras una comida sana y que de verdad sea como una pizza. No es una tortita con ingredientes por encima, es una <strong>pizza de verdad, pero adaptada a tu estilo de vida fitness</strong>.</p>

<h2>Conclusión: disfruta comiendo sano</h2>

<p>No tienes que renunciar a tus comidas favoritas para llevar un estilo de vida saludable. Con recetas como esta pizza fit, puedes disfrutar de platos deliciosos mientras cuidas tu nutrición y alcanzas tus objetivos fitness.</p>

<p>Recuerda: la clave está en la <strong>preparación</strong>, el <strong>conocimiento</strong> de lo que comes y la <strong>consistencia</strong> en tus hábitos. Una pizza fit casera es el perfecto ejemplo de cómo puedes combinar sabor y salud sin sacrificar ninguno de los dos.</p>`;

const articleData = {
  title: 'Receta para hacer una pizza fit: Guía completa paso a paso',
  slug: 'receta-de-pizza-fit',
  excerpt: 'Descubre cómo hacer una pizza fit casera saludable con ingredientes nutritivos. Receta completa paso a paso para disfrutar de pizza sin romper tu dieta fitness. Perfecta para perder grasa o ganar músculo.',
  content: articleContent,
  date: new Date().toISOString().split('T')[0],
  publishedAt: new Date().toISOString(),
  locale: 'es',
  tags: tagIds,
  categories: nutritionCategory ? [nutritionCategory.documentId || nutritionCategory.id] : [],
  author: author ? (author.documentId || author.id) : null
};

console.log('📝 Creando artículo...\n');
console.log('Título:', articleData.title);
console.log('Slug:', articleData.slug);
console.log('Tags:', tagIds.length);
console.log('Categoría:', nutritionCategory ? (nutritionCategory.attributes?.name || nutritionCategory.name) : 'Sin categoría');
console.log('Autor:', author ? (author.attributes?.name || author.name) : 'Sin autor\n');

try {
  const result = await fetchAPI('/api/articles', 'POST', { data: articleData });
  console.log('\n✅ Artículo creado exitosamente!');
  console.log('ID:', result.data?.id || result.data?.documentId);
  
  // Publicar el artículo
  if (result.data?.documentId) {
    await fetchAPI(`/api/articles/${result.data.documentId}/actions/publish`, 'POST');
    console.log('✅ Artículo publicado');
  }
} catch (error) {
  console.error('\n❌ Error:', error.message);
  if (error.message.includes('already exists') || error.message.includes('duplicate')) {
    console.log('\n⚠️  El artículo ya existe. ¿Quieres actualizarlo?');
  }
}


