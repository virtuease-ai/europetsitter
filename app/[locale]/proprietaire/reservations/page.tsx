'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { OwnerLayout } from '@/components/layout/OwnerLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ClipboardList, Calendar, MapPin, X, MessageCircle, XCircle, CheckCircle } from 'lucide-react';
import { Link } from '@/navigation';

// Fuseau horaire de Bruxelles
const TIMEZONE = 'Europe/Brussels';

// Créer une date locale à partir d'une chaîne YYYY-MM-DD sans décalage
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

interface Booking {
  id: string;
  sitter_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed';
  start_date: string;
  end_date: string;
  total_price: number | null;
  service_type: string;
  animal_type: string;
  animal_name: string | null;
  special_instructions: string | null;
  created_at: string;
  sitter_name?: string;
  sitter_city?: string;
}

type TabStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

function ReservationsContent() {
  const { user, refreshKey } = useAuth();
  const t = useTranslations('ownerDashboard.reservationsPage');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabStatus>('pending');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const supabase = createClient();

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !data) {
        setLoading(false);
        return;
      }

      // Fetch sitter profiles
      const sitterIds = [...new Set(data.map((b: any) => b.sitter_id))];
      if (sitterIds.length > 0) {
        const { data: sitters } = await supabase
          .from('sitter_profiles')
          .select('id, name, city')
          .in('id', sitterIds);

        const enrichedBookings = data.map((booking: any) => ({
          ...booking,
          sitter_name: sitters?.find((s: any) => s.id === booking.sitter_id)?.name || 'Petsitter',
          sitter_city: sitters?.find((s: any) => s.id === booking.sitter_id)?.city || '',
        }));

        setBookings(enrichedBookings);
      } else {
        setBookings(data);
      }
    } catch (error) {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user, refreshKey, fetchBookings]);

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Réservation annulée' });
      await fetchBookings();
      setSelectedBooking(null);
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const getFilteredBookings = () => {
    return bookings.filter(b => {
      if (activeTab === 'pending') return b.status === 'pending';
      if (activeTab === 'accepted') return b.status === 'accepted';
      if (activeTab === 'completed') return b.status === 'completed';
      if (activeTab === 'cancelled') return b.status === 'cancelled' || b.status === 'declined';
      return false;
    });
  };

  const getTabCount = (status: TabStatus) => {
    if (status === 'cancelled') {
      return bookings.filter(b => b.status === 'cancelled' || b.status === 'declined').length;
    }
    return bookings.filter(b => b.status === status).length;
  };

  const formatDate = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString(locale === 'en' ? 'en-GB' : locale === 'nl' ? 'nl-BE' : 'fr-BE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: TIMEZONE,
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-primary-light/80 text-primary',
      accepted: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      declined: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100'}`}>
        {t(status as 'pending' | 'confirmed' | 'completed' | 'cancelled')}
      </span>
    );
  };

  const tabs: { id: TabStatus; label: string }[] = [
    { id: 'pending', label: t('pending') },
    { id: 'accepted', label: t('confirmed') },
    { id: 'completed', label: t('completed') },
    { id: 'cancelled', label: t('cancelled') },
  ];

  const filteredBookings = getFilteredBookings();

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

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto scrollbar-hide -mb-px px-4 sm:px-6 gap-2 sm:gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  <span className="ml-1.5 py-0.5 px-2 rounded-full text-xs bg-gray-100">
                    {getTabCount(tab.id)}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">{t('noReservations')}</p>
                <p className="text-sm mt-2">{t('noReservationsText')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">{booking.sitter_name}</h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        
                        {booking.sitter_city && (
                          <p className="text-gray-600 flex items-center gap-1 text-sm mb-2">
                            <MapPin className="w-4 h-4" />
                            {booking.sitter_city}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(booking.start_date)} → {formatDate(booking.end_date)}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {booking.service_type}
                          </span>
                          <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {booking.animal_name || booking.animal_type}
                          </span>
                        </div>
                      </div>

                      {booking.total_price && (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{booking.total_price}€</p>
                          <p className="text-sm text-gray-500">Total</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal détails */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Détails de la réservation</h2>
                <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{selectedBooking.sitter_name}</h3>
                    {selectedBooking.sitter_city && (
                      <p className="text-gray-600 text-sm">{selectedBooking.sitter_city}</p>
                    )}
                  </div>
                  {getStatusBadge(selectedBooking.status)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Date de début</p>
                    <p className="font-semibold">{formatDate(selectedBooking.start_date)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Date de fin</p>
                    <p className="font-semibold">{formatDate(selectedBooking.end_date)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Service</p>
                    <p className="font-medium">{selectedBooking.service_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Animal</p>
                    <p className="font-medium">
                      {selectedBooking.animal_name ? `${selectedBooking.animal_name} (${selectedBooking.animal_type})` : selectedBooking.animal_type}
                    </p>
                  </div>
                  {selectedBooking.special_instructions && (
                    <div>
                      <p className="text-sm text-gray-600">Instructions spéciales</p>
                      <p className="font-medium">{selectedBooking.special_instructions}</p>
                    </div>
                  )}
                  {selectedBooking.total_price && (
                    <div>
                      <p className="text-sm text-gray-600">Prix total</p>
                      <p className="text-2xl font-bold text-primary">{selectedBooking.total_price}€</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Link
                    href={`/petsitter/${selectedBooking.sitter_id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    {tCommon('viewAll')}
                  </Link>
                  
                  {(selectedBooking.status === 'pending' || selectedBooking.status === 'accepted') && (
                    <button
                      onClick={() => cancelBooking(selectedBooking.id)}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      {t('cancelReservation')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}

export default function OwnerReservationsPage() {
  return (
    <AuthGuard requiredRole="owner">
      <ReservationsContent />
    </AuthGuard>
  );
}
