'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { SitterLayout } from '@/components/layout/SitterLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SubscriptionGuard } from '@/components/auth/SubscriptionGuard';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import type { Event as CalendarEvent } from 'react-big-calendar';

// Lazy load the heavy Calendar component (react-big-calendar ~100KB)
const Calendar = dynamic(
  () => import('@/components/sitter/Calendar').then(mod => mod.Calendar),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-lg shadow p-6 min-h-[500px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    ),
  }
);

// Lazy load the modal (only shown on user interaction)
const BlockDatesModal = dynamic(
  () => import('@/components/sitter/BlockDatesModal').then(mod => mod.BlockDatesModal),
  { ssr: false }
);

interface Reservation {
  id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  owner_name?: string;
  animal_name?: string;
  animal_type?: string;
}

interface BlockedDate {
  id: string;
  blocked_date: string;
  reason?: string;
}

interface CustomEvent extends CalendarEvent {
  type: 'reservation' | 'blocked';
  id: string;
  reason?: string;
}

function CalendarContent() {
  const { user, refreshKey } = useAuth();
  const t = useTranslations('sitterDashboard.calendarPage');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CustomEvent | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const supabase = createClient();

  const fetchCalendarData = useCallback(async () => {
    if (!user) return;
    
    setLoadingData(true);
    
    try {
      // Récupérer les réservations (requête simplifiée)
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, start_date, end_date, status, animal_name, animal_type')
        .eq('sitter_id', user.id)
        .in('status', ['pending', 'accepted']);

      if (bookingsError) {
        console.error('Erreur bookings:', bookingsError);
      } else if (bookingsData) {
        const formatted = bookingsData.map((booking: any) => ({
          id: booking.id,
          start_date: booking.start_date,
          end_date: booking.end_date,
          status: booking.status as Reservation['status'],
          animal_name: booking.animal_name,
          animal_type: booking.animal_type,
        }));
        setReservations(formatted);
      }

      // Récupérer les dates indisponibles depuis la table availability
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('availability')
        .select('id, date')
        .eq('sitter_id', user.id)
        .eq('is_available', false);

      if (availabilityError) {
        console.error('Erreur availability:', availabilityError);
      } else if (availabilityData) {
        // Transformer en format BlockedDate
        const blocked = availabilityData.map((item: any) => ({
          id: item.id,
          blocked_date: item.date,
          reason: 'Indisponible',
        }));
        setBlockedDates(blocked);
      }
    } catch (error) {
      console.error('Erreur chargement calendrier:', error);
    } finally {
      setLoadingData(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) {
      fetchCalendarData();
    }
  }, [user, refreshKey, fetchCalendarData]);

  const handleBlockDates = async (dates: string[], reason: string) => {
    if (!user) return;

    // Insérer dans la table availability avec is_available = false
    const inserts = dates.map(date => ({
      sitter_id: user.id,
      date: date,
      is_available: false,
    }));

    const { error } = await supabase
      .from('availability')
      .upsert(inserts, { onConflict: 'sitter_id,date' });

    if (error) {
      console.error('Erreur blocage dates:', error);
      throw new Error('Impossible de bloquer ces dates');
    }

    await fetchCalendarData();
    setIsBlockModalOpen(false);
  };

  const handleUnblockDate = async () => {
    if (!selectedEvent || selectedEvent.type !== 'blocked') return;

    // Supprimer ou remettre is_available = true
    const { error } = await supabase
      .from('availability')
      .delete()
      .eq('id', selectedEvent.id);

    if (!error) {
      await fetchCalendarData();
      setSelectedEvent(null);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event as CustomEvent);
  };

  if (loadingData) {
    return (
      <SitterLayout>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </SitterLayout>
    );
  }

  return (
    <SitterLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-600 mt-2">{t('subtitle')}</p>
          </div>
          <button
            onClick={() => setIsBlockModalOpen(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <CalendarIcon className="w-5 h-5" />
            {t('blockDates')}
          </button>
        </div>

        {/* Légende */}
        <div className="mb-6 flex flex-wrap gap-6 text-sm bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="font-medium">{t('confirmedBooking')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="font-medium">{t('pendingRequest')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="font-medium">{t('blockedDate')}</span>
          </div>
        </div>

        {/* Calendrier */}
        <Calendar
          reservations={reservations}
          blockedDates={blockedDates}
          onEventClick={handleEventClick}
        />

        {/* Modal blocage dates */}
        <BlockDatesModal
          isOpen={isBlockModalOpen}
          onClose={() => setIsBlockModalOpen(false)}
          onConfirm={handleBlockDates}
        />

        {/* Modal détails événement */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-xl font-bold mb-4">
                {selectedEvent.type === 'blocked' ? `🚫 ${t('blockedDate')}` : `📅 ${t('confirmedBooking')}`}
              </h3>

              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-sm text-gray-600">{t('eventDetails')}</p>
                  <p className="font-medium">{selectedEvent.title}</p>
                </div>

                {selectedEvent.reason && (
                  <div>
                    <p className="text-sm text-gray-600">{t('reason')}</p>
                    <p className="font-medium">{selectedEvent.reason}</p>
                  </div>
                )}
              </div>

              {selectedEvent.type === 'blocked' && (
                <button
                  onClick={handleUnblockDate}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  {t('unblockDate')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </SitterLayout>
  );
}

export default function SitterCalendarPage() {
  return (
    <AuthGuard requiredRole="sitter">
      <SubscriptionGuard>
        <CalendarContent />
      </SubscriptionGuard>
    </AuthGuard>
  );
}
