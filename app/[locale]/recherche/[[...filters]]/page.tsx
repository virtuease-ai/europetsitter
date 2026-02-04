import { detectVille, detectService, services, villes } from '@/lib/searchUtils';
import { SearchInterface } from '@/components/search/SearchInterface';
import { Metadata } from 'next';

export async function generateStaticParams() {
  const combinations = [];
  
  // Recherche vide
  combinations.push({ filters: [] });
  
  // Villes seules
  villes.forEach(ville => {
    combinations.push({ filters: [ville] });
  });
  
  // Services seuls
  services.forEach(service => {
    combinations.push({ filters: [service] });
  });
  
  // Combinaisons service + ville
  services.forEach(service => {
    villes.forEach(ville => {
      combinations.push({ filters: [service, ville] });
    });
  });
  
  return combinations;
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ filters?: string[]; locale: string }> 
}): Promise<Metadata> {
  const { filters } = await params;
  const [param1, param2] = filters || [];
  const ville = detectVille(param1, param2);
  const service = detectService(param1, param2);
  
  if (service && ville) {
    return {
      title: `${service} pour animaux à ${ville} | EuroPetSitter`,
      description: `Trouvez un petsitter professionnel pour ${service} à ${ville}. Profils vérifiés, sans commission. Comparez et contactez directement.`,
    };
  } else if (ville) {
    return {
      title: `Petsitter à ${ville} - Garde d'animaux | EuroPetSitter`,
      description: `Découvrez les meilleurs petsitters à ${ville}. Hébergement, garde, promenade. Sans commission.`,
    };
  } else if (service) {
    return {
      title: `${service} pour animaux en Belgique | EuroPetSitter`,
      description: `Service de ${service} pour chiens, chats et autres animaux. Trouvez un petsitter près de chez vous.`,
    };
  }
  
  return {
    title: 'Rechercher un Petsitter en Belgique | EuroPetSitter',
    description: 'Trouvez le petsitter parfait près de chez vous. Recherche par ville, service et type d\'animal.',
  };
}

export default async function SearchPage({ 
  params 
}: { 
  params: Promise<{ filters?: string[]; locale: string }> 
}) {
  const { filters } = await params;
  const [param1, param2] = filters || [];
  
  const defaultVille = detectVille(param1, param2);
  const defaultService = detectService(param1, param2);
  
  return (
    <SearchInterface 
      defaultVille={defaultVille}
      defaultService={defaultService}
    />
  );
}
