/**
 * Génération des données structurées JSON-LD pour le SEO
 * https://schema.org/
 */

interface SitterData {
  id: string;
  name: string;
  bio: string;
  city: string;
  rating?: number;
  reviewsCount?: number;
  services?: any;
  experience_years?: number;
}

/**
 * Organization schema pour le site principal
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EuroPetSitter',
    url: 'https://europetsitter.be',
    logo: 'https://europetsitter.be/logo.png',
    description: 'Plateforme de mise en relation entre propriétaires d\'animaux et petsitters professionnels en Belgique. Sans commission, profils vérifiés.',
    sameAs: [
      'https://www.facebook.com/europetsitter',
      'https://www.instagram.com/europetsitter',
      'https://twitter.com/europetsitter'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@europetsitter.be',
      contactType: 'Customer Service',
      areaServed: 'BE',
      availableLanguage: ['French', 'Dutch', 'English']
    }
  };
}

/**
 * LocalBusiness schema pour les pages petsitter
 */
export function getSitterProfileSchema(sitter: SitterData, locale: string = 'fr') {
  const baseUrl = 'https://europetsitter.be';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}/${locale}/petsitter/${sitter.id}`,
    name: sitter.name,
    description: sitter.bio,
    address: {
      '@type': 'PostalAddress',
      addressLocality: sitter.city,
      addressCountry: 'BE'
    },
    aggregateRating: sitter.rating && sitter.reviewsCount ? {
      '@type': 'AggregateRating',
      ratingValue: sitter.rating,
      reviewCount: sitter.reviewsCount,
      bestRating: 5,
      worstRating: 1
    } : undefined,
    priceRange: '€€',
    url: `${baseUrl}/${locale}/petsitter/${sitter.id}`,
    image: `${baseUrl}/petsitters/${sitter.id}/avatar.jpg`,
    telephone: '+32-XXX-XXX-XXX', // À remplacer par le vrai numéro si disponible
  };
}

/**
 * Service schema pour les pages de recherche
 */
export function getServiceSchema(serviceName: string, city?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Service de ${serviceName} pour animaux`,
    description: `Trouvez un professionnel pour ${serviceName} ${city ? `à ${city}` : 'en Belgique'}`,
    provider: {
      '@type': 'Organization',
      name: 'EuroPetSitter',
      url: 'https://europetsitter.be'
    },
    areaServed: city ? {
      '@type': 'City',
      name: city,
      containedInPlace: {
        '@type': 'Country',
        name: 'Belgium'
      }
    } : {
      '@type': 'Country',
      name: 'Belgium'
    },
    serviceType: serviceName,
    category: 'Pet Care'
  };
}

/**
 * BreadcrumbList schema pour la navigation
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

/**
 * WebSite schema avec SearchAction
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'EuroPetSitter',
    url: 'https://europetsitter.be',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://europetsitter.be/fr/recherche?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Review schema pour les avis
 */
export function getReviewSchema(review: {
  author: string;
  rating: number;
  text: string;
  date: string;
}, sitterId: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'LocalBusiness',
      name: 'Petsitter Profile',
      url: `https://europetsitter.be/fr/petsitter/${sitterId}`
    },
    author: {
      '@type': 'Person',
      name: review.author
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1
    },
    reviewBody: review.text,
    datePublished: review.date
  };
}

/**
 * Helper pour injecter le schema dans une page Next.js
 */
export function generateStructuredData(schema: object) {
  return {
    __html: JSON.stringify(schema, null, 2)
  };
}
