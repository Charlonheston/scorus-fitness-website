// Map route segments between languages
export const routeMap: Record<string, Record<string, string>> = {
  servicios: { en: 'services', fr: 'services', de: 'dienstleistungen', hu: 'szolgaltatasok' },
  services: { es: 'servicios', fr: 'services', de: 'dienstleistungen', hu: 'szolgaltatasok' },
  dienstleistungen: { es: 'servicios', en: 'services', fr: 'services', hu: 'szolgaltatasok' },
  szolgaltatasok: { es: 'servicios', en: 'services', fr: 'services', de: 'dienstleistungen' },
  
  academia: { en: 'academy', fr: 'academie', de: 'akademie', hu: 'akademia' },
  academy: { es: 'academia', fr: 'academie', de: 'akademie', hu: 'akademia' },
  academie: { es: 'academia', en: 'academy', de: 'akademie', hu: 'akademia' },
  akademie: { es: 'academia', en: 'academy', fr: 'academie', hu: 'akademia' },
  akademia: { es: 'academia', en: 'academy', fr: 'academie', de: 'akademie' },
  
  'entrenamiento-personal': { en: 'personal-training', fr: 'entrainement-personnel', de: 'personliches-training', hu: 'szemelyi-edzes' },
  'personal-training': { es: 'entrenamiento-personal', fr: 'entrainement-personnel', de: 'personliches-training', hu: 'szemelyi-edzes' },
  'entrainement-personnel': { es: 'entrenamiento-personal', en: 'personal-training', de: 'personliches-training', hu: 'szemelyi-edzes' },
  'personliches-training': { es: 'entrenamiento-personal', en: 'personal-training', fr: 'entrainement-personnel', hu: 'szemelyi-edzes' },
  'szemelyi-edzes': { es: 'entrenamiento-personal', en: 'personal-training', fr: 'entrainement-personnel', de: 'personliches-training' },
  
  'consultoria-online': { en: 'online-consulting', fr: 'consultation-en-ligne', de: 'online-beratung', hu: 'online-tanacsadas' },
  'online-consulting': { es: 'consultoria-online', fr: 'consultation-en-ligne', de: 'online-beratung', hu: 'online-tanacsadas' },
  'consultation-en-ligne': { es: 'consultoria-online', en: 'online-consulting', de: 'online-beratung', hu: 'online-tanacsadas' },
  'online-beratung': { es: 'consultoria-online', en: 'online-consulting', fr: 'consultation-en-ligne', hu: 'online-tanacsadas' },
  'online-tanacsadas': { es: 'consultoria-online', en: 'online-consulting', fr: 'consultation-en-ligne', de: 'online-beratung' },
  
  'asesoramiento-online': { en: 'online-counseling', fr: 'coaching-en-ligne', de: 'online-beratung-coaching', hu: 'online-tanacsadas-coaching' },
  'online-counseling': { es: 'asesoramiento-online', fr: 'coaching-en-ligne', de: 'online-beratung-coaching', hu: 'online-tanacsadas-coaching' },
  'coaching-en-ligne': { es: 'asesoramiento-online', en: 'online-counseling', de: 'online-beratung-coaching', hu: 'online-tanacsadas-coaching' },
  'online-beratung-coaching': { es: 'asesoramiento-online', en: 'online-counseling', fr: 'coaching-en-ligne', hu: 'online-tanacsadas-coaching' },
  'online-tanacsadas-coaching': { es: 'asesoramiento-online', en: 'online-counseling', fr: 'coaching-en-ligne', de: 'online-beratung-coaching' },
  
  'video-cursos': { en: 'video-courses', fr: 'cours-video', de: 'video-kurse', hu: 'video-kurzusok' },
  'video-courses': { es: 'video-cursos', fr: 'cours-video', de: 'video-kurse', hu: 'video-kurzusok' },
  'cours-video': { es: 'video-cursos', en: 'video-courses', de: 'video-kurse', hu: 'video-kurzusok' },
  'video-kurse': { es: 'video-cursos', en: 'video-courses', fr: 'cours-video', hu: 'video-kurzusok' },
  'video-kurzusok': { es: 'video-cursos', en: 'video-courses', fr: 'cours-video', de: 'video-kurse' },
  
  'talleres': { en: 'workshops', fr: 'ateliers', de: 'workshops', hu: 'workshopok' },
  'workshops': { es: 'talleres', fr: 'ateliers', de: 'workshops', hu: 'workshopok' },
  'ateliers': { es: 'talleres', en: 'workshops', de: 'workshops', hu: 'workshopok' },
  'workshopok': { es: 'talleres', en: 'workshops', fr: 'ateliers', de: 'workshops' },
  
  'seminarios': { en: 'seminars', fr: 'seminaires', de: 'seminare', hu: 'szeminariumok' },
  'seminars': { es: 'seminarios', fr: 'seminaires', de: 'seminare', hu: 'szeminariumok' },
  'seminaires': { es: 'seminarios', en: 'seminars', de: 'seminare', hu: 'szeminariumok' },
  'seminare': { es: 'seminarios', en: 'seminars', fr: 'seminaires', hu: 'szeminariumok' },
  'szeminariumok': { es: 'seminarios', en: 'seminars', fr: 'seminaires', de: 'seminare' },
  
  're-born': { es: 're-born', en: 're-born', fr: 're-born', de: 're-born', hu: 're-born' },
  'scorus-campus': { es: 'scorus-campus', en: 'scorus-campus', fr: 'scorus-campus', de: 'scorus-campus', hu: 'scorus-campus' },
};

export function convertRoute(currentPath: string, targetLang: string, currentLang: string): string {
  if (targetLang === currentLang) return currentPath;
  
  const parts = currentPath.split('/').filter(p => p);
  
  // Replace language code
  if (parts[0] === currentLang) {
    parts[0] = targetLang;
  } else {
    parts.unshift(targetLang);
  }
  
  // Convert route segments
  for (let i = 1; i < parts.length; i++) {
    const segment = parts[i];
    if (routeMap[segment] && routeMap[segment][targetLang]) {
      parts[i] = routeMap[segment][targetLang];
    }
  }
  
  return '/' + parts.join('/');
}

export function getLanguageUrl(currentPath: string, targetLang: string): string {
  const currentLang = currentPath.split('/')[1] || 'es';
  return convertRoute(currentPath, targetLang, currentLang);
}
