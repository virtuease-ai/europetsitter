import { createClient } from '@/lib/supabase/client';

export interface AvailabilityData {
  blockedDates: string[]; // Dates bloquées par le petsitter
  bookedDates: string[]; // Dates déjà réservées (acceptées)
  pendingDates: string[]; // Dates avec demandes en attente
}

/**
 * Récupère les disponibilités d'un petsitter pour affichage dans le calendrier de réservation
 * @param sitterId - ID du petsitter
 * @param startDate - Date de début (optionnel)
 * @param endDate - Date de fin (optionnel)
 * @returns Objet contenant les dates bloquées, réservées et en attente
 */
export async function getSitterAvailability(
  sitterId: string,
  startDate?: string,
  endDate?: string
): Promise<AvailabilityData> {
  const supabase = createClient();

  // Par défaut : récupérer les 3 prochains mois
  const defaultStart = startDate || new Date().toISOString().split('T')[0];
  const defaultEnd = endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    // Récupérer les dates bloquées
    const { data: blockedData } = await supabase
      .from('blocked_dates')
      .select('blocked_date')
      .eq('sitter_id', sitterId)
      .gte('blocked_date', defaultStart)
      .lte('blocked_date', defaultEnd);

    // Récupérer les réservations (acceptées et en attente)
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('start_date, end_date, status')
      .eq('sitter_id', sitterId)
      .in('status', ['accepted', 'pending'])
      .gte('end_date', defaultStart)
      .lte('start_date', defaultEnd);

    // Formatter les dates bloquées
    const blockedDates = blockedData?.map((d: any) => d.blocked_date) || [];

    // Générer toutes les dates des réservations acceptées
    const bookedDates: string[] = [];
    const pendingDates: string[] = [];

    bookingsData?.forEach((booking: any) => {
      const dates = generateDateRange(booking.start_date, booking.end_date);
      if (booking.status === 'accepted') {
        bookedDates.push(...dates);
      } else {
        pendingDates.push(...dates);
      }
    });

    return {
      blockedDates,
      bookedDates,
      pendingDates,
    };
  } catch (error) {
    console.error('Erreur récupération disponibilités:', error);
    return {
      blockedDates: [],
      bookedDates: [],
      pendingDates: [],
    };
  }
}

/**
 * Génère un tableau de dates entre deux dates (incluses)
 */
function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  let currentDate = new Date(start);
  while (currentDate <= end) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

/**
 * Vérifie si une période est disponible pour un petsitter
 * @param sitterId - ID du petsitter
 * @param startDate - Date de début (format YYYY-MM-DD)
 * @param endDate - Date de fin (format YYYY-MM-DD)
 * @returns true si disponible, false sinon
 */
export async function checkAvailability(
  sitterId: string,
  startDate: string,
  endDate: string
): Promise<{ available: boolean; reason?: string }> {
  const availability = await getSitterAvailability(sitterId, startDate, endDate);
  
  const requestedDates = generateDateRange(startDate, endDate);

  // Vérifier si une des dates demandées est bloquée
  const hasBlockedDate = requestedDates.some(date => 
    availability.blockedDates.includes(date)
  );

  if (hasBlockedDate) {
    return { 
      available: false, 
      reason: 'Le petsitter a bloqué une ou plusieurs dates de cette période' 
    };
  }

  // Vérifier si une des dates est déjà réservée
  const hasBookedDate = requestedDates.some(date => 
    availability.bookedDates.includes(date)
  );

  if (hasBookedDate) {
    return { 
      available: false, 
      reason: 'Le petsitter a déjà une réservation confirmée sur cette période' 
    };
  }

  return { available: true };
}
