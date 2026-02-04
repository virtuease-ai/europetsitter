'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from '@/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { OwnerLayout } from '@/components/layout/OwnerLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { StatCard } from '@/components/shared/StatCard';
import { Link } from '@/navigation';
import { Calendar, Heart, PawPrint, Search, MapPin, ArrowRight } from 'lucide-react';

// Fuseau horaire de Bruxelles
const TIMEZONE = 'Europe/Brussels';

// Créer une date locale à partir d'une chaîne YYYY-MM-DD sans décalage
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Obtenir la date d'aujourd'hui à minuit (fuseau horaire local)
const getTodayAtMidnight = (): Date => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

interface Stats {
  petsCount: number;
  activeBookings: number;
  favoritesCount: number;
  completedBookings: number;
}

interface UpcomingBooking {
  id: string;
  start_date: string;
  end_date: string;
  service_type: string;
  animal_name: string | null;
  sitter_name: string;
  sitter_city: string | null;
}

function DashboardContent() {
  const { user, refreshKey } = useAuth();
  const router = useRouter();
  const t = useTranslations('ownerDashboard');
  const locale = useLocale();
  const [stats, setStats] = useState<Stats>({ petsCount: 0, activeBookings: 0, favoritesCount: 0, completedBookings: 0 });
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Récupérer les stats en parallèle
      const [petsRes, bookingsRes, favoritesRes] = await Promise.all([
        supabase.from('pets').select('id', { count: 'exact' }).eq('owner_id', user.id),
        supabase.from('bookings').select('*').eq('owner_id', user.id),
        supabase.from('favorites').select('id', { count: 'exact' }).eq('user_id', user.id),
      ]);

      const bookings = bookingsRes.data || [];
      const activeBookings = bookings.filter((b: any) => b.status === 'pending' || b.status === 'accepted').length;
      const completedBookings = bookings.filter((b: any) => b.status === 'completed').length;

      setStats({
        petsCount: petsRes.count || 0,
        activeBookings,
        favoritesCount: favoritesRes.count || 0,
        completedBookings,
      });

      // Récupérer les prochaines réservations confirmées
      const today = getTodayAtMidnight();
      const upcoming = bookings
        .filter((b: any) => b.status === 'accepted' && parseLocalDate(b.start_date) >= today)
        .sort((a: any, b: any) => parseLocalDate(a.start_date).getTime() - parseLocalDate(b.start_date).getTime())
        .slice(0, 3);

      if (upcoming.length > 0) {
        const sitterIds = [...new Set(upcoming.map((b: any) => b.sitter_id))];
        const { data: sitters } = await supabase
          .from('sitter_profiles')
          .select('id, name, city')
          .in('id', sitterIds);

        const enrichedUpcoming = upcoming.map((b: any) => ({
          id: b.id,
          start_date: b.start_date,
          end_date: b.end_date,
          service_type: b.service_type,
          animal_name: b.animal_name,
          sitter_name: sitters?.find((s: any) => s.id === b.sitter_id)?.name || 'Petsitter',
          sitter_city: sitters?.find((s: any) => s.id === b.sitter_id)?.city || null,
        }));

        setUpcomingBookings(enrichedUpcoming);
      }
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user, refreshKey, fetchDashboardData]);

  const formatDate = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString(locale === 'en' ? 'en-GB' : locale === 'nl' ? 'nl-BE' : 'fr-BE', {
      day: 'numeric',
      month: 'short',
      timeZone: TIMEZONE,
    });
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
          <p className="text-gray-600 mt-2">{t('welcome', { name: user?.name || '' })} 👋</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t('stats.myPets')}
            value={stats.petsCount}
            icon={PawPrint}
            color="blue"
          />
          <StatCard
            title={t('stats.activeBookings')}
            value={stats.activeBookings}
            icon={Calendar}
            color="green"
          />
          <StatCard
            title={t('stats.favoritePetsitters')}
            value={stats.favoritesCount}
            icon={Heart}
            color="purple"
          />
          <StatCard
            title={t('stats.completedBookings')}
            value={stats.completedBookings}
            icon={Search}
            color="green"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Actions rapides */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">{t('quickActions')}</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/proprietaire/mes-animaux')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary-light/20 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <PawPrint className="w-5 h-5 text-primary" />
                      {stats.petsCount === 0 ? t('addPet') : t('managePets')}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {stats.petsCount === 0
                        ? t('createPetProfile')
                        : stats.petsCount > 1
                          ? t('petsRegisteredPlural', { count: stats.petsCount })
                          : t('petsRegistered', { count: stats.petsCount })}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              </button>

              <button
                onClick={() => router.push('/recherche')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary-light/20 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Search className="w-5 h-5 text-primary" />
                      {t('findPetsitter')}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{t('searchNearby')}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              </button>

              <button
                onClick={() => router.push('/proprietaire/favoris')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary-light/20 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      {t('myFavorites')}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {stats.favoritesCount === 0
                        ? t('noFavoritesYet')
                        : stats.favoritesCount > 1
                          ? t('favoritePetsitterPlural', { count: stats.favoritesCount })
                          : t('favoritePetsitter', { count: stats.favoritesCount })}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              </button>
            </div>
          </div>

          {/* Réservations à venir */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t('upcomingReservations')}</h2>
              {upcomingBookings.length > 0 && (
                <Link href="/proprietaire/reservations" className="text-primary hover:underline text-sm font-medium">
                  {t('viewAll')}
                </Link>
              )}
            </div>

            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">{t('noUpcomingReservations')}</p>
                <button
                  onClick={() => router.push('/recherche')}
                  className="mt-4 text-primary hover:underline text-sm font-medium"
                >
                  {t('findPetsitter')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href="/proprietaire/reservations"
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{booking.sitter_name}</p>
                        {booking.sitter_city && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {booking.sitter_city}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          {booking.service_type} • {booking.animal_name || 'Animal'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary">
                          {formatDate(booking.start_date)}
                        </p>
                        <p className="text-xs text-gray-500">
                          → {formatDate(booking.end_date)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Conseil */}
        <div className="bg-gradient-to-r from-primary-light to-primary/20 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-2">💡 {t('tip')}</h3>
          <p className="text-gray-700">
            {t('tipText')}
          </p>
        </div>
      </div>
    </OwnerLayout>
  );
}

export default function OwnerDashboard() {
  return (
    <AuthGuard requiredRole="owner">
      <DashboardContent />
    </AuthGuard>
  );
}
