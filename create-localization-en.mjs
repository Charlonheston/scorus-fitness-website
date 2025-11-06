import dotenv from 'dotenv';
dotenv.config();

const STRAPI_URL = process.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

const baseDocumentId = 'q9njtb29yu6avn4cwvd68sd3';

async function createEnglishLocalization() {
  console.log('🌍 Creating English localization...');
  
  try {
    const response = await fetch(
      `${STRAPI_URL}/api/articles`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${STRAPI_TOKEN}`
        },
        body: JSON.stringify({
          data: {
            title: "What Is CrossFit? A Complete Guide to Train Smarter and Safer",
            slug: "what-is-crossfit",
            excerpt: "Understand CrossFit fundamentals, class structure, main benefits, and how to start safely with Scorus Fitness coaches in Alicante.",
            content: `CrossFit has reshaped the way we train since the early 2000s. At Scorus Fitness we treat it as a strategic tool to build strength, endurance, and confidence—whether you are new to the gym or an experienced athlete.

> "Routine is the enemy. Keep workouts short and intense. Regularly learn and play new sports." — Greg Glassman, CrossFit founder

## What exactly is CrossFit?

CrossFit is a high-intensity conditioning program that blends functional movements from weightlifting, gymnastics, and metabolic conditioning. Its popularity is anchored in:

- **Constant variety:** every session is different so boredom never wins.
- **Scalable intensity:** workouts adapt to your fitness level.
- **Measurable results:** loads, reps, and times are tracked session after session.

Curious about how we tailor these variables? Check out our [personal training services](/en/services/personal-training).

## Main benefits you can expect

1. **Fat loss and muscle definition:** strength plus cardio keeps your metabolism elevated for hours.
2. **Cardio and muscular endurance:** working near your max heart rate improves efficiency.
3. **Mobility and coordination:** we train patterns that transfer to daily life.
4. **Mindset and accountability:** coaches monitor every effort to keep you progressing.

## Anatomy of a Scorus Fitness CrossFit class

- **Briefing (5'):** goals, progressions, and scaling options.
- **Dynamic warm-up (10'):** joint mobility and activation.
- **Technique block (15'):** focus on a lift or gymnastic skill.
- **WOD (12–20'):** the main workout, fully scalable.
- **Cool-down (5'):** stretching and breathing reset.

If you want to polish technique first, enrol in our [Scorus Academy](/en/academy) weightlifting and gymnastics clinics.

## Getting started safely

- **Assess your baseline:** mobility and strength screens dictate the right progressions.
- **Support recovery:** combine training with balanced nutrition and quality sleep.
- **Track your metrics:** weights, reps, times, and how you feel.
- **Stay consistent:** neuromuscular adaptation becomes noticeable after week four.

## Frequently asked questions

**Do I need prior experience?**
No. CrossFit is scalable; we start with fundamentals and build up.

**How often should I train?**
Three to five sessions per week separated by rest days offer steady progress.

**Can I mix CrossFit with other sports?**
Absolutely. Many athletes use it to boost performance in triathlon, team sports, or martial arts.

Book an [online consultation](/en/services/online-consulting) or drop by our [Scorus Gym](/en/gym) to design your plan.`,
            date: "2025-11-06",
            locale: "en",
            author: 1,
            tags: [839, 844, 849, 854],
            categories: [52],
            documentId: baseDocumentId
          }
        })
      }
    );

    const text = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', text);
    
    if (response.ok) {
      console.log('✅ English localization created successfully!');
    } else {
      console.error('❌ Error:', text);
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

createEnglishLocalization();

