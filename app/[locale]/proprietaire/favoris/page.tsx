'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, Link } from '@/navigation';
import { createClient } from '@/lib/supabase/client';
import { OwnerLayout } from '@/components/layout/OwnerLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Image from 'next/image';
import { Heart, MapPin, Star, Trash2, ExternalLink } from 'lucide-react';

interface FavoriteSitter {
  id: string;
  sitter_id: string;
  created_at: string;
  sitter: {
    id: string;
    name: string;
    city: string | null;
    avatar: string | null;
    description: string | null;
    average_rating: number;
    total_reviews: number;
    daily_rate: number | null;
    animals: string[] | null;
  } | null;
}

function FavoritesContent() {
  const { user, refreshKey } = useAuth();
  const router = useRouter();
  const t = useTranslations('ownerDashboard.favoritesPage');
  const [favorites, setFavorites] = useState<FavoriteSitter[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const supabase = createClient();

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Récupérer les favoris
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('id, sitter_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (favoritesError) {
        console.error('Erreur favoris:', favoritesError);
        setFavorites([]);
        return;
      }

      if (!favoritesData || favoritesData.length === 0) {
        setFavorites([]);
        return;
      }

      // 2. Récupérer les profils des sitters séparément
      const sitterIds = favoritesData.map((f: any) => f.sitter_id);
      const { data: sittersData, error: sittersError } = await supabase
        .from('sitter_profiles')
        .select('id, name, city, avatar, description, average_rating, total_reviews, daily_rate, animals')
        .in('id', sitterIds);

      if (sittersError) {
        console.error('Erreur sitters:', sittersError);
      }

      // 3. Combiner les données
      const combined: FavoriteSitter[] = favoritesData.map((fav: any) => ({
        id: fav.id,
        sitter_id: fav.sitter_id,
        created_at: fav.created_at,
        sitter: sittersData?.find((s: any) => s.id === fav.sitter_id) || null
      }));

      // Filtrer ceux qui ont un profil valide
      setFavorites(combined.filter(f => f.sitter !== null));

    } catch (error) {
      console.error('Erreur:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user, refreshKey, fetchFavorites]);

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Petsitter retiré des favoris' });
      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la suppression' });
    }
  };

  if (loading) {
    return (
      <OwnerLayout>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-2">{t('subtitle')}</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-16 text-gray-500">
              <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium text-lg">{t('noFavorites')}</p>
              <p className="text-sm mt-2 mb-6">{t('noFavoritesText')}</p>
              <button
                onClick={() => router.push('/recherche')}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-dark font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                {t('findPetsitters')}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <div className="h-32 bg-gradient-to-br from-primary-light to-primary flex items-center justify-center">
                    {favorite.sitter?.avatar ? (
                      <div className="relative w-24 h-24">
                        <Image
                          src={favorite.sitter.avatar}
                          alt={favorite.sitter.name}
                          fill
                          className="rounded-full object-cover border-4 border-white"
                          sizes="96px"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-4xl">
                        👤
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFavorite(favorite.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors group"
                    title="Retirer des favoris"
                  >
                    <Heart className="w-5 h-5 fill-red-500 text-red-500 group-hover:fill-red-600" />
                  </button>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{favorite.sitter?.name}</h3>
                  
                  {favorite.sitter?.city && (
                    <p className="text-gray-600 flex items-center gap-1 text-sm mb-3">
                      <MapPin className="w-4 h-4" />
                      {favorite.sitter.city}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i <= Math.round(favorite.sitter?.average_rating || 0)
                              ? 'fill-primary text-primary'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({favorite.sitter?.total_reviews || 0} avis)
                    </span>
                  </div>

                  {favorite.sitter?.animals && favorite.sitter.animals.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {favorite.sitter.animals.slice(0, 3).map((animal, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                        >
                          {animal}
                        </span>
                      ))}
                    </div>
                  )}

                  {favorite.sitter?.daily_rate && (
                    <p className="text-primary font-bold mb-4">
                      À partir de {favorite.sitter.daily_rate}€/jour
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/petsitter/${favorite.sitter_id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-dark font-semibold py-2.5 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t('viewProfile')}
                    </Link>
                    <button
                      onClick={() => removeFavorite(favorite.id)}
                      className="px-4 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title={t('removeFavorite')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}

export default function OwnerFavoritesPage() {
  return (
    <AuthGuard requiredRole="owner">
      <FavoritesContent />
    </AuthGuard>
  );
}
