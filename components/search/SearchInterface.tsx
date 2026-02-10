'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { format } from 'date-fns';
import { fr, enGB, nl as nlDateFns } from 'date-fns/locale';
import { Search, MapPin, Calendar as CalendarIcon, X, SlidersHorizontal, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ANIMAL_TYPES, DOG_TYPES, SERVICE_OPTION_LABELS } from '@/types/sitterProfileForm';
import type { ServiceType, ServiceOptionKey } from '@/types/sitterProfileForm';
import { SitterCard } from './SitterCard';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    postcode?: string;
  };
}

interface SearchInterfaceProps {
  defaultVille: string | null;
  defaultService: string | null;
}

export interface SitterCardData {
  id: string;
  name: string;
  city: string;
  avatar?: string;
  rating?: number;
  reviewsCount?: number;
  services: string[];
  priceFrom?: number;
  animals: string[];
  animalIds: string[];
  activeServiceKeys?: ServiceType[];
  serviceOptions?: Record<string, string[]>;
  coordinates?: { latitude: number; longitude: number } | null;
}

// Calcul de distance entre deux points GPS (formule Haversine)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const SERVICE_KEY_TO_OPTION: Record<string, string> = {
  visite: 'visite-domicile',
  hebergement: 'hebergement',
  garde: 'garde',
  promenade: 'promenade',
  excursion: 'excursion',
};

const SERVICE_TYPES: ServiceType[] = ['hebergement', 'garde', 'visite', 'promenade', 'excursion'];

const RESULTS_PER_PAGE = 10;

function parseCoordinates(coords: unknown): { latitude: number; longitude: number } | null {
  if (!coords) return null;
  if (typeof coords === 'object' && coords !== null) {
    const c = coords as { latitude?: number; longitude?: number; x?: number; y?: number };
    if (c.latitude != null && c.longitude != null) {
      return { latitude: c.latitude, longitude: c.longitude };
    }
    if (c.y != null && c.x != null) {
      return { latitude: c.y, longitude: c.x };
    }
  }
  if (typeof coords === 'string') {
    const match = coords.match(/^\s*\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)\s*$/);
    if (match) {
      const lon = parseFloat(match[1]);
      const lat = parseFloat(match[2]);
      if (!Number.isNaN(lon) && !Number.isNaN(lat)) {
        return { latitude: lat, longitude: lon };
      }
    }
  }
  return null;
}

function mapRowToSitterCard(
  row: {
    id: string;
    name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    address?: string | null;
    avatar?: string | null;
    animals?: string[] | null;
    services?: {
      services?: Record<string, { active?: boolean; price?: string }>;
      serviceOptions?: Record<string, string[]>;
    } | null;
    coordinates?: unknown;
  },
  tServices: (key: string) => string,
  fallbackName: string,
  fallbackCity: string
): SitterCardData {
  const name =
    (row.name && row.name.trim()) ||
    [row.first_name, row.last_name].filter(Boolean).join(' ') ||
    fallbackName;
  const city = row.address?.trim() || fallbackCity;
  const animalLabels = new Map<string, string>(ANIMAL_TYPES.map((a) => [a.id, a.label]));
  const animalIds: string[] = Array.isArray(row.animals) ? row.animals : [];
  const animals: string[] = animalIds.map((id) => animalLabels.get(id) || id);
  const svc = row.services?.services ?? {};
  const svcOptions = row.services?.serviceOptions ?? {};
  const activeServiceKeys = SERVICE_TYPES.filter((key) => svc[key]?.active) as ServiceType[];
  const services = activeServiceKeys.map((key) =>
    tServices(SERVICE_KEY_TO_OPTION[key] || key)
  );
  let priceFrom: number | undefined;
  const prices = activeServiceKeys
    .map((key) => svc[key]?.price)
    .filter((p): p is string => typeof p === 'string' && p.length > 0)
    .map((p) => parseFloat(p.replace(',', '.')))
    .filter((n) => !Number.isNaN(n));
  if (prices.length > 0) priceFrom = Math.min(...prices);
  return {
    id: row.id,
    name,
    city,
    avatar: row.avatar ?? undefined,
    rating: 5,
    reviewsCount: Math.floor(Math.random() * 50) + 10,
    services,
    priceFrom,
    animals,
    animalIds,
    activeServiceKeys,
    serviceOptions: svcOptions,
    coordinates: parseCoordinates(row.coordinates),
  };
}

export function SearchInterface({ defaultVille, defaultService }: SearchInterfaceProps) {
  const [ville, setVille] = useState(defaultVille || '');
  const [villeQuery, setVilleQuery] = useState(defaultVille || '');
  const [villeCoordinates, setVilleCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [villeSuggestions, setVilleSuggestions] = useState<NominatimResult[]>([]);
  const [villeLoading, setVilleLoading] = useState(false);
  const [showVilleSuggestions, setShowVilleSuggestions] = useState(false);
  const villeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const villeWrapperRef = useRef<HTMLDivElement>(null);

  const [service, setService] = useState(defaultService || 'all');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [hasSearched, setHasSearched] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtres supplémentaires
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const [radius, setRadius] = useState([50]);
  const [selectedOption, setSelectedOption] = useState<string>('all');

  const [sitters, setSitters] = useState<SitterCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations('search');
  const tServices = useTranslations('services');
  const tCities = useTranslations('cities');
  const tProfile = useTranslations('sitterDashboard');
  const locale = useLocale();

  // Date-fns locale mapping
  const dateLocale = locale === 'nl' ? nlDateFns : locale === 'en' ? enGB : fr;

  // Fermer les suggestions quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (villeWrapperRef.current && !villeWrapperRef.current.contains(e.target as Node)) {
        setShowVilleSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recherche d'adresses avec debounce
  useEffect(() => {
    if (!villeQuery || villeQuery.length < 3) {
      setVilleSuggestions([]);
      return;
    }
    if (villeDebounceRef.current) clearTimeout(villeDebounceRef.current);
    villeDebounceRef.current = setTimeout(async () => {
      setVilleLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(villeQuery)}&countrycodes=be&limit=5&addressdetails=1`,
          { headers: { Accept: 'application/json' } }
        );
        const data: NominatimResult[] = await res.json();
        setVilleSuggestions(data);
        setShowVilleSuggestions(true);
      } catch {
        setVilleSuggestions([]);
      } finally {
        setVilleLoading(false);
      }
    }, 400);
    return () => {
      if (villeDebounceRef.current) clearTimeout(villeDebounceRef.current);
    };
  }, [villeQuery]);

  const selectVille = useCallback((item: NominatimResult) => {
    // Extraire la ville ou le code postal de l'adresse
    const city = item.address?.city || item.address?.town || item.address?.village || item.address?.municipality || '';
    const postcode = item.address?.postcode || '';
    const displayValue = city ? `${city}${postcode ? ` (${postcode})` : ''}` : item.display_name.split(',')[0];

    setVille(displayValue);
    setVilleQuery(displayValue);
    setVilleCoordinates({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    });
    setShowVilleSuggestions(false);
    setVilleSuggestions([]);
  }, []);

  const clearVille = useCallback(() => {
    setVille('');
    setVilleQuery('');
    setVilleCoordinates(null);
    setVilleSuggestions([]);
  }, []);

  // Charger les petsitters au montage
  useEffect(() => {
    const fetchSitters = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from('sitter_profiles')
        .select('id, name, first_name, last_name, address, avatar, animals, services, coordinates')
        .eq('is_visible', true);
      if (err) {
        setError(err.message);
        setSitters([]);
        setLoading(false);
        return;
      }
      setSitters((data ?? []).map((row: any) => mapRowToSitterCard(row, tServices, t('fallbackName'), t('fallbackCity'))));
      setLoading(false);
    };
    fetchSitters();
  }, [tServices]);

  // Top bar animal select handler (single-select synced with sidebar checkboxes)
  const topBarAnimal = selectedAnimals.length === 1 ? selectedAnimals[0] : 'all';
  const handleTopBarAnimalChange = (value: string) => {
    if (value === 'all') {
      setSelectedAnimals([]);
    } else {
      setSelectedAnimals([value]);
    }
  };

  // Compute available options based on selected service + animal
  const availableOptionData = useMemo(() => {
    const activeService = service === 'all' ? null : (service === 'visite-domicile' ? 'visite' : service);
    if (!activeService || activeService === 'excursion') return null;

    const activeAnimal = topBarAnimal === 'all' ? null : topBarAnimal;
    if (!activeAnimal) return null;

    const isDog = DOG_TYPES.includes(activeAnimal as any);
    const isCat = activeAnimal === 'chat';
    if (!isDog && !isCat) return null;

    const optionKey = `${activeService}${isDog ? 'Chien' : 'Chat'}`;
    const options = SERVICE_OPTION_LABELS[optionKey];
    if (!options || options.length === 0) return null;

    return { key: optionKey as ServiceOptionKey, options };
  }, [service, topBarAnimal]);

  // Reset selected option when service or animal changes (or when options become unavailable)
  useEffect(() => {
    if (!availableOptionData) {
      setSelectedOption('all');
      return;
    }
    // If the currently selected option is not in the new available options, reset
    const validIds = availableOptionData.options.map(o => o.id);
    if (selectedOption !== 'all' && !validIds.includes(selectedOption)) {
      setSelectedOption('all');
    }
  }, [availableOptionData, selectedOption]);

  const filteredSitters = useMemo(() => {
    return sitters.filter((s) => {
      // Filtre par rayon de distance (si coordonnées disponibles)
      if (villeCoordinates && s.coordinates) {
        const distance = calculateDistance(
          villeCoordinates.latitude,
          villeCoordinates.longitude,
          s.coordinates.latitude,
          s.coordinates.longitude
        );
        if (distance > radius[0]) return false;
      }

      // Filtre ville/adresse - comparaison flexible par mots-clés (fallback si pas de coordonnées)
      if (ville && ville.trim() !== '' && !villeCoordinates) {
        const searchTerms = ville.toLowerCase().split(/[\s,()-]+/).filter(term => term.length > 1);
        const sitterLocation = s.city.toLowerCase();
        const hasMatch = searchTerms.some(term => sitterLocation.includes(term));
        if (!hasMatch) return false;
      }

      // Filtre service principal
      if (service && service !== 'all') {
        const serviceKey = service === 'visite-domicile' ? 'visite' : service;
        if (!s.activeServiceKeys?.includes(serviceKey as ServiceType)) return false;
      }

      // Filtre animaux - compare les IDs
      if (selectedAnimals.length > 0) {
        const hasMatchingAnimal = selectedAnimals.some(animalId =>
          s.animalIds.includes(animalId)
        );
        if (!hasMatchingAnimal) return false;
      }

      // Filtre options de service
      if (selectedOption !== 'all' && availableOptionData) {
        const optionKey = availableOptionData.key;
        const sitterOpts = s.serviceOptions?.[optionKey];
        if (!sitterOpts || !sitterOpts.includes(selectedOption)) {
          return false;
        }
      }

      return true;
    });
  }, [sitters, ville, villeCoordinates, radius, service, selectedAnimals, selectedOption, availableOptionData]);

  // Pagination
  const totalPages = Math.ceil(filteredSitters.length / RESULTS_PER_PAGE);
  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
  const endIndex = startIndex + RESULTS_PER_PAGE;
  const currentSitters = filteredSitters.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [ville, service, selectedAnimals, selectedOption]);

  const handleSearch = () => {
    setHasSearched(true);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setVille('');
    setVilleQuery('');
    setVilleCoordinates(null);
    setVilleSuggestions([]);
    setSelectedAnimals([]);
    setRadius([50]);
    setSelectedOption('all');
    setService('all');
  };

  // Générer les numéros de pages à afficher
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Si 7 pages ou moins, afficher toutes
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Toujours afficher la première page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Pages autour de la page actuelle
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Toujours afficher la dernière page
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  // Types d'animaux correspondant aux options du profil petsitter
  const animalTypes = [
    { id: 'petit-chien', label: t('animals.petit-chien') },
    { id: 'moyen-chien', label: t('animals.moyen-chien') },
    { id: 'grand-chien', label: t('animals.grand-chien') },
    { id: 'chien-attaque', label: t('animals.chien-attaque') },
    { id: 'chien-garde', label: t('animals.chien-garde') },
    { id: 'chat', label: t('animals.chat') },
    { id: 'lapin', label: t('animals.lapin') },
    { id: 'rongeur', label: t('animals.rongeur') },
    { id: 'oiseau', label: t('animals.oiseau') },
    { id: 'volaille', label: t('animals.volaille') },
    { id: 'nac', label: t('animals.nac') },
  ];

  // Services correspondant aux options du profil petsitter
  const servicesList = [
    { key: 'hebergement', label: t('serviceTypes.hebergement') },
    { key: 'garde', label: t('serviceTypes.garde') },
    { key: 'visite', label: t('serviceTypes.visite') },
    { key: 'promenade', label: t('serviceTypes.promenade') },
    { key: 'excursion', label: t('serviceTypes.excursion') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre de recherche en haut - Non sticky */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 items-end">
            {/* Localité */}
            <div ref={villeWrapperRef} className="relative">
              <label className="block text-sm font-medium mb-1.5 text-gray-700">
                <MapPin className="w-4 h-4 inline mr-1" />
                {t('locationLabel')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={villeQuery}
                  onChange={(e) => setVilleQuery(e.target.value)}
                  onFocus={() => villeSuggestions.length > 0 && setShowVilleSuggestions(true)}
                  placeholder={t('locationPlaceholder')}
                  className="w-full h-9 px-3 pr-8 border border-input bg-white rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {villeLoading && (
                  <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                )}
                {villeQuery && (
                  <button
                    type="button"
                    onClick={clearVille}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {showVilleSuggestions && villeSuggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                  {villeSuggestions.map((item, i) => (
                    <li
                      key={i}
                      className="px-3 py-2.5 hover:bg-primary-light cursor-pointer text-sm border-b border-gray-100 last:border-0"
                      onClick={() => selectVille(item)}
                    >
                      {item.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Service */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">{t('serviceLabel')}</label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('allServices')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allServices')}</SelectItem>
                  <SelectItem value="hebergement">{t('selectHebergement')}</SelectItem>
                  <SelectItem value="garde">{t('selectGarde')}</SelectItem>
                  <SelectItem value="visite-domicile">{t('selectVisite')}</SelectItem>
                  <SelectItem value="promenade">{t('selectPromenade')}</SelectItem>
                  <SelectItem value="excursion">{t('serviceTypes.excursion')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type d'animal */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">{t('animalsAccepted')}</label>
              <Select value={topBarAnimal} onValueChange={handleTopBarAnimalChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('allAnimals')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allAnimals')}</SelectItem>
                  {animalTypes.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Options */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">{t('optionsLabel')}</label>
              <Select
                value={selectedOption}
                onValueChange={setSelectedOption}
                disabled={!availableOptionData}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={availableOptionData ? t('allOptions') : t('selectServiceAndAnimal')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allOptions')}</SelectItem>
                  {availableOptionData?.options.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {tProfile(`profilePage.servicesTab.serviceOptions.${availableOptionData.key}.${opt.id}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                {t('datesLabel')}
              </label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      {startDate ? format(startDate, "dd/MM", { locale: dateLocale }) : t('dateStart')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      locale={dateLocale}
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      {endDate ? format(endDate, "dd/MM", { locale: dateLocale }) : t('dateEnd')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      locale={dateLocale}
                      disabled={(date) => startDate ? date < startDate : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Bouton recherche */}
            <Button
              onClick={handleSearch}
              className="bg-primary hover:bg-primary-hover text-white h-10"
            >
              <Search className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('searchBtn')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-6">
        {hasSearched ? (
          <div className="flex gap-6">
            {/* Sidebar Filtres - Desktop */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-[80px]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">{t('filters')}</h3>
                  <Button
                    onClick={resetFilters}
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary-hover"
                  >
                    {t('reset')}
                  </Button>
                </div>

                {/* Service */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <SlidersHorizontal className="w-4 h-4 text-primary" />
                    </div>
                    {t('servicesSection')}
                  </h4>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('allServices')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allServices')}</SelectItem>
                      <SelectItem value="hebergement">{t('selectHebergement')}</SelectItem>
                      <SelectItem value="garde">{t('selectGarde')}</SelectItem>
                      <SelectItem value="visite-domicile">{t('selectVisite')}</SelectItem>
                      <SelectItem value="promenade">{t('selectPromenade')}</SelectItem>
                      <SelectItem value="excursion">{t('serviceTypes.excursion')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Type d'animal */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sm mb-3">{t('animalsAccepted')}</h4>
                  <Select value={topBarAnimal} onValueChange={handleTopBarAnimalChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('allAnimals')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allAnimals')}</SelectItem>
                      {animalTypes.map((animal) => (
                        <SelectItem key={animal.id} value={animal.id}>
                          {animal.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Options de service */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sm mb-3">{t('optionsLabel')}</h4>
                  <Select
                    value={selectedOption}
                    onValueChange={setSelectedOption}
                    disabled={!availableOptionData}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={availableOptionData ? t('allOptions') : t('selectServiceAndAnimal')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allOptions')}</SelectItem>
                      {availableOptionData?.options.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {tProfile(`profilePage.servicesTab.serviceOptions.${availableOptionData.key}.${opt.id}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rayon */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sm mb-3">{t('distanceRadius')}</h4>
                  <div className="space-y-3">
                    <Slider
                      value={radius}
                      onValueChange={setRadius}
                      min={1}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600">{radius[0]} km</p>
                  </div>
                </div>


                {/* Badge Safety Fast */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">{t('safetyBadge')}</span>
                      <p className="text-xs text-gray-500">{t('safetyBadgeText')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Bouton filtres mobile */}
            <Button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden fixed bottom-6 right-6 bg-primary hover:bg-primary-hover text-white p-4 rounded-full shadow-lg z-30 h-auto"
            >
              <SlidersHorizontal className="w-6 h-6" />
            </Button>

            {/* Modal filtres mobile */}
            {showMobileFilters && (
              <div className="lg:hidden fixed inset-0 bg-black/50 z-40 flex items-end">
                <div className="bg-white w-full max-h-[80vh] overflow-y-auto rounded-t-3xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">{t('filters')}</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowMobileFilters(false)}>
                      <X className="w-6 h-6" />
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Service */}
                    <div>
                      <h4 className="font-semibold mb-3">{t('servicesSection')}</h4>
                      <Select value={service} onValueChange={setService}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t('allServices')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('allServices')}</SelectItem>
                          <SelectItem value="hebergement">{t('selectHebergement')}</SelectItem>
                          <SelectItem value="garde">{t('selectGarde')}</SelectItem>
                          <SelectItem value="visite-domicile">{t('selectVisite')}</SelectItem>
                          <SelectItem value="promenade">{t('selectPromenade')}</SelectItem>
                          <SelectItem value="excursion">{t('serviceTypes.excursion')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Type d'animal */}
                    <div>
                      <h4 className="font-semibold mb-3">{t('animalsAccepted')}</h4>
                      <Select value={topBarAnimal} onValueChange={handleTopBarAnimalChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t('allAnimals')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('allAnimals')}</SelectItem>
                          {animalTypes.map((animal) => (
                            <SelectItem key={animal.id} value={animal.id}>
                              {animal.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Options de service */}
                    <div>
                      <h4 className="font-semibold mb-3">{t('optionsLabel')}</h4>
                      <Select
                        value={selectedOption}
                        onValueChange={setSelectedOption}
                        disabled={!availableOptionData}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={availableOptionData ? t('allOptions') : t('selectServiceAndAnimal')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('allOptions')}</SelectItem>
                          {availableOptionData?.options.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id}>
                              {tProfile(`profilePage.servicesTab.serviceOptions.${availableOptionData.key}.${opt.id}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Rayon */}
                    <div>
                      <h4 className="font-semibold mb-3">{t('distanceRadius')}: {radius[0]} km</h4>
                      <Slider
                        value={radius}
                        onValueChange={setRadius}
                        min={1}
                        max={100}
                        step={1}
                      />
                    </div>


                  </div>

                  <div className="flex gap-3 mt-6 pt-6 border-t">
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      className="flex-1"
                    >
                      {t('reset')}
                    </Button>
                    <Button
                      onClick={() => setShowMobileFilters(false)}
                      className="flex-1 bg-primary hover:bg-primary-hover text-white"
                    >
                      {t('apply')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Résultats */}
            <div className="flex-1 min-w-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {filteredSitters.length} pet sitter{filteredSitters.length !== 1 ? 's' : ''} {ville && t('resultsIn', { city: ville })}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{t('sortBy')}</span>
                  <Select defaultValue="recommended">
                    <SelectTrigger className="w-[180px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">{t('sortRecommended')}</SelectItem>
                      <SelectItem value="price-asc">{t('sortPriceAsc')}</SelectItem>
                      <SelectItem value="price-desc">{t('sortPriceDesc')}</SelectItem>
                      <SelectItem value="rating">{t('sortRating')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow h-96 animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-t-xl" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : currentSitters.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl">
                  <p className="text-gray-600">{t('noResults')}</p>
                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    className="mt-4"
                  >
                    {t('resetFilters')}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {currentSitters.map((sitter) => {
                      const { activeServiceKeys: _omit, ...cardProps } = sitter;
                      return <SitterCard key={sitter.id} {...cardProps} />;
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      {getPageNumbers().map((pageNum, idx) => (
                        pageNum === '...' ? (
                          <span key={`ellipsis-${idx}`} className="px-2">...</span>
                        ) : (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="icon"
                            onClick={() => setCurrentPage(pageNum as number)}
                            className={currentPage === pageNum ? "bg-primary hover:bg-primary-hover text-white" : ""}
                          >
                            {pageNum}
                          </Button>
                        )
                      ))}
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🐾</div>
            <h2 className="text-2xl font-bold mb-2">{t('heroTitle')}</h2>
            <p className="text-gray-600">{t('heroSubtitle')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
