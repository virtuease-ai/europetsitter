'use client';

import { Calendar as BigCalendar, dateFnsLocalizer, View, Event as CalendarEvent } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr, enGB, nl } from 'date-fns/locale';
import { useTranslations, useLocale } from 'next-intl';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState, useMemo } from 'react';

const locales = {
  'fr': fr,
  'en': enGB,
  'nl': nl,
};

// Fonction pour créer une date locale à partir d'une chaîne YYYY-MM-DD sans décalage de fuseau horaire
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

interface Reservation {
  id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  owner_name?: string;
}

interface BlockedDate {
  id: string;
  blocked_date: string;
  reason?: string;
}

interface CalendarProps {
  reservations: Reservation[];
  blockedDates: BlockedDate[];
  onDateClick?: (date: Date) => void;
  onUnblockDate?: (dateId: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

interface CustomEvent extends CalendarEvent {
  type: 'reservation' | 'blocked';
  status?: string;
  id: string;
  reason?: string;
}

export function Calendar({
  reservations,
  blockedDates,
  onDateClick,
  onUnblockDate,
  onEventClick
}: CalendarProps) {
  const t = useTranslations('sitterDashboard.calendarPage.calendar');
  const locale = useLocale();
  const [view, setView] = useState<View>('month');

  // Créer le localizer avec la bonne locale
  const localizer = useMemo(() => {
    const currentLocale = locales[locale as keyof typeof locales] || fr;
    return dateFnsLocalizer({
      format,
      parse,
      startOfWeek: () => startOfWeek(new Date(), { locale: currentLocale }),
      getDay,
      locales: { [locale]: currentLocale },
    });
  }, [locale]);

  // Convertir les réservations en événements calendrier (avec dates locales sans décalage)
  const reservationEvents: CustomEvent[] = reservations.map(res => ({
    id: res.id,
    title: res.status === 'pending'
      ? `🕐 ${t('pending')}${res.owner_name ? ` - ${res.owner_name}` : ''}`
      : `✓ ${t('confirmed')}${res.owner_name ? ` - ${res.owner_name}` : ''}`,
    start: parseLocalDate(res.start_date),
    end: parseLocalDate(res.end_date),
    type: 'reservation' as const,
    status: res.status,
  }));

  // Convertir les dates bloquées en événements calendrier (avec dates locales sans décalage)
  const blockedEvents: CustomEvent[] = blockedDates.map(blocked => ({
    id: blocked.id,
    title: `🚫 ${t('unavailable')}${blocked.reason ? ` - ${blocked.reason}` : ''}`,
    start: parseLocalDate(blocked.blocked_date),
    end: parseLocalDate(blocked.blocked_date),
    allDay: true,
    type: 'blocked' as const,
    reason: blocked.reason,
  }));

  const allEvents = [...reservationEvents, ...blockedEvents];

  // Style des événements selon leur type
  const eventStyleGetter = (event: CustomEvent) => {
    let backgroundColor = '#6B7280'; // gray
    
    if (event.type === 'reservation') {
      backgroundColor = event.status === 'pending' ? '#F59E0B' : '#10B981'; // orange ou green
    } else if (event.type === 'blocked') {
      backgroundColor = '#EF4444'; // red
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.85rem',
        padding: '2px 5px',
      }
    };
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (onDateClick) {
      onDateClick(slotInfo.start);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-3 md:p-6">
      <style jsx global>{`
        .rbc-calendar {
          min-height: 400px;
          font-family: inherit;
        }
        @media (min-width: 768px) {
          .rbc-calendar {
            min-height: 600px;
          }
        }
        .rbc-header {
          padding: 8px 2px;
          font-weight: 600;
          font-size: 0.75rem;
        }
        @media (min-width: 768px) {
          .rbc-header {
            padding: 10px 3px;
            font-size: 0.95rem;
          }
        }
        .rbc-today {
          background-color: #FEF3C7;
        }
        .rbc-off-range-bg {
          background-color: #F9FAFB;
        }
        .rbc-event {
          cursor: pointer;
          font-size: 0.7rem;
          padding: 1px 2px;
        }
        @media (min-width: 768px) {
          .rbc-event {
            font-size: 0.85rem;
            padding: 2px 5px;
          }
        }
        .rbc-event:hover {
          opacity: 1 !important;
        }
        .rbc-toolbar {
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }
        @media (min-width: 768px) {
          .rbc-toolbar {
            margin-bottom: 20px;
          }
        }
        .rbc-toolbar button {
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid #E5E7EB;
          background: white;
          font-weight: 500;
          font-size: 0.8rem;
          transition: all 0.2s;
        }
        @media (min-width: 768px) {
          .rbc-toolbar button {
            padding: 8px 16px;
            font-size: 0.875rem;
          }
        }
        .rbc-toolbar button:hover {
          background: #F3F4F6;
        }
        .rbc-toolbar button.rbc-active {
          background: #ffd447;
          color: #1F2937;
          border-color: #ffd447;
        }
        .rbc-toolbar-label {
          font-size: 0.9rem;
          font-weight: 600;
        }
        @media (min-width: 768px) {
          .rbc-toolbar-label {
            font-size: 1rem;
          }
        }
        .rbc-month-view {
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          overflow: hidden;
        }
        .rbc-date-cell {
          padding: 2px;
          font-size: 0.75rem;
        }
        @media (min-width: 768px) {
          .rbc-date-cell {
            padding: 5px;
            font-size: 0.875rem;
          }
        }
        .rbc-day-bg {
          cursor: pointer;
        }
        .rbc-show-more {
          font-size: 0.65rem;
        }
        @media (min-width: 768px) {
          .rbc-show-more {
            font-size: 0.75rem;
          }
        }
      `}</style>
      
      <BigCalendar
        localizer={localizer}
        events={allEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        culture={locale}
        messages={{
          next: t('next'),
          previous: t('previous'),
          today: t('today'),
          month: t('month'),
          week: t('week'),
          day: t('day'),
          agenda: t('agenda'),
          date: t('date'),
          time: t('time'),
          event: t('event'),
          noEventsInRange: t('noEvents'),
          showMore: (total: number) => `+${total}`,
        }}
        eventPropGetter={eventStyleGetter}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        view={view}
        onView={setView}
        views={['month', 'week', 'day', 'agenda']}
      />
    </div>
  );
}
