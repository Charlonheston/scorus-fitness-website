/**
 * Script para crear traducciones de todos los artículos restantes
 * Usa el método que funcionó para el artículo de proteínas
 */

import 'dotenv/config';

const STRAPI_URL = process.env.PUBLIC_STRAPI_URL || 'https://scorus-cms-strapi.onrender.com';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || process.env.PUBLIC_STRAPI_API_TOKEN || '';

async function fetchStrapi(endpoint, options = {}) {
  const url = `${STRAPI_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(STRAPI_API_TOKEN && { Authorization: `Bearer ${STRAPI_API_TOKEN}` }),
  };

  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

// Artículos a traducir (documentId del artículo español original)
const articlesToTranslate = [
  {
    documentId: 'jcnnr357lmonlsxjioaikvix', // ID 1: Cómo perder peso
    translations: {
      en: {
        title: 'How to Lose Weight Healthily and Maintain It Over Time',
        slug: 'first-steps-to-lose-weight',
        excerpt: 'Want to lose weight without starving or punishing your body? Discover the 5 key steps that really work to lose weight healthily, maintain results, and transform your habits from day one. Forget impossible diets: this is the real method to lose weight and not gain it back.',
        content: `Losing weight is not easy. It requires **commitment to yourself**, discipline and, above all, consistency. There are many ways to lose weight, but there are certain steps that from **day zero** we must follow if we want to achieve lasting results.

> Losing weight is not a temporary phase, but a healthier lifestyle.

---

## The key: commitment and balance

Losing weight doesn't just mean reaching a number on the scale, but **adopting sustainable habits** that keep us at a healthy weight long-term.  
**Extreme diets** are not the solution: they can help you lose weight quickly, but they usually cause the dreaded rebound effect.

What matters is not losing kilos at once, but **maintaining an ideal weight steadily**, taking care of physical and mental health.

---

## 1. Drink more water: the first step towards weight loss

It's that simple and that practical. Replacing sugary drinks, sodas, alcohol or shakes with **water** is a key change for losing weight healthily.

Water helps **filter and clean the body**, aids digestion and accelerates basal metabolism, which contributes to **burning more calories naturally**.

### Benefits of drinking water for weight loss

*   Activates metabolism and improves calorie burning.
*   Reduces appetite and unnecessary snacking.
*   Promotes toxin elimination.
*   Improves physical performance and concentration.

It is recommended to drink **at least 1.5 liters of water per day**. If you find it difficult, you can try infusions or tea.  
**Red tea** is one of the best natural allies for fat burning; with a couple of cups a day you can boost results without getting bored of the taste of water.

---

## 2. Do physical exercise every day

Exercise is the perfect complement to good nutrition. You don't need an exhaustive routine: **the key is consistency**.

Start with small actions:

*   Walk 30 minutes a day.
*   Take stairs instead of the elevator.
*   Go hiking or take long walks with your dog.
*   Practice swimming or stationary bike.

These activities **activate metabolism and improve circulation** without generating impact on joints, especially if you are overweight.

> You don't need to be an athlete, just keep your body moving every day.

If you decide to train at the gym, focus on **cardiovascular machines and low-impact exercises** to take care of your knees and joints.

---

## 3. The rule of dividing the plate into three parts

One of the most effective and sustainable methods to **control portions and maintain a balanced diet** is plate division.

### How to divide the plate to lose weight

*   **½ of the plate:** Vegetables (salads, chard, green beans, mushrooms, tomato...).
*   **¼ of the plate:** Proteins (lean meat, fish, egg, tofu or legumes).
*   **¼ of the plate:** Complex carbohydrates (brown rice, pasta, potato or legumes).

This method guarantees a **balanced nutrient intake** without needing to count calories, maintaining satiety and avoiding deficiencies.

Also, avoid **snacking between meals** and ultra-processed foods:

*   Industrial pastries.
*   Caloric sauces (BBQ, mayonnaise, etc.).
*   Fried foods and salty snacks.

Instead, **prioritize fresh fruits** for mid-morning or snack. Gradually reducing sugar consumption will help **control appetite and improve daily energy**.

---

## 4. Nutrition and exercise: the perfect balance

Remember that in any plan to lose weight, **nutrition represents 80% of success**, and exercise 20%.  
It's useless to train daily if you don't take care of your diet, and it won't be enough to eat well if your body remains inactive.

---

## 5. Set realistic goals

Avoid rushing. **Losing weight quickly** may seem tempting, but it's usually unsustainable and dangerous.  
Healthy weight loss is achieved with **balanced nutrition** and moderate exercise.

### Final recommendations

*   Don't eliminate food groups without professional supervision.
*   Avoid miracle or restrictive diets.
*   Always consult with a nutritionist or trainer before starting any program.

> Success is in consistency, not speed.

---

## Conclusion

Losing weight healthily implies **changing habits, not just reducing calories**.  
Drinking water, moving more, eating with balance and setting achievable goals are the pillars that guarantee real and lasting results.

If you're looking for a personalized approach with a **training and diet plan adapted to your goals**, you can request specific planning.  
This way you'll reach your ideal weight taking care of your body and learning to maintain results long-term.`
      },
      fr: {
        title: 'Comment perdre du poids sainement et le maintenir dans le temps',
        slug: 'premiers-pas-pour-perdre-du-poids',
        excerpt: 'Vous voulez perdre du poids sans avoir faim ni punir votre corps ? Découvrez les 5 étapes clés qui fonctionnent vraiment pour maigrir sainement, maintenir les résultats et transformer vos habitudes dès le premier jour. Oubliez les régimes impossibles : voici la vraie méthode pour perdre du poids et ne pas le reprendre.',
        content: `Perdre du poids n'est pas facile. Cela nécessite un **engagement envers soi-même**, de la discipline et, surtout, de la constance. Il existe de nombreuses façons de maigrir, mais il y a certaines étapes que dès le **jour zéro** nous devons suivre si nous voulons obtenir des résultats durables.

> Perdre du poids n'est pas une phase temporaire, mais un mode de vie plus sain.

---

## La clé : engagement et équilibre

Perdre du poids ne signifie pas simplement atteindre un chiffre sur la balance, mais **adopter des habitudes durables** qui nous maintiennent à un poids santé à long terme.  
Les **régimes extrêmes** ne sont pas la solution : ils peuvent aider à perdre du poids rapidement, mais ils provoquent généralement l'effet rebond redouté.

L'important n'est pas de perdre des kilos d'un coup, mais de **maintenir un poids idéal de manière stable**, en prenant soin de la santé physique et mentale.

---

## 1. Buvez plus d'eau : la première étape vers la perte de poids

C'est aussi simple et pratique que ça. Remplacer les boissons sucrées, les sodas, l'alcool ou les shakes par de **l'eau** est un changement clé pour perdre du poids sainement.

L'eau aide à **filtrer et nettoyer l'organisme**, favorise la digestion et accélère le métabolisme de base, ce qui contribue à **brûler plus de calories naturellement**.

### Avantages de boire de l'eau pour maigrir

*   Active le métabolisme et améliore la combustion calorique.
*   Réduit l'appétit et le grignotage inutile.
*   Favorise l'élimination des toxines.
*   Améliore les performances physiques et la concentration.

Il est recommandé de boire **au moins 1,5 litre d'eau par jour**. Si vous avez du mal, vous pouvez essayer des infusions ou du thé.  
Le **thé rouge** est l'un des meilleurs alliés naturels pour la combustion des graisses ; avec deux tasses par jour, vous pouvez améliorer les résultats sans vous lasser du goût de l'eau.

---

## 2. Faites de l'exercice physique chaque jour

L'exercice est le complément parfait d'une bonne nutrition. Pas besoin d'une routine exhaustive : **la clé est la constance**.

Commencez par de petites actions :

*   Marcher 30 minutes par jour.
*   Prendre les escaliers au lieu de l'ascenseur.
*   Faire de la randonnée ou de longues promenades avec votre chien.
*   Pratiquer la natation ou le vélo stationnaire.

Ces activités **activent le métabolisme et améliorent la circulation** sans générer d'impact sur les articulations, surtout si vous êtes en surpoids.

> Vous n'avez pas besoin d'être athlète, juste de maintenir votre corps en mouvement tous les jours.

Si vous décidez de vous entraîner en salle, concentrez-vous sur les **machines cardiovasculaires et les exercices à faible impact** pour prendre soin de vos genoux et articulations.

---

## 3. La règle de diviser l'assiette en trois parties

L'une des méthodes les plus efficaces et durables pour **contrôler les portions et maintenir une alimentation équilibrée** est la division de l'assiette.

### Comment diviser l'assiette pour perdre du poids

*   **½ de l'assiette :** Légumes (salades, blettes, haricots verts, champignons, tomate...).
*   **¼ de l'assiette :** Protéines (viande maigre, poisson, œuf, tofu ou légumineuses).
*   **¼ de l'assiette :** Glucides complexes (riz complet, pâtes, pomme de terre ou légumineuses).

Cette méthode garantit un **apport équilibré en nutriments** sans avoir besoin de compter les calories, en maintenant la satiété et en évitant les carences.

De plus, évitez les **grignotages entre les repas** et les aliments ultra-transformés :

*   Pâtisseries industrielles.
*   Sauces caloriques (BBQ, mayonnaise, etc.).
*   Aliments frits et snacks salés.

À la place, **priorisez les fruits frais** pour la mi-journée ou le goûter. Réduire progressivement la consommation de sucre aidera à **contrôler l'appétit et améliorer l'énergie quotidienne**.

---

## 4. Nutrition et exercice : l'équilibre parfait

Rappelez-vous que dans tout plan pour perdre du poids, la **nutrition représente 80% du succès**, et l'exercice 20%.  
Il ne sert à rien de s'entraîner quotidiennement si vous ne prenez pas soin de votre alimentation, et il ne suffira pas de bien manger si votre corps reste inactif.

---

## 5. Fixez-vous des objectifs réalistes

Évitez la précipitation. **Perdre du poids rapidement** peut sembler tentant, mais c'est généralement insoutenable et dangereux.  
La perte de poids saine s'obtient avec une **nutrition équilibrée** et un exercice modéré.

### Recommandations finales

*   N'éliminez pas de groupes d'aliments sans supervision professionnelle.
*   Évitez les régimes miracles ou restrictifs.
*   Consultez toujours un nutritionniste ou un entraîneur avant de commencer tout programme.

> Le succès est dans la constance, pas dans la vitesse.

---

## Conclusion

Perdre du poids sainement implique de **changer les habitudes, pas seulement de réduire les calories**.  
Boire de l'eau, bouger plus, manger avec équilibre et fixer des objectifs atteignables sont les piliers qui garantissent des résultats réels et durables.

Si vous cherchez une approche personnalisée avec un **plan d'entraînement et de régime adapté à vos objectifs**, vous pouvez demander une planification spécifique.  
Ainsi, vous atteindrez votre poids idéal en prenant soin de votre corps et en apprenant à maintenir les résultats à long terme.`
      },
      de: {
        title: 'Wie man gesund abnimmt und das Gewicht langfristig hält',
        slug: 'erste-schritte-zum-abnehmen',
        excerpt: 'Möchten Sie abnehmen, ohne zu hungern oder Ihren Körper zu quälen? Entdecken Sie die 5 Schlüsselschritte, die wirklich funktionieren, um gesund abzunehmen, Ergebnisse zu halten und Ihre Gewohnheiten vom ersten Tag an zu transformieren. Vergessen Sie unmögliche Diäten: Dies ist die echte Methode zum Abnehmen und nicht wieder zuzunehmen.',
        content: `Abnehmen ist nicht einfach. Es erfordert **Selbstverpflichtung**, Disziplin und vor allem Konsequenz. Es gibt viele Möglichkeiten, Gewicht zu verlieren, aber es gibt bestimmte Schritte, die wir ab **Tag Null** befolgen müssen, wenn wir langfristige Ergebnisse erzielen wollen.

> Abnehmen ist keine vorübergehende Phase, sondern ein gesünderer Lebensstil.

---

## Der Schlüssel: Engagement und Gleichgewicht

Abnehmen bedeutet nicht nur, eine Zahl auf der Waage zu erreichen, sondern **nachhaltige Gewohnheiten anzunehmen**, die uns langfristig auf einem gesunden Gewicht halten.  
**Extreme Diäten** sind nicht die Lösung: Sie können helfen, schnell Gewicht zu verlieren, aber sie verursachen normalerweise den gefürchteten Jo-Jo-Effekt.

Wichtig ist nicht, Kilo auf einmal zu verlieren, sondern **ein ideales Gewicht stabil zu halten**, während man sich um körperliche und geistige Gesundheit kümmert.

---

## 1. Trinken Sie mehr Wasser: der erste Schritt zum Abnehmen

So einfach und praktisch ist das. Ersetzen Sie zuckerhaltige Getränke, Limonaden, Alkohol oder Shakes durch **Wasser** - dies ist eine Schlüsseländerung für gesundes Abnehmen.

Wasser hilft, den **Organismus zu filtern und zu reinigen**, fördert die Verdauung und beschleunigt den Grundumsatz, was zur **natürlichen Verbrennung von mehr Kalorien** beiträgt.

### Vorteile des Wassertrinkens zum Abnehmen

*   Aktiviert den Stoffwechsel und verbessert die Kalorienverbrennung.
*   Reduziert Appetit und unnötiges Naschen.
*   Fördert die Toxinausscheidung.
*   Verbessert körperliche Leistung und Konzentration.

Es wird empfohlen, **mindestens 1,5 Liter Wasser pro Tag** zu trinken. Wenn Sie Schwierigkeiten haben, können Sie Infusionen oder Tee probieren.  
**Roter Tee** ist einer der besten natürlichen Verbündeten für die Fettverbrennung; mit ein paar Tassen pro Tag können Sie die Ergebnisse steigern, ohne sich vom Geschmack des Wassers zu langweilen.

---

## 2. Treiben Sie jeden Tag körperliche Bewegung

Bewegung ist die perfekte Ergänzung zu einer guten Ernährung. Sie brauchen keine erschöpfende Routine: **Der Schlüssel liegt in der Konsequenz**.

Beginnen Sie mit kleinen Aktionen:

*   30 Minuten pro Tag gehen.
*   Treppen statt Aufzug nehmen.
*   Wandern oder lange Spaziergänge mit Ihrem Hund machen.
*   Schwimmen oder stationäres Fahrrad üben.

Diese Aktivitäten **aktivieren den Stoffwechsel und verbessern die Durchblutung**, ohne Auswirkungen auf die Gelenke zu haben, besonders wenn Sie übergewichtig sind.

> Sie müssen kein Athlet sein, nur Ihren Körper jeden Tag in Bewegung halten.

Wenn Sie sich entscheiden, im Fitnessstudio zu trainieren, konzentrieren Sie sich auf **Herz-Kreislauf-Maschinen und Übungen mit geringer Belastung**, um Ihre Knie und Gelenke zu schonen.

---

## 3. Die Regel, den Teller in drei Teile zu teilen

Eine der effektivsten und nachhaltigsten Methoden, um **Portionen zu kontrollieren und eine ausgewogene Ernährung aufrechtzuerhalten**, ist die Tellerteilung.

### Wie man den Teller teilt, um abzunehmen

*   **½ des Tellers:** Gemüse (Salate, Mangold, grüne Bohnen, Pilze, Tomate...).
*   **¼ des Tellers:** Proteine (mageres Fleisch, Fisch, Ei, Tofu oder Hülsenfrüchte).
*   **¼ des Tellers:** Komplexe Kohlenhydrate (Vollkornreis, Nudeln, Kartoffel oder Hülsenfrüchte).

Diese Methode garantiert eine **ausgewogene Nährstoffzufuhr**, ohne Kalorien zählen zu müssen, und hält die Sättigung aufrecht und vermeidet Mängel.

Vermeiden Sie außerdem **Snacks zwischen den Mahlzeiten** und ultraverarbeitete Lebensmittel:

*   Industrielles Gebäck.
*   Kalorische Saucen (BBQ, Mayonnaise, etc.).
*   Frittierte Lebensmittel und salzige Snacks.

Stattdessen **priorisieren Sie frische Früchte** für den Vormittag oder Snack. Die schrittweise Reduzierung des Zuckerkonsums wird helfen, **den Appetit zu kontrollieren und die tägliche Energie zu verbessern**.

---

## 4. Ernährung und Bewegung: das perfekte Gleichgewicht

Denken Sie daran, dass bei jedem Plan zum Abnehmen **die Ernährung 80% des Erfolgs ausmacht** und Bewegung 20%.  
Es nützt nichts, täglich zu trainieren, wenn Sie nicht auf Ihre Ernährung achten, und es wird nicht ausreichen, gut zu essen, wenn Ihr Körper inaktiv bleibt.

---

## 5. Setzen Sie sich realistische Ziele

Vermeiden Sie Eile. **Schnell abzunehmen** mag verlockend erscheinen, ist aber normalerweise nicht nachhaltig und gefährlich.  
Gesunder Gewichtsverlust wird mit **ausgewogener Ernährung** und mäßiger Bewegung erreicht.

### Finale Empfehlungen

*   Eliminieren Sie keine Lebensmittelgruppen ohne professionelle Aufsicht.
*   Vermeiden Sie Wunder- oder restriktive Diäten.
*   Konsultieren Sie immer einen Ernährungsberater oder Trainer, bevor Sie ein Programm beginnen.

> Der Erfolg liegt in der Konsequenz, nicht in der Geschwindigkeit.

---

## Fazit

Gesund abzunehmen bedeutet, **Gewohnheiten zu ändern, nicht nur Kalorien zu reduzieren**.  
Mehr Wasser trinken, sich mehr bewegen, ausgewogen essen und erreichbare Ziele setzen sind die Säulen, die echte und langfristige Ergebnisse garantieren.

Wenn Sie einen personalisierten Ansatz mit einem **Trainings- und Ernährungsplan suchen, der an Ihre Ziele angepasst ist**, können Sie eine spezifische Planung anfordern.  
Auf diese Weise erreichen Sie Ihr Idealgewicht, indem Sie sich um Ihren Körper kümmern und lernen, die Ergebnisse langfristig zu halten.`
      },
      hu: {
        title: 'Hogyan fogyjunk egészségesen és tartsuk meg az eredményt',
        slug: 'elso-lepesek-a-fogyashoz',
        excerpt: 'Szeretnél lefogyni anélkül, hogy éheznél vagy bántanád a testedet? Fedezd fel az 5 kulcsfontosságú lépést, amelyek valóban működnek az egészséges fogyáshoz, az eredmények megtartásához és a szokások átalakításához az első naptól kezdve. Felejtsd el a lehetetlen diétákat: ez az igazi módszer a fogyáshoz és a visszahízás elkerüléséhez.',
        content: `A fogyás nem könnyű feladat. **Önkéntes elköteleződést**, fegyelmet és főleg következetességet igényel. Sok módszer létezik a fogyásra, de vannak bizonyos lépések, amelyeket a **nulladik naptól** követnünk kell, ha tartós eredményeket akarunk elérni.

> A fogyás nem egy átmeneti fázis, hanem egy egészségesebb életmód.

---

## A kulcs: elköteleződés és egyensúly

A fogyás nem csak azt jelenti, hogy elérjünk egy számot a mérlegen, hanem **fenntartható szokásokat kell kialakítanunk**, amelyek hosszú távon egészséges súlyban tartanak minket.  
A **szélsőséges diéták** nem a megoldás: segíthetnek gyorsan fogyni, de általában a félelmetes jojo-effektust okozzák.

Nem az számít, hogy egyszerre veszítünk-e kilókat, hanem hogy **stabilan tartsuk meg az ideális súlyt**, miközben gondoskodunk fizikai és mentális egészségünkről.

---

## 1. Igyál több vizet: az első lépés a fogyás felé

Ilyen egyszerű és gyakorlati. A cukros italok, üdítők, alkohol vagy turmixok helyettesítése **vízzel** kulcsfontosságú változás az egészséges fogyáshoz.

A víz segít **szűrni és megtisztítani a szervezetet**, elősegíti az emésztést és felgyorsítja az alapanyagcserét, ami hozzájárul a **természetes kalóriáégéshez**.

### A vízivás előnyei a fogyáshoz

*   Aktiválja az anyagcserét és javítja a kalóriáégést.
*   Csökkenti az étvágyat és a szükségtelen nasizást.
*   Elősegíti a toxinok kiürülését.
*   Javítja a fizikai teljesítményt és a koncentrációt.

Ajánlott **naponta legalább 1,5 liter vizet** inni. Ha nehezen megy, próbálhatsz teákat vagy infúziókat.  
A **vörös tea** az egyik legjobb természetes szövetségese a zsírégetésnek; naponta néhány csésze teával javíthatod az eredményeket anélkül, hogy unod a víz ízét.

---

## 2. Végezz minden nap testmozgást

A mozgás tökéletes kiegészítője a jó táplálkozásnak. Nem kell kimerítő rutin: **a kulcs a következetesség**.

Kezdj kis lépésekkel:

*   Napi 30 perc séta.
*   Lépcsőzés lift helyett.
*   Túrázás vagy hosszú séták a kutyáddal.
*   Úszás vagy álló kerékpár gyakorlása.

Ezek a tevékenységek **aktiválják az anyagcserét és javítják a keringést** anélkül, hogy az ízületekre hatással lennének, különösen túlsúly esetén.

> Nem kell sportolónak lenned, csak tartsd a testedet mozgásban minden nap.

Ha úgy döntesz, hogy edzőteremben edzel, koncentrálj a **kardio gépekre és alacsony hatású gyakorlatokra**, hogy óvd a térdet és ízületeidet.

---

## 3. A tányér három részre osztásának szabálya

Az egyik leghatékonyabb és fenntartható módszer a **táplálék mennyiségének szabályozására és egyensúlyozott étrend fenntartására** a tányér osztása.

### Hogyan osszuk fel a tányért a fogyáshoz

*   **½ tányér:** Zöldségek (saláták, mángold, zöldbab, gombák, paradicsom...).
*   **¼ tányér:** Fehérjék (sovány hús, hal, tojás, tofu vagy hüvelyesek).
*   **¼ tányér:** Összetett szénhidrátok (barna rizs, tészta, burgonya vagy hüvelyesek).

Ez a módszer garantálja a **kiegyensúlyozott tápanyagbevitelt** anélkül, hogy kalóriákat kellene számolni, miközben fenntartja a telítettséget és elkerüli a hiányosságokat.

Továbbá kerüld az **étkezések közötti nasizást** és a ultra-feldolgozott élelmiszereket:

*   Ipari péksütemények.
*   Kalóriadús szószok (BBQ, majonéz, stb.).
*   Sült ételek és sós nassolnivalók.

Ehelyett **priorizáld a friss gyümölcsöket** délelőttre vagy uzsonnára. A cukor fogyasztásának fokozatos csökkentése segít **az étvágy szabályozásában és a napi energia javításában**.

---

## 4. Táplálkozás és mozgás: a tökéletes egyensúly

Emlékezz, hogy bármely fogyási tervben a **táplálkozás a siker 80%-át teszi ki**, és a mozgás a 20%-ot.  
Hiábavaló naponta edzeni, ha nem vigyázol a táplálkozásra, és nem lesz elég jól enni, ha a tested inaktív marad.

---

## 5. Tűzz ki realisztikus célokat

Kerüld a sietséget. A **gyors fogyás** csábító lehet, de általában nem fenntartható és veszélyes.  
Az egészséges fogyást **kiegyensúlyozott táplálkozással** és mérsékelt mozgással lehet elérni.

### Végső ajánlások

*   Ne hagyj el táplálékcsoportokat szakmai felügyelet nélkül.
*   Kerüld a csodadiétákat vagy szigorú diétákat.
*   Mindig konzultálj táplálkozásszakértővel vagy edzővel, mielőtt bármilyen programot kezdenél.

> A siker a következetességben rejlik, nem a sebességben.

---

## Következtetés

Az egészséges fogyás **szokások megváltoztatását** jelenti, nem csak kalóriák csökkentését.  
Vízivás, több mozgás, kiegyensúlyozott evés és elérhető célok kitűzése a pillérek, amelyek garantálják az igazi és tartós eredményeket.

Ha személyre szabott megközelítést keresel **edzési és étrendi tervvel, amely a céljaidhoz alkalmazkodik**, kérhetsz specifikus tervezést.  
Így eléred az ideális súlyodat, miközben gondoskodsz a testedről és megtanulod a hosszú távú eredmények fenntartását.`
      }
    }
  },
  // Los otros artículos los añadiré después
];

async function getCategoryInLocale(categoryDocumentId, locale) {
  try {
    const response = await fetchStrapi(`/api/categories?locale=${locale}&filters[documentId][$eq]=${categoryDocumentId}&populate=*`);
    return response.data?.[0]?.documentId || null;
  } catch (error) {
    console.error(`Error fetching category in ${locale}:`, error.message);
    return null;
  }
}

async function getTagInLocale(tagDocumentId, locale) {
  try {
    const response = await fetchStrapi(`/api/tags?locale=${locale}&filters[documentId][$eq]=${tagDocumentId}&populate=*`);
    return response.data?.[0]?.documentId || null;
  } catch (error) {
    console.error(`Error fetching tag in ${locale}:`, error.message);
    return null;
  }
}

async function createTranslation(articleData) {
  const { documentId, translations } = articleData;
  
  console.log(`\n📝 Traduciendo artículo: ${documentId}`);
  
  // Obtener el artículo original con todas sus relaciones
  const originalArticle = await fetchStrapi(`/api/articles/${documentId}?populate[categories]=*&populate[tags]=*&populate[author]=*`);
  
  if (!originalArticle.data) {
    console.error(`❌ No se encontró el artículo ${documentId}`);
    return;
  }

  const original = originalArticle.data;
  const categories = original.attributes?.categories?.data || [];
  const tags = original.attributes?.tags?.data || [];
  const author = original.attributes?.author?.data;
  
  // Traducir a cada idioma
  for (const [locale, translation] of Object.entries(translations)) {
    console.log(`\n  🌍 Creando traducción en ${locale.toUpperCase()}...`);
    
    try {
      // Obtener categorías y tags en el idioma objetivo
      const localizedCategories = [];
      for (const cat of categories) {
        const localizedCatDocId = await getCategoryInLocale(cat.documentId, locale);
        if (localizedCatDocId) {
          localizedCategories.push(localizedCatDocId);
        }
      }
      
      const localizedTags = [];
      for (const tag of tags) {
        const localizedTagDocId = await getTagInLocale(tag.documentId, locale);
        if (localizedTagDocId) {
          localizedTags.push(localizedTagDocId);
        }
      }
      
      // Crear la traducción usando create_entry con el documentId del original
      const articlePayload = {
        title: translation.title,
        slug: translation.slug,
        excerpt: translation.excerpt,
        content: translation.content,
        date: original.attributes?.date || original.attributes?.createdAt?.split('T')[0],
        imageAlt: original.attributes?.imageAlt || translation.title,
        locale: locale,
        documentId: documentId, // Usar el mismo documentId para vincular las localizaciones
        author: author?.documentId || author?.id,
      };
      
      // Añadir categorías y tags si existen
      if (localizedCategories.length > 0) {
        articlePayload.categories = localizedCategories;
      }
      if (localizedTags.length > 0) {
        articlePayload.tags = localizedTags;
      }
      
      // Crear usando el MCP tool (simulado aquí, necesitarías usar el tool real)
      console.log(`  ✅ Traducción ${locale.toUpperCase()} preparada`);
      console.log(`     - Título: ${translation.title}`);
      console.log(`     - Slug: ${translation.slug}`);
      console.log(`     - Categorías: ${localizedCategories.length}`);
      console.log(`     - Tags: ${localizedTags.length}`);
      
      // Aquí deberías usar el MCP tool create_entry
      // Por ahora solo mostramos lo que se crearía
      
    } catch (error) {
      console.error(`  ❌ Error traduciendo a ${locale.toUpperCase()}:`, error.message);
    }
  }
}

// Ejecutar traducciones
async function main() {
  console.log('🚀 Iniciando traducción de artículos...\n');
  
  for (const article of articlesToTranslate) {
    await createTranslation(article);
    // Pausa entre artículos para no sobrecargar la API
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n✅ Proceso completado');
  console.log('\n⚠️  NOTA: Este script prepara los datos pero necesitas usar el MCP tool create_entry para crear las traducciones realmente.');
}

main().catch(console.error);








