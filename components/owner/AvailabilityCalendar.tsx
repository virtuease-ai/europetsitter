'use client';

import { useEffect, useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isBefore, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getSitterAvailability } from '@/lib/api/availability';

const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface AvailabilityCalendarProps {
  sitterId: string;
  onDateSelect?: (startDate: Date, endDate: Date) => void;
  selectedStartDate?: Date;
  selectedEndDate?: Date;
}

export function AvailabilityCalendar({ 
  sitterId, 
  onDateSelect,
  selectedStartDate,
  selectedEndDate
}: AvailabilityCalendarProps) {
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [pendingDates, setPendingDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [tempStart, setTempStart] = useState<Date | null>(null);

  useEffect(() => {
    loadAvailability();
  }, [sitterId]);

  async function loadAvailability() {
    setLoading(true);
    try {
      const data = await getSitterAvailability(sitterId);
      setBlockedDates(data.blockedDates);
      setBookedDates(data.bookedDates);
      setPendingDates(data.pendingDates);
    } catch (error) {
      console.error('Erreur chargement disponibilités:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    const clickedDate = startOfDay(slotInfo.start);
    
    // Ne pas permettre de sélectionner des dates passées
    if (isBefore(clickedDate, startOfDay(new Date()))) {
      return;
    }

    // Ne pas permettre de sélectionner des dates bloquées ou réservées
    const dateStr = format(clickedDate, 'yyyy-MM-dd');
    if (blockedDates.includes(dateStr) || bookedDates.includes(dateStr)) {
      return;
    }

    // Logique de sélection : première date = début, deuxième date = fin
    if (!tempStart) {
      setTempStart(clickedDate);
    } else {
      const start = isBefore(clickedDate, tempStart) ? clickedDate : tempStart;
      const end = isBefore(clickedDate, tempStart) ? tempStart : clickedDate;
      
      if (onDateSelect) {
        onDateSelect(start, end);
      }
      setTempStart(null);
    }
  };

  const dayStyleGetter = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const today = startOfDay(new Date());
    const isPast = isBefore(date, today);

    let backgroundColor = '';
    let cursor = 'pointer';

    if (isPast) {
      backgroundColor = '#F3F4F6';
      cursor = 'not-allowed';
    } else if (blockedDates.includes(dateStr) || bookedDates.includes(dateStr)) {
      backgroundColor = '#FEE2E2';
      cursor = 'not-allowed';
    } else if (pendingDates.includes(dateStr)) {
      backgroundColor = '#FEF3C7';
    } else {
      backgroundColor = '#D1FAE5';
    }

    return {
      style: {
        backgroundColor,
        cursor,
      }
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Légende */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 rounded border border-green-300"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200 rounded border border-red-300"></div>
          <span>Indisponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary/30 rounded border border-primary"></div>
          <span>Demande en attente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded border border-gray-300"></div>
          <span>Passé</span>
        </div>
      </div>

      {tempStart && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm">
          Date de début sélectionnée : <strong>{format(tempStart, 'dd/MM/yyyy', { locale: fr })}</strong>
          <br />
          Cliquez sur la date de fin pour valider la période
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <style jsx global>{`
          .rbc-calendar {
            min-height: 500px;
            font-family: inherit;
          }
          .rbc-header {
            padding: 10px 3px;
            font-weight: 600;
            font-size: 0.95rem;
          }
          .rbc-off-range-bg {
            background-color: #F9FAFB;
          }
          .rbc-toolbar {
            margin-bottom: 20px;
          }
          .rbc-toolbar button {
            padding: 8px 16px;
            border-radius: 6px;
            border: 1px solid #E5E7EB;
            background: white;
            font-weight: 500;
            transition: all 0.2s;
          }
          .rbc-toolbar button:hover {
            background: #F3F4F6;
          }
          .rbc-toolbar button.rbc-active {
            background: #ffd447;
            color: #1F2937;
            border-color: #ffd447;
          }
          .rbc-month-view {
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            overflow: hidden;
          }
          .rbc-date-cell {
            padding: 5px;
          }
        `}</style>
        
        <BigCalendar
          localizer={localizer}
          events={[]}
          style={{ height: 500 }}
          culture="fr"
          views={['month']}
          defaultView="month"
          messages={{
            next: 'Suivant',
            previous: 'Précédent',
            today: "Aujourd'hui",
            month: 'Mois',
          }}
          selectable
          onSelectSlot={handleSelectSlot}
          dayPropGetter={dayStyleGetter}
        />
      </div>

      <p className="text-sm text-gray-600">
        💡 <strong>Conseil :</strong> Cliquez sur une première date disponible (en vert) pour définir le début, puis sur une deuxième date pour la fin de votre réservation.
      </p>
    </div>
  );
}
