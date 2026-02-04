'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Heart, Trash2 } from 'lucide-react';
import type { Favorite } from '@/types';
import { removeFavorite } from '@/lib/supabase/favorites';
import { useState } from 'react';

interface FavoriteCardProps {
  favorite: Favorite;
  onRemove?: () => void;
}

export function FavoriteCard({ favorite, onRemove }: FavoriteCardProps) {
  const [removing, setRemoving] = useState(false);
  const sitter = favorite.sitter;

  if (!sitter) return null;

  const handleRemove = async () => {
    if (!confirm('Retirer ce petsitter de vos favoris ?')) return;

    setRemoving(true);
    try {
      await removeFavorite(favorite.owner_id, favorite.sitter_id);
      onRemove?.();
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex gap-4">
        {/* Avatar */}
        <Link href={`/petsitter/${sitter.id}`} className="flex-shrink-0">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden">
            {sitter.avatar ? (
              <Image
                src={sitter.avatar}
                alt={sitter.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <Link
                href={`/petsitter/${sitter.id}`}
                className="text-lg font-bold hover:text-primary"
              >
                {sitter.name}
              </Link>
              {sitter.city && (
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <MapPin className="w-4 h-4" />
                  {sitter.city}
                </div>
              )}
            </div>

            <button
              onClick={handleRemove}
              disabled={removing}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Retirer des favoris"
            >
              {removing ? (
                <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Rating */}
          {sitter.rating && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="font-semibold">{sitter.rating.toFixed(1)}</span>
              </div>
              {sitter.reviews_count && (
                <span className="text-sm text-gray-500">
                  ({sitter.reviews_count} avis)
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {sitter.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {sitter.description}
            </p>
          )}

          {/* Animals */}
          {sitter.animals && sitter.animals.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {sitter.animals.slice(0, 4).map((animal) => (
                <span
                  key={animal}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {animal}
                </span>
              ))}
              {sitter.animals.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{sitter.animals.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Action */}
          <Link
            href={`/petsitter/${sitter.id}`}
            className="inline-block px-4 py-2 bg-primary text-dark font-semibold rounded-lg hover:bg-primary-hover transition-colors text-sm"
          >
            Voir le profil
          </Link>
        </div>
      </div>
    </div>
  );
}
