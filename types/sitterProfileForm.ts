// Types pour le formulaire de profil petsitter (tabspetsitter.md)

export type BusinessType = 'individual' | 'independent' | 'company';

export type AnimalType =
  | 'petit-chien'
  | 'moyen-chien'
  | 'grand-chien'
  | 'chien-attaque'
  | 'chien-garde'
  | 'chat'
  | 'lapin'
  | 'rongeur'
  | 'oiseau'
  | 'volaille'
  | 'nac';

export type ServiceType = 'hebergement' | 'garde' | 'visite' | 'promenade' | 'excursion';

export interface ProfileTabData {
  avatar: string;
  photos: string[];
  name: string;
  businessName: string;
  address: string;
  coordinates: { latitude: number; longitude: number } | null;
  phone: string;
  businessType: BusinessType;
  tvaNumber: string;
  siretNumber: string;
  description: string;
}

export interface ServiceItem {
  type: ServiceType;
  active: boolean;
  price: string;
  priceWeek: string;
  description: string;
}

export type ServiceOptionKey =
  | 'hebergementChien'
  | 'hebergementChat'
  | 'gardeChien'
  | 'gardeChat'
  | 'visiteChien'
  | 'visiteChat'
  | 'promenadeChien';

export interface ServicesTabData {
  animals: AnimalType[];
  services: Record<ServiceType, ServiceItem>;
  serviceOptions: Record<ServiceOptionKey, string[]>;
}

export type HousingType = 'maison' | 'appartement' | 'propriete';
export type ChildrenOption = 'no-answer' | 'no-children' | 'toddlers' | 'children' | 'teenagers';
export type WalkingArea = 'off-leash' | 'park' | 'beach' | 'forest' | 'countryside';
export type ExperienceSkill = 'volunteer' | 'behavior' | 'rescue' | 'training';
export type YearsExperience = 'less-1' | 'less-5' | 'more-5' | 'more-10';

export interface SpecificitiesTabData {
  housingType: HousingType;
  children: ChildrenOption;
  walkingAreas: WalkingArea[];
  experience: ExperienceSkill[];
  yearsOfExperience: YearsExperience;
}

export interface SitterProfileFormData {
  profile: ProfileTabData;
  services: ServicesTabData;
  specificities: SpecificitiesTabData;
}

export const ANIMAL_TYPES: { id: AnimalType; label: string }[] = [
  { id: 'petit-chien', label: 'Petit Chien (-10kg)' },
  { id: 'moyen-chien', label: 'Moyen chien (10-20kg)' },
  { id: 'grand-chien', label: 'Grand chien (+20kg)' },
  { id: 'chien-attaque', label: 'Chien d\'attaque (Cat. 1)' },
  { id: 'chien-garde', label: 'Chien de garde (Cat. 2)' },
  { id: 'chat', label: 'Chat' },
  { id: 'lapin', label: 'Lapin' },
  { id: 'rongeur', label: 'Petit rongeur' },
  { id: 'oiseau', label: 'Oiseau' },
  { id: 'volaille', label: 'Volaille' },
  { id: 'nac', label: 'NAC (Nouveaux Animaux de Compagnie)' },
];

export const DOG_TYPES: AnimalType[] = ['petit-chien', 'moyen-chien', 'grand-chien', 'chien-attaque', 'chien-garde'];

export function hasDogSelected(animals: AnimalType[]): boolean {
  return animals.some((a) => DOG_TYPES.includes(a));
}

export function hasCatSelected(animals: AnimalType[]): boolean {
  return animals.includes('chat');
}

// Options par sous-catégorie de service (tabspetsitter.md)
export const SERVICE_OPTION_LABELS: Record<string, { id: string; label: string }[]> = {
  hebergementChien: [
    { id: 'ext-espace-privatif', label: 'En extérieur dans un espace privatif clos (chenil)' },
    { id: 'partage-sans-acces', label: 'Partage l\'espace de vie sans accès à un espace extérieur clos' },
    { id: 'partage-avec-acces', label: 'Partage l\'espace de vie avec accès à un espace clos extérieur (cour ou jardin)' },
    { id: 'int-sans-acces', label: 'En intérieur dans une pièce dédiée sans accès à un espace extérieur clos' },
    { id: 'int-avec-acces', label: 'En intérieur dans une pièce dédiée avec accès à un espace extérieur clos (cour ou jardin)' },
  ],
  hebergementChat: [
    { id: 'chat-partage-sans-acces', label: 'Partage l\'espace de vie sans accès à un espace extérieur clos' },
    { id: 'chat-partage-avec-acces', label: 'Partage l\'espace de vie avec accès à un espace clos extérieur (cour ou jardin)' },
    { id: 'chat-int-sans-acces', label: 'En intérieur dans une pièce dédiée sans accès à un espace extérieur clos' },
    { id: 'chat-int-avec-acces', label: 'En intérieur dans une pièce dédiée avec accès à un espace extérieur clos (cour ou jardin)' },
  ],
  gardeChien: [
    { id: 'garde-partage-sans-acces', label: 'Partage l\'espace de vie sans accès à un espace extérieur clos' },
    { id: 'garde-partage-avec-acces', label: 'Partage l\'espace de vie avec accès à un espace clos extérieur (cour ou jardin)' },
    { id: 'garde-int-sans-acces', label: 'En intérieur dans une pièce dédiée sans accès à un espace extérieur clos' },
    { id: 'garde-int-avec-acces', label: 'En intérieur dans une pièce dédiée avec accès à un espace extérieur clos (cour ou jardin)' },
  ],
  gardeChat: [
    { id: 'chat-garde-partage-sans-acces', label: 'Partage l\'espace de vie sans accès à un espace extérieur clos' },
    { id: 'chat-garde-partage-avec-acces', label: 'Partage l\'espace de vie avec accès à un espace clos extérieur (cour ou jardin)' },
    { id: 'chat-garde-int-sans-acces', label: 'En intérieur dans une pièce dédiée sans accès à un espace extérieur clos' },
    { id: 'chat-garde-int-avec-acces', label: 'En intérieur dans une pièce dédiée avec accès à un espace extérieur clos (cour ou jardin)' },
  ],
  visiteChien: [
    { id: '1-visite', label: '1x visite à domicile par jour + nourrissage' },
    { id: '2-visites', label: '2x visite à domicile par jour + nourrissage' },
    { id: '1-visite-1-promenade', label: '1x visite à domicile par jour + 1x promenade du chien + nourrissage' },
    { id: '2-visites-2-promenades', label: '2x visites à domicile par jour + 2x promenade du chien + nourrissage' },
  ],
  visiteChat: [
    { id: 'chat-1-visite', label: '1x visite à domicile par jour + nourrissage' },
    { id: 'chat-2-visites', label: '2x visites à domicile par jour + nourrissage' },
  ],
  promenadeChien: [
    { id: 'promenade-1x', label: 'Promenade du chien 1x par jour' },
    { id: 'promenade-2x', label: 'Promenade du chien 2x par jour' },
  ],
};

export const SERVICE_TYPES: { id: ServiceType; label: string; hasPricing: boolean }[] = [
  { id: 'hebergement', label: 'Hébergement (garde de +12h)', hasPricing: true },
  { id: 'garde', label: 'Garde (garde de -12h)', hasPricing: true },
  { id: 'visite', label: 'Visite sur le lieu de vie de l\'animal', hasPricing: true },
  { id: 'promenade', label: 'Chien en promenade', hasPricing: true },
  { id: 'excursion', label: 'Chien en excursion', hasPricing: false },
];

export const HOUSING_OPTIONS: { id: HousingType; label: string }[] = [
  { id: 'maison', label: 'Maison' },
  { id: 'appartement', label: 'Appartement' },
  { id: 'propriete', label: 'Propriété à la campagne' },
];

export const CHILDREN_OPTIONS: { id: ChildrenOption; label: string }[] = [
  { id: 'no-answer', label: 'Je ne réponds pas à cette question' },
  { id: 'no-children', label: 'Pas d\'enfants' },
  { id: 'toddlers', label: 'Bambins à la maison (-6 ans)' },
  { id: 'children', label: 'Enfants à la maison (6-12 ans)' },
  { id: 'teenagers', label: 'Adolescents à la maison (+12 ans)' },
];

export const WALKING_OPTIONS: { id: WalkingArea; label: string }[] = [
  { id: 'off-leash', label: 'Zone sans laisse à proximité' },
  { id: 'park', label: 'Parc' },
  { id: 'beach', label: 'Plage' },
  { id: 'forest', label: 'Forêt' },
  { id: 'countryside', label: 'Campagne' },
];

export const EXPERIENCE_OPTIONS: { id: ExperienceSkill; label: string }[] = [
  { id: 'volunteer', label: 'Expérience en tant que bénévole dans le domaine du bien-être animal' },
  { id: 'behavior', label: 'Expérience avec les problèmes de comportement' },
  { id: 'rescue', label: 'Expérience avec des animaux de sauvetage' },
  { id: 'training', label: 'Expérience avec les techniques de dressage de chien' },
];

export const YEARS_EXPERIENCE_OPTIONS: { id: YearsExperience; label: string }[] = [
  { id: 'less-1', label: 'Moins de 1 an d\'expérience' },
  { id: 'less-5', label: 'Moins de 5 ans d\'expérience' },
  { id: 'more-5', label: 'Plus de 5 ans d\'expérience' },
  { id: 'more-10', label: 'Plus de 10 ans d\'expérience' },
];

// Valeurs par défaut du formulaire
export function getDefaultProfileTab(): ProfileTabData {
  return {
    avatar: '',
    photos: [],
    name: '',
    businessName: '',
    address: '',
    coordinates: null,
    phone: '',
    businessType: 'individual',
    tvaNumber: '',
    siretNumber: '',
    description: '',
  };
}

export function getDefaultServicesTab(): ServicesTabData {
  const serviceTypes: ServiceType[] = ['hebergement', 'garde', 'visite', 'promenade', 'excursion'];
  const services: ServicesTabData['services'] = {} as ServicesTabData['services'];
  serviceTypes.forEach((type) => {
    services[type] = {
      type,
      active: false,
      price: '',
      priceWeek: '',
      description: '',
    };
  });
  const serviceOptions: ServicesTabData['serviceOptions'] = {
    hebergementChien: [],
    hebergementChat: [],
    gardeChien: [],
    gardeChat: [],
    visiteChien: [],
    visiteChat: [],
    promenadeChien: [],
  };
  return {
    animals: [],
    services,
    serviceOptions,
  };
}

export function getDefaultSpecificitiesTab(): SpecificitiesTabData {
  return {
    housingType: 'maison',
    children: 'no-answer',
    walkingAreas: [],
    experience: [],
    yearsOfExperience: 'less-1',
  };
}

export function getDefaultFormData(): SitterProfileFormData {
  return {
    profile: getDefaultProfileTab(),
    services: getDefaultServicesTab(),
    specificities: getDefaultSpecificitiesTab(),
  };
}

// Validation
export function validatePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 10) return 'Le numéro doit contenir exactement 10 chiffres';
  return null;
}

export function validateTva(tva: string): string | null {
  if (!/^FR\d{11}$/.test(tva)) return 'Le numéro de TVA doit commencer par FR suivi de 11 chiffres';
  return null;
}

export function validateSiret(siret: string): string | null {
  if (siret.replace(/\D/g, '').length !== 14) return 'Le numéro SIRET doit contenir exactement 14 chiffres';
  return null;
}

export function getProfileTabErrors(data: ProfileTabData): Partial<Record<keyof ProfileTabData, string>> {
  const errors: Partial<Record<keyof ProfileTabData, string>> = {};
  const phoneErr = validatePhone(data.phone);
  if (phoneErr) errors.phone = phoneErr;
  if ((data.businessType === 'independent' || data.businessType === 'company') && data.tvaNumber) {
    const tvaErr = validateTva(data.tvaNumber);
    if (tvaErr) errors.tvaNumber = tvaErr;
  }
  if ((data.businessType === 'independent' || data.businessType === 'company') && data.siretNumber) {
    const siretErr = validateSiret(data.siretNumber);
    if (siretErr) errors.siretNumber = siretErr;
  }
  if (!data.address?.trim()) errors.address = 'Sélectionnez une adresse dans la liste';
  return errors;
}

export function canPublishProfile(data: SitterProfileFormData): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const p = data.profile;
  const s = data.services;
  const sp = data.specificities;

  if (!p.name?.trim()) errors.push('Dénomination commerciale ou pseudo requis');
  if (!p.businessName?.trim()) errors.push('Prénom + Nom requis');
  if (!p.address?.trim()) errors.push('Adresse postale requise');
  if (!p.coordinates) errors.push('Sélectionnez une adresse dans la liste pour la localisation');
  const phoneErr = validatePhone(p.phone);
  if (phoneErr) errors.push(phoneErr);
  if (p.businessType !== 'individual') {
    if (!p.tvaNumber?.trim()) errors.push('Numéro de TVA obligatoire pour ce statut');
    else if (validateTva(p.tvaNumber)) errors.push(validateTva(p.tvaNumber)!);
    if (!p.siretNumber?.trim()) errors.push('Numéro SIRET obligatoire pour ce statut');
    else if (validateSiret(p.siretNumber)) errors.push(validateSiret(p.siretNumber)!);
  }
  if (!p.description?.trim()) errors.push('Description requise');

  if (s.animals.length === 0) errors.push('Sélectionnez au moins un type d\'animal accepté');
  const hasActiveService = (Object.values(s.services) as ServiceItem[]).some((svc) => svc.active);
  if (!hasActiveService) errors.push('Activez au moins un service proposé');

  return { ok: errors.length === 0, errors };
}
