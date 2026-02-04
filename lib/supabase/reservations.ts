import { createClient } from './client';
import type { Reservation } from '@/types';

/**
 * Récupérer les réservations d'un propriétaire
 */
export async function getOwnerReservations(ownerId: string): Promise<Reservation[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      pet:pets(*),
      sitter:sitter_profiles(
        id,
        name,
        avatar,
        city,
        rating,
        reviews_count
      )
    `)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching owner reservations:', error);
    return [];
  }

  return data || [];
}

/**
 * Récupérer les réservations d'un petsitter
 */
export async function getSitterReservations(sitterId: string): Promise<Reservation[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      pet:pets(*),
      owner:users(
        id,
        name,
        email
      )
    `)
    .eq('sitter_id', sitterId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sitter reservations:', error);
    return [];
  }

  return data || [];
}

/**
 * Récupérer une réservation par son ID
 */
export async function getReservationById(reservationId: string): Promise<Reservation | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      pet:pets(*),
      sitter:sitter_profiles(*),
      owner:users(*)
    `)
    .eq('id', reservationId)
    .single();

  if (error) {
    console.error('Error fetching reservation:', error);
    return null;
  }

  return data;
}

/**
 * Créer une nouvelle réservation
 */
export async function createReservation(
  reservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at' | 'accepted_at' | 'rejected_at' | 'completed_at' | 'cancelled_at'>
): Promise<Reservation | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reservations')
    .insert([reservation])
    .select()
    .single();

  if (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }

  return data;
}

/**
 * Accepter une réservation (petsitter)
 */
export async function acceptReservation(
  reservationId: string,
  sitterResponse?: string
): Promise<Reservation | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reservations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      sitter_response: sitterResponse,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reservationId)
    .select()
    .single();

  if (error) {
    console.error('Error accepting reservation:', error);
    throw error;
  }

  return data;
}

/**
 * Refuser une réservation (petsitter)
 */
export async function rejectReservation(
  reservationId: string,
  sitterResponse?: string
): Promise<Reservation | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reservations')
    .update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      sitter_response: sitterResponse,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reservationId)
    .select()
    .single();

  if (error) {
    console.error('Error rejecting reservation:', error);
    throw error;
  }

  return data;
}

/**
 * Annuler une réservation
 */
export async function cancelReservation(
  reservationId: string,
  cancellationReason?: string
): Promise<Reservation | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reservations')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: cancellationReason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reservationId)
    .select()
    .single();

  if (error) {
    console.error('Error cancelling reservation:', error);
    throw error;
  }

  return data;
}

/**
 * Marquer une réservation comme terminée
 */
export async function completeReservation(reservationId: string): Promise<Reservation | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reservations')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', reservationId)
    .select()
    .single();

  if (error) {
    console.error('Error completing reservation:', error);
    throw error;
  }

  return data;
}

/**
 * Compter les réservations par statut
 */
export async function countReservationsByStatus(
  userId: string,
  role: 'owner' | 'sitter',
  status?: string
): Promise<number> {
  const supabase = createClient();
  let query = supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true });

  if (role === 'owner') {
    query = query.eq('owner_id', userId);
  } else {
    query = query.eq('sitter_id', userId);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error counting reservations:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Récupérer les réservations à venir
 */
export async function getUpcomingReservations(
  userId: string,
  role: 'owner' | 'sitter'
): Promise<Reservation[]> {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  let query = supabase
    .from('reservations')
    .select(`
      *,
      pet:pets(*),
      ${role === 'owner' ? 'sitter:sitter_profiles(*)' : 'owner:users(*)'}
    `)
    .eq('status', 'accepted')
    .gte('start_date', today)
    .order('start_date', { ascending: true });

  if (role === 'owner') {
    query = query.eq('owner_id', userId);
  } else {
    query = query.eq('sitter_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching upcoming reservations:', error);
    return [];
  }

  return data || [];
}
