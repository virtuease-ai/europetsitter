import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://europetsitter.be';
  const locales = ['fr', 'nl', 'en'];
  
  // Pages principales
  const mainPages = [
    '',
    '/comment-ca-marche',
    '/devenir-petsitter',
    '/recherche',
    '/blog',
    '/contact',
  ];
  
  // Villes principales
  const cities = [
    'bruxelles',
    'anvers',
    'liege',
    'gand',
    'charleroi',
    'bruges',
    'namur',
    'louvain'
  ];
  
  // Services
  const services = [
    'hebergement',
    'garde',
    'visite-domicile',
    'promenade',
    'excursion'
  ];
  
  const sitemap: MetadataRoute.Sitemap = [];
  
  // Pages principales pour chaque locale
  locales.forEach(locale => {
    mainPages.forEach(page => {
      sitemap.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      });
    });
    
    // Pages recherche par ville
    cities.forEach(city => {
      sitemap.push({
        url: `${baseUrl}/${locale}/recherche/${city}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      });
    });
    
    // Pages recherche service + ville (principales combinaisons)
    services.forEach(service => {
      cities.slice(0, 4).forEach(city => { // Top 4 villes
        sitemap.push({
          url: `${baseUrl}/${locale}/recherche/${service}/${city}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.6,
        });
      });
    });
  });
  
  return sitemap;
}
