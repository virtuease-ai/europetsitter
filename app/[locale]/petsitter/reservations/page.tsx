'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { SitterLayout } from '@/components/layout/SitterLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SubscriptionGuard } from '@/components/auth/SubscriptionGuard';
import { 
  ClipboardList, 
  Check, 
  Clock, 
  X, 
  Calendar, 
  User, 
  PawPrint, 
  MessageCircle,
  CheckCircle,
  XCircle,
  MapPin,
  FileText,
  Euro
} from 'lucide-react';

// Fuseau horaire de Bruxelles
const TIMEZONE = 'Europe/Brussels';

// Créer une date locale à partir d'une chaîne YYYY-MM-DD sans décalage
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

type ReservationStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';

interface Booking {
  id: string;
  owner_id: string;
  status: ReservationStatus;
  start_date: string;
  end_date: string;
  total_price: number | null;
  service_type: string;
  animal_type: string;
  animal_name: string | null;
  special_instructions: string | null;
  created_at: string;
  owner_name?: string;
  owner_email?: string;
}

function ReservationsContent() {
  const { user, refreshKey } = useAuth();
  const t = useTranslations('sitterDashboard');
  const tPage = useTranslations('sitterDashboard.reservationsPage');
  const locale = useLocale();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReservationStatus>('pending');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const supabase = createClient();

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('sitter_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement réservations:', error);
      } else if (data) {
        // Récupérer les noms des propriétaires
        const ownerIds = [...new Set(data.map((b: any) => b.owner_id))];
        
        if (ownerIds.length > 0) {
          const { data: owners } = await supabase
            .from('users')
            .select('id, name, email')
            .in('id', ownerIds);

          const enrichedBookings = data.map((booking: any) => ({
            ...booking,
            owner_name: owners?.find((o: any) => o.id === booking.owner_id)?.name || 'Propriétaire',
            owner_email: owners?.find((o: any) => o.id === booking.owner_id)?.email || '',
          }));

          setBookings(enrichedBookings);
        } else {
          setBookings(data);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user, refreshKey, fetchBookings]);

  const updateBookingStatus = async (bookingId: string, newStatus: 'accepted' | 'declined') => {
    setActionLoading(true);
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      // Envoyer une notification au propriétaire
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        const statusText = newStatus === 'accepted' ? 'acceptée' : 'refusée';
        await supabase.from('notifications').insert({
          user_id: booking.owner_id,
          type: newStatus === 'accepted' ? 'booking_accepted' : 'booking_declined',
          title: `Réservation ${statusText}`,
          message: `Votre demande de réservation du ${formatDate(booking.start_date)} au ${formatDate(booking.end_date)} a été ${statusText}.`,
          link: '/fr/proprietaire/reservations',
        });
      }

      setMessage({ 
        type: 'success', 
        text: newStatus === 'accepted' 
          ? '✅ Réservation acceptée avec succès !' 
          : '❌ Réservation refusée'
      });
      
      await fetchBookings();
      setSelectedBooking(null);
      
      setTimeout(() => setMessage(null), 4000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Une erreur est survenue' });
    } finally {
      setActionLoading(false);
    }
  };

  const getFilteredBookings = () => {
    return bookings.filter(b => {
      if (activeTab === 'pending') return b.status === 'pending';
      if (activeTab === 'accepted') return b.status === 'accepted';
      if (activeTab === 'completed') return b.status === 'completed';
      if (activeTab === 'declined') return b.status === 'declined' || b.status === 'cancelled';
      return false;
    });
  };

  const getTabCount = (status: ReservationStatus) => {
    if (status === 'declined') {
      return bookings.filter(b => b.status === 'declined' || b.status === 'cancelled').length;
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

  const formatShortDate = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString(locale === 'en' ? 'en-GB' : locale === 'nl' ? 'nl-BE' : 'fr-BE', {
      day: 'numeric',
      month: 'short',
      timeZone: TIMEZONE,
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-primary-light/80 text-primary border-primary/30',
      accepted: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      declined: 'bg-red-100 text-red-800 border-red-200',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[status] || 'bg-gray-100'}`}>
        {t(`status.${status}`)}
      </span>
    );
  };

  const getDaysCount = (startDate: string, endDate: string) => {
    const start = parseLocalDate(startDate);
    const end = parseLocalDate(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const tabs: { id: ReservationStatus; label: string }[] = [
    { id: 'pending', label: tPage('pending') },
    { id: 'accepted', label: tPage('accepted') },
    { id: 'completed', label: tPage('completed') },
    { id: 'declined', label: tPage('declined') },
  ];

  const filteredBookings = getFilteredBookings();

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
          <h1 className="text-3xl font-bold text-gray-900">{tPage('title')}</h1>
          <p className="text-gray-600 mt-2">{tPage('subtitle')}</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Stats rapides */}
        {bookings.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-primary-light/60 border border-primary/30 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary">{getTabCount('pending')}</p>
              <p className="text-sm text-primary">{tPage('pending')}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{getTabCount('accepted')}</p>
              <p className="text-sm text-green-600">{tPage('accepted')}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{getTabCount('completed')}</p>
              <p className="text-sm text-blue-600">{tPage('completed')}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-700">{getTabCount('declined')}</p>
              <p className="text-sm text-red-600">{tPage('declined')}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-primary-light' : 'bg-gray-100'
                  }`}>
                    {getTabCount(tab.id)}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">{tPage('noReservations')}</p>
                <p className="text-sm mt-2">{tPage('noReservationsText')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer bg-white"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-light to-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {booking.owner_name?.[0]?.toUpperCase() || 'P'}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{booking.owner_name}</h3>
                            <p className="text-sm text-gray-500">
                              Demande reçue le {new Date(booking.created_at).toLocaleDateString('fr-BE', { 
                                day: 'numeric', 
                                month: 'short',
                                timeZone: TIMEZONE 
                              })}
                            </p>
                          </div>
                          <div className="ml-auto">
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{formatShortDate(booking.start_date)} → {formatShortDate(booking.end_date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>{getDaysCount(booking.start_date, booking.end_date)} jours</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <PawPrint className="w-4 h-4 text-primary" />
                            <span>{booking.animal_name || booking.animal_type}</span>
                          </div>
                          {booking.total_price && (
                            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                              <Euro className="w-4 h-4" />
                              <span>{booking.total_price}€</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3">
                          <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
                            {booking.service_type}
                          </span>
                        </div>
                      </div>

                      {booking.status === 'pending' && (
                        <div className="flex gap-2 md:flex-col">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateBookingStatus(booking.id, 'accepted');
                            }}
                            disabled={actionLoading}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {t('accept')}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateBookingStatus(booking.id, 'declined');
                            }}
                            disabled={actionLoading}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            {t('decline')}
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

        {/* Info Card */}
        {bookings.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Comment ça marche ?
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 text-blue-600" />
                <span>Recevez des demandes de propriétaires d'animaux</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 text-blue-600" />
                <span>Acceptez ou refusez selon votre disponibilité</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 text-blue-600" />
                <span>Communiquez avec le propriétaire via la messagerie</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 text-blue-600" />
                <span>Après la garde, recevez un avis du propriétaire</span>
              </li>
            </ul>
          </div>
        )}

        {/* Modal détails */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-gradient-to-r from-primary to-primary-hover px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold text-dark">Détails de la demande</h2>
                <button 
                  onClick={() => setSelectedBooking(null)} 
                  className="text-dark/70 hover:text-dark p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Client */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-light to-primary rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {selectedBooking.owner_name?.[0]?.toUpperCase() || 'P'}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{selectedBooking.owner_name}</h3>
                    {selectedBooking.owner_email && (
                      <p className="text-gray-600 text-sm">{selectedBooking.owner_email}</p>
                    )}
                    <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                  </div>
                </div>

                {/* Dates */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Période demandée</span>
                  </div>
                  <p className="text-lg">
                    Du <strong>{formatDate(selectedBooking.start_date)}</strong>
                  </p>
                  <p className="text-lg">
                    Au <strong>{formatDate(selectedBooking.end_date)}</strong>
                  </p>
                  <p className="text-primary font-semibold mt-2">
                    {getDaysCount(selectedBooking.start_date, selectedBooking.end_date)} jours
                  </p>
                </div>

                {/* Service & Animal */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Service</p>
                    <p className="font-semibold">{selectedBooking.service_type}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Animal</p>
                    <p className="font-semibold flex items-center gap-2">
                      <PawPrint className="w-4 h-4" />
                      {selectedBooking.animal_name || selectedBooking.animal_type}
                    </p>
                    {selectedBooking.animal_name && (
                      <p className="text-sm text-gray-500">{selectedBooking.animal_type}</p>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                {selectedBooking.special_instructions && (
                  <div className="bg-primary-light/60 border border-primary/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-primary">Instructions spéciales</span>
                    </div>
                    <p className="text-gray-800">{selectedBooking.special_instructions}</p>
                  </div>
                )}

                {/* Prix */}
                {selectedBooking.total_price && (
                  <div className="bg-primary-light/50 border-2 border-primary rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">Total</span>
                      <span className="text-2xl font-bold text-primary">{selectedBooking.total_price}€</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedBooking.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'declined')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-300 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5" />
                      Refuser
                    </button>
                    <button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'accepted')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Accepter
                        </>
                      )}
                    </button>
                  </div>
                )}

                {selectedBooking.status === 'accepted' && (
                  <div className="pt-4 border-t">
                    <button
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary-hover text-dark rounded-xl font-semibold transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Contacter le propriétaire
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SitterLayout>
  );
}

export default function SitterReservationsPage() {
  return (
    <AuthGuard requiredRole="sitter">
      <SubscriptionGuard>
        <ReservationsContent />
      </SubscriptionGuard>
    </AuthGuard>
  );
}
