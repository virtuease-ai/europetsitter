'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';

interface Coords {
  latitude: number;
  longitude: number;
}

interface AddressAutocompleteProps {
  value: string;
  coordinates: Coords | null;
  onChange: (address: string, coordinates: Coords | null) => void;
  label?: string;
  helpText?: string;
  placeholder?: string;
  error?: string;
  countryCode?: string;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
  };
}

export function AddressAutocomplete({
  value,
  coordinates,
  onChange,
  label = 'Localité (public)',
  helpText = 'Seuls le code postal et la ville seront affichés publiquement (ex: 1000 Bruxelles)',
  placeholder = 'Rechercher une ville ou code postal...',
  error,
  countryCode = 'be',
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=${countryCode}&limit=5&addressdetails=1`,
          { headers: { Accept: 'application/json' } }
        );
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const select = (item: NominatimResult) => {
    // Extraire uniquement le code postal et la ville pour la confidentialité
    const postcode = item.address?.postcode || '';
    const city = item.address?.city || item.address?.town || item.address?.village || item.address?.municipality || '';

    // Format: "1000 Bruxelles" ou juste la ville si pas de code postal
    const locationOnly = postcode && city
      ? `${postcode} ${city}`
      : city || item.display_name.split(',')[0];

    onChange(locationOnly, { latitude: parseFloat(item.lat), longitude: parseFloat(item.lon) });
    setQuery(locationOnly);
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-semibold mb-2">{label}</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            error ? 'border-error' : 'border-gray-300'
          }`}
        />
      </div>
      {helpText && <p className="text-sm text-gray-500 mt-1">{helpText}</p>}
      {error && <p className="text-sm text-error mt-1">{error}</p>}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
          {suggestions.map((item, i) => (
            <li
              key={i}
              className="px-4 py-3 hover:bg-primary-light cursor-pointer text-sm border-b border-gray-100 last:border-0"
              onClick={() => select(item)}
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
          Recherche...
        </div>
      )}
    </div>
  );
}
