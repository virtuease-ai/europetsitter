'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ANIMAL_TYPES } from '@/types/sitterProfileForm';
import type { ServiceType } from '@/types/sitterProfileForm';
import { ChevronLeft, ChevronRight, MapPin, Star } from 'lucide-react';

const SERVICE_KEY_TO_LABEL: Record<string, string> = {
  hebergement: 'Hébergement',
  garde: 'Garde',
  visite: 'Visite à domicile',
  promenade: 'Promenade',
  excursion: 'Excursion',
};

const SERVICE_TYPES: ServiceType[] = ['hebergement', 'garde', 'visite', 'promenade', 'excursion'];

export interface HomeSitterCard {
  id: string;
  name: string;
  city: string;
  avatar?: string;
  services: string[];
  priceFrom?: number;
  animals: string[];
}

function mapRowToCard(row: {
  id: string;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  address?: string | null;
  avatar?: string | null;
  animals?: string[] | null;
  services?: { services?: Record<string, { active?: boolean; price?: string }> } | null;
}): HomeSitterCard {
  const name =
    (row.name && row.name.trim()) ||
    [row.first_name, row.last_name].filter(Boolean).join(' ') ||
    'PetSitter';
  const city = row.address?.trim() || 'Ville non précisée';
  const animalLabels = new Map<string, string>(ANIMAL_TYPES.map((a) => [a.id, a.label]));
  const animals: string[] = Array.isArray(row.animals)
    ? row.animals.map((id) => animalLabels.get(id) || id)
    : [];
  const svc = row.services?.services ?? {};
  const activeServiceKeys = SERVICE_TYPES.filter((key) => svc[key]?.active);
  const services = activeServiceKeys.map((key) => SERVICE_KEY_TO_LABEL[key] || key);
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
    services,
    priceFrom,
    animals,
  };
}

function SitterMiniCard({ sitter }: { sitter: HomeSitterCard }) {
  return (
    <Link href={`/petsitter/${sitter.id}`} className="flex-shrink-0 w-[280px] md:w-[320px]">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:border-primary/30 transition-all h-full">
        <div className="h-36 bg-primary-light/30 flex items-center justify-center text-5xl">
          {sitter.avatar ? (
            <img src={sitter.avatar} alt={sitter.name} className="w-full h-full object-cover" />
          ) : (
            <span>👤</span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-900 truncate">{sitter.name}</h3>
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{sitter.city}</span>
          </p>
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="text-sm text-gray-600">5.0</span>
          </div>
          {sitter.services.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {sitter.services.slice(0, 2).map((s) => (
                <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          )}
          {sitter.priceFrom != null && (
            <p className="text-sm font-semibold text-primary mt-2">À partir de {sitter.priceFrom}€/jour</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export function HomeSittersSlider() {
  const [sitters, setSitters] = useState<HomeSitterCard[]>([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSitters = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('sitter_profiles')
        .select('id, name, first_name, last_name, address, avatar, animals, services')
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) {
        setSitters([]);
        setLoading(false);
        return;
      }
      setSitters((data ?? []).map(mapRowToCard));
      setLoading(false);
    };
    fetchSitters();
  }, []);

  const handleScrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (sitters.length === 0) {
    return null;
  }

  return (
    <div className="w-full relative">
      {/* Slider horizontal */}
      <div 
        className="overflow-x-auto scrollbar-hide scroll-smooth" 
        ref={sliderRef}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div className="flex gap-4 w-max pb-2">
          {sitters.map((sitter) => (
            <SitterMiniCard key={sitter.id} sitter={sitter} />
          ))}
        </div>
      </div>

      {/* Flèches de contrôle */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={handleScrollLeft}
          className="bg-white hover:bg-primary hover:text-white text-primary border-2 border-primary rounded-full p-3 transition-all shadow-md hover:shadow-lg"
          aria-label="Défiler vers la gauche"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleScrollRight}
          className="bg-white hover:bg-primary hover:text-white text-primary border-2 border-primary rounded-full p-3 transition-all shadow-md hover:shadow-lg"
          aria-label="Défiler vers la droite"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
