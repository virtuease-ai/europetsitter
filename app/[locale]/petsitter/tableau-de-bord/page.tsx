'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from '@/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { SitterLayout } from '@/components/layout/SitterLayout';
import { StatCard } from '@/components/shared/StatCard';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SubscriptionGuard } from '@/components/auth/SubscriptionGuard';
import { Link } from '@/navigation';
import {
  Calendar,
  DollarSign,
  Star,
  ClipboardList,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  PawPrint,
  Euro
} from 'lucide-react';

// Fuseau horaire de Bruxelles
const TIMEZONE = 'Europe/Brussels';

// Créer une date locale à partir d'une chaîne YYYY-MM-DD sans décalage
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

interface Stats {
  pendingCount: number;
  upcomingCount: number;
  averageRating: number;
  monthlyRevenue: number;
  totalReviews: number;
}

interface RecentBooking {
  id: string;
  owner_id: string;
  status: string;
  start_date: string;
  end_date: string;
  service_type: string;
  animal_name: string | null;
  animal_type: string;
  total_price: number | null;
  created_at: string;
  owner_name?: string;
}

function DashboardContent() {
  const { user, refreshKey } = useAuth();
  const router = useRouter();
  const t = useTranslations('sitterDashboard');
  const locale = useLocale();
  const supabase = createClient();

  const [stats, setStats] = useState<Stats>({
    pendingCount: 0,
    upcomingCount: 0,
    averageRating: 5.0,
    monthlyRevenue: 0,
    totalReviews: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Récupérer toutes les réservations
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('sitter_id', user.id)
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('Erreur bookings:', bookingsError);
      }

      // Récupérer les avis
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewee_id', user.id);

      // Calculer les stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const pendingCount = bookings?.filter((b: any) => b.status === 'pending').length || 0;
      const upcomingCount = bookings?.filter((b: any) =>
        b.status === 'accepted' && parseLocalDate(b.start_date) >= today
      ).length || 0;

      // Revenus du mois (réservations complétées ce mois)
      const monthlyRevenue = bookings
        ?.filter((b: any) =>
          b.status === 'completed' &&
          new Date(b.created_at) >= startOfMonth
        )
        .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0) || 0;

      // Note moyenne
      const avgRating = reviews && reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : 5.0;

      setStats({
        pendingCount,
        upcomingCount,
        averageRating: Math.round(avgRating * 10) / 10,
        monthlyRevenue,
        totalReviews: reviews?.length || 0,
      });

      // Réservations récentes (5 dernières)
      if (bookings && bookings.length > 0) {
        const recent = bookings.slice(0, 5);
        const ownerIds = [...new Set(recent.map((b: any) => b.owner_id))];

        const { data: owners } = await supabase
          .from('users')
          .select('id, name')
          .in('id', ownerIds);

        const enrichedBookings = recent.map((booking: any) => ({
          ...booking,
          owner_name: owners?.find((o: any) => o.id === booking.owner_id)?.name || 'Propriétaire',
        }));

        setRecentBookings(enrichedBookings);
      }
    } catch (error) {
      console.error('Erreur dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user, refreshKey, fetchDashboardData]);

  const updateBookingStatus = async (bookingId: string, newStatus: 'accepted' | 'declined') => {
    setActionLoading(bookingId);

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      // Envoyer une notification au propriétaire
      const booking = recentBookings.find(b => b.id === bookingId);
      if (booking) {
        const statusText = newStatus === 'accepted' ? t('status.accepted') : t('status.declined');
        await supabase.from('notifications').insert({
          user_id: booking.owner_id,
          type: newStatus === 'accepted' ? 'booking_accepted' : 'booking_declined',
          title: `Réservation ${statusText}`,
          message: `Votre demande de réservation a été ${statusText.toLowerCase()}.`,
          link: `/${locale}/proprietaire/reservations`,
        });
      }

      await fetchDashboardData();
    } catch (error) {
      console.error('Erreur mise à jour:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString(locale === 'en' ? 'en-GB' : locale === 'nl' ? 'nl-BE' : 'fr-BE', {
      day: 'numeric',
      month: 'short',
      timeZone: TIMEZONE,
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-primary-light text-primary-hover',
      accepted: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      declined: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {t(`status.${status}`)}
      </span>
    );
  };

  if (loading) {
    return (
      <SitterLayout>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </SitterLayout>
    );
  }

  return (
    <SitterLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-2">
            {t('welcome', { name: user?.name || '' })}
          </p>
        </div>

        {/* Alerte demandes en attente */}
        {stats.pendingCount > 0 && (
          <div className="bg-primary-light/50 border-2 border-primary/30 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-primary-hover">
                  {stats.pendingCount > 1
                    ? t('pendingAlert.titlePlural', { count: stats.pendingCount })
                    : t('pendingAlert.title', { count: stats.pendingCount })}
                </h3>
                <p className="text-sm text-primary-hover/90">
                  {t('pendingAlert.text')}
                </p>
              </div>
            </div>
            <Link
              href="/petsitter/reservations"
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 text-sm"
            >
              {t('pendingAlert.viewRequests')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t('stats.pendingRequests')}
            value={stats.pendingCount}
            icon={ClipboardList}
            color="orange"
          />
          <StatCard
            title={t('stats.upcomingReservations')}
            value={stats.upcomingCount}
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title={t('stats.averageRating')}
            value={`${stats.averageRating} ⭐`}
            icon={Star}
            color="green"
            subtitle={stats.totalReviews > 0 ? t('stats.reviewsCount', { count: stats.totalReviews }) : t('stats.noReviewsYet')}
          />
          <StatCard
            title={t('stats.monthlyRevenue')}
            value={`${stats.monthlyRevenue}€`}
            icon={DollarSign}
            color="purple"
          />
        </div>

        {/* Warning Card - Trial Status */}
        {user?.subscription_status === 'trial' && (
          <div className="bg-primary-light/50 border border-primary/20 rounded-2xl p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-primary-hover">{t('trialAlert.title')}</h3>
              <p className="text-sm text-primary-hover/90 mt-1">
                {t('trialAlert.text')}
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('quickActions')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/petsitter/profil')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary-light/20 transition-all text-left group"
            >
              <h3 className="font-semibold text-gray-900">{t('completeProfile')}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {t('completeProfileText')}
              </p>
            </button>
            <button
              onClick={() => router.push('/petsitter/calendrier')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary-light/20 transition-all text-left group"
            >
              <h3 className="font-semibold text-gray-900">{t('manageCalendar')}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {t('manageCalendarText')}
              </p>
            </button>
            <button
              onClick={() => router.push('/petsitter/reservations')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary-light/20 transition-all text-left group"
            >
              <h3 className="font-semibold text-gray-900">{t('myReservations')}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {t('manageRequests', { count: stats.pendingCount })}
              </p>
            </button>
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{t('recentRequests')}</h2>
            {recentBookings.length > 0 && (
              <Link
                href="/petsitter/reservations"
                className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
              >
                {t('viewAll')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {recentBookings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('noRequests')}</p>
              <p className="text-sm mt-2">{t('noRequestsText')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-light to-primary rounded-full flex items-center justify-center text-white font-bold">
                        {booking.owner_name?.[0]?.toUpperCase() || 'P'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{booking.owner_name}</p>
                          {getStatusBadge(booking.status)}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(booking.start_date)} → {formatDate(booking.end_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <PawPrint className="w-3 h-3" />
                            {booking.animal_name || booking.animal_type}
                          </span>
                          {booking.total_price && (
                            <span className="flex items-center gap-1 text-primary font-medium">
                              <Euro className="w-3 h-3" />
                              {booking.total_price}€
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {booking.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'accepted')}
                          disabled={actionLoading === booking.id}
                          className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors disabled:opacity-50"
                          title={t('accept')}
                        >
                          {actionLoading === booking.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'declined')}
                          disabled={actionLoading === booking.id}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50"
                          title={t('decline')}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SitterLayout>
  );
}

export default function SitterDashboard() {
  return (
    <AuthGuard requiredRole="sitter">
      <SubscriptionGuard>
        <DashboardContent />
      </SubscriptionGuard>
    </AuthGuard>
  );
}
