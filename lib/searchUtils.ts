// Détection intelligente des paramètres ville/service dans URL

const services = ['hebergement', 'garde', 'visite-domicile', 'promenade', 'excursion'];
const villes = [
  'bruxelles',
  'anvers',
  'liege',
  'gand',
  'charleroi',
  'bruges',
  'namur',
  'louvain',
  'mons',
  'ostende'
];

export function detectService(param1?: string, param2?: string): string | null {
  if (param1 && services.includes(param1)) return param1;
  if (param2 && services.includes(param2)) return param2;
  return null;
}

export function detectVille(param1?: string, param2?: string): string | null {
  if (param1 && villes.includes(param1)) return param1;
  if (param2 && villes.includes(param2)) return param2;
  return null;
}

export { services, villes };
