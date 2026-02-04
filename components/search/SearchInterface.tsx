'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search, MapPin, Calendar as CalendarIcon, X, SlidersHorizontal, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ANIMAL_TYPES } from '@/types/sitterProfileForm';
import type { ServiceType } from '@/types/sitterProfileForm';
import { SitterCard } from './SitterCard';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
    services?: { services?: Record<string, { active?: boolean; price?: string }> } | null;
    coordinates?: unknown;
  },
  tServices: (key: string) => string
): SitterCardData {
  const name =
    (row.name && row.name.trim()) ||
    [row.first_name, row.last_name].filter(Boolean).join(' ') ||
    'Petsitter';
  const city = row.address?.trim() || 'Ville non précisée';
  const animalLabels = new Map<string, string>(ANIMAL_TYPES.map((a) => [a.id, a.label]));
  const animalIds: string[] = Array.isArray(row.animals) ? row.animals : [];
  const animals: string[] = animalIds.map((id) => animalLabels.get(id) || id);
  const svc = row.services?.services ?? {};
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
  const [priceRange, setPriceRange] = useState([0, 150]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const [sitters, setSitters] = useState<SitterCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations('search');
  const tServices = useTranslations('services');
  const tCities = useTranslations('cities');

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
      setSitters((data ?? []).map((row: any) => mapRowToSitterCard(row, tServices)));
      setLoading(false);
    };
    fetchSitters();
  }, [tServices]);

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

      // Filtre services supplémentaires
      if (selectedServices.length > 0) {
        const hasMatchingService = selectedServices.some(svc =>
          s.activeServiceKeys?.includes(svc as ServiceType)
        );
        if (!hasMatchingService) return false;
      }

      // Filtre prix
      if (s.priceFrom !== undefined && (s.priceFrom < priceRange[0] || s.priceFrom > priceRange[1])) {
        return false;
      }

      return true;
    });
  }, [sitters, ville, villeCoordinates, radius, service, selectedAnimals, selectedServices, priceRange]);

  // Pagination
  const totalPages = Math.ceil(filteredSitters.length / RESULTS_PER_PAGE);
  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
  const endIndex = startIndex + RESULTS_PER_PAGE;
  const currentSitters = filteredSitters.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [ville, service, selectedAnimals, selectedServices, priceRange]);

  const handleSearch = () => {
    setHasSearched(true);
    setCurrentPage(1);
  };

  const toggleAnimal = (animal: string) => {
    setSelectedAnimals(prev => 
      prev.includes(animal) ? prev.filter(a => a !== animal) : [...prev, animal]
    );
  };

  const toggleService = (svc: string) => {
    setSelectedServices(prev => 
      prev.includes(svc) ? prev.filter(s => s !== svc) : [...prev, svc]
    );
  };

  const resetFilters = () => {
    setVille('');
    setVilleQuery('');
    setVilleCoordinates(null);
    setVilleSuggestions([]);
    setSelectedAnimals([]);
    setRadius([50]);
    setPriceRange([0, 150]);
    setSelectedServices([]);
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
    { id: 'petit-chien', label: 'Petit chien (-10kg)' },
    { id: 'moyen-chien', label: 'Moyen chien (10-20kg)' },
    { id: 'grand-chien', label: 'Grand chien (+20kg)' },
    { id: 'chien-attaque', label: 'Chien d\'attaque (Cat. 1)' },
    { id: 'chien-garde', label: 'Chien de garde (Cat. 2)' },
    { id: 'chat', label: 'Chat' },
    { id: 'lapin', label: 'Lapin' },
    { id: 'rongeur', label: 'Petit rongeur' },
    { id: 'oiseau', label: 'Oiseau' },
    { id: 'volaille', label: 'Volaille' },
    { id: 'nac', label: 'NAC' },
  ];

  // Services correspondant aux options du profil petsitter
  const servicesList = [
    { key: 'hebergement', label: 'Hébergement (+12h)' },
    { key: 'garde', label: 'Garde (-12h)' },
    { key: 'visite', label: 'Visite à domicile' },
    { key: 'promenade', label: 'Promenade' },
    { key: 'excursion', label: 'Excursion' },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre de recherche en haut - Sticky */}
      <div className="bg-white shadow-sm border-b sticky top-16 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            {/* Localité */}
            <div ref={villeWrapperRef} className="relative">
              <label className="block text-sm font-medium mb-1.5 text-gray-700">
                <MapPin className="w-4 h-4 inline mr-1" />
                Localité (Belgique)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={villeQuery}
                  onChange={(e) => setVilleQuery(e.target.value)}
                  onFocus={() => villeSuggestions.length > 0 && setShowVilleSuggestions(true)}
                  placeholder="Ville ou code postal..."
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
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Service demandé</label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tous les services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les services</SelectItem>
                  <SelectItem value="hebergement">Hébergement</SelectItem>
                  <SelectItem value="garde">Garde de jour</SelectItem>
                  <SelectItem value="visite-domicile">Visite à domicile</SelectItem>
                  <SelectItem value="promenade">Promenade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Dates */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                Dates
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
                      {startDate ? format(startDate, "dd/MM", { locale: fr }) : "Début"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      locale={fr}
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
                      {endDate ? format(endDate, "dd/MM", { locale: fr }) : "Fin"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      locale={fr}
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
              <span className="hidden sm:inline">Rechercher</span>
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
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-32">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">Filtres</h3>
                  <Button
                    onClick={resetFilters}
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary-hover"
                  >
                    Réinitialiser
                  </Button>
                </div>

                {/* Services */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <SlidersHorizontal className="w-4 h-4 text-primary" />
                    </div>
                    Services
                  </h4>
                  <div className="space-y-3">
                    {servicesList.map(svc => (
                      <div key={svc.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`service-${svc.key}`}
                          checked={selectedServices.includes(svc.key)}
                          onCheckedChange={() => toggleService(svc.key)}
                        />
                        <label
                          htmlFor={`service-${svc.key}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {svc.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prix */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sm mb-3">Prix par nuit</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span>{priceRange[0]}€</span>
                      <span className="text-gray-400">-</span>
                      <span>{priceRange[1]}€+</span>
                    </div>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={150}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Types d'animaux */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sm mb-3">Animaux pris en charge</h4>
                  <div className="space-y-3">
                    {animalTypes.map(animal => (
                      <div key={animal.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`animal-${animal.id}`}
                          checked={selectedAnimals.includes(animal.id)}
                          onCheckedChange={() => toggleAnimal(animal.id)}
                        />
                        <label
                          htmlFor={`animal-${animal.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {animal.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rayon */}
                <div>
                  <h4 className="font-semibold text-sm mb-3">Rayon de distance</h4>
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
                      <span className="text-sm font-medium text-gray-900">Safety Fast</span>
                      <p className="text-xs text-gray-500">Profils vérifiés avec assurance</p>
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
                    <h3 className="font-bold text-lg">Filtres</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowMobileFilters(false)}>
                      <X className="w-6 h-6" />
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Services */}
                    <div>
                      <h4 className="font-semibold mb-3">Services</h4>
                      <div className="space-y-3">
                        {servicesList.map(svc => (
                          <div key={svc.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`mobile-service-${svc.key}`}
                              checked={selectedServices.includes(svc.key)}
                              onCheckedChange={() => toggleService(svc.key)}
                            />
                            <label htmlFor={`mobile-service-${svc.key}`} className="text-sm cursor-pointer">
                              {svc.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prix */}
                    <div>
                      <h4 className="font-semibold mb-3">Prix: {priceRange[0]}€ - {priceRange[1]}€</h4>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={150}
                        step={5}
                      />
                    </div>

                    {/* Animaux */}
                    <div>
                      <h4 className="font-semibold mb-3">Animaux pris en charge</h4>
                      <div className="space-y-3">
                        {animalTypes.map(animal => (
                          <div key={animal.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`mobile-animal-${animal.id}`}
                              checked={selectedAnimals.includes(animal.id)}
                              onCheckedChange={() => toggleAnimal(animal.id)}
                            />
                            <label htmlFor={`mobile-animal-${animal.id}`} className="text-sm cursor-pointer">
                              {animal.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rayon */}
                    <div>
                      <h4 className="font-semibold mb-3">Rayon: {radius[0]} km</h4>
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
                      Réinitialiser
                    </Button>
                    <Button
                      onClick={() => setShowMobileFilters(false)}
                      className="flex-1 bg-primary hover:bg-primary-hover text-white"
                    >
                      Appliquer
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Résultats */}
            <div className="flex-1 min-w-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {filteredSitters.length} pet sitter{filteredSitters.length !== 1 ? 's' : ''} {ville && `à ${ville}`}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Trier par:</span>
                  <Select defaultValue="recommended">
                    <SelectTrigger className="w-[180px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">Recommandés</SelectItem>
                      <SelectItem value="price-asc">Prix croissant</SelectItem>
                      <SelectItem value="price-desc">Prix décroissant</SelectItem>
                      <SelectItem value="rating">Mieux notés</SelectItem>
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
                  <p className="text-gray-600">Aucun petsitter trouvé avec ces critères.</p>
                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    className="mt-4"
                  >
                    Réinitialiser les filtres
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
            <h2 className="text-2xl font-bold mb-2">Trouvez le petsitter idéal</h2>
            <p className="text-gray-600">Utilisez les filtres ci-dessus pour commencer votre recherche</p>
          </div>
        )}
      </div>
    </div>
  );
}
