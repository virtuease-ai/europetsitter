import { createClient } from './client';
import type { Review } from '@/types';

/**
 * Récupérer les avis d'un petsitter
 */
export async function getSitterReviews(sitterId: string): Promise<Review[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reservation:reservations(
        id,
        service_type,
        start_date,
        end_date
      ),
      reviewer:users(
        id,
        name
      )
    `)
    .eq('reviewee_id', sitterId)
    .eq('reviewer_role', 'owner')
    .eq('is_visible', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sitter reviews:', error);
    return [];
  }

  return data || [];
}

/**
 * Récupérer les avis laissés par un utilisateur
 */
export async function getUserReviews(userId: string): Promise<Review[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reservation:reservations(*),
      reviewee:users(
        id,
        name
      )
    `)
    .eq('reviewer_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user reviews:', error);
    return [];
  }

  return data || [];
}

/**
 * Vérifier si une réservation a déjà un avis
 */
export async function hasReview(reservationId: string, reviewerId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('id')
    .eq('reservation_id', reservationId)
    .eq('reviewer_id', reviewerId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking review:', error);
  }

  return !!data;
}

/**
 * Créer un avis
 */
export async function createReview(
  review: Omit<Review, 'id' | 'created_at' | 'updated_at'>
): Promise<Review | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    throw error;
  }

  return data;
}

/**
 * Répondre à un avis (reviewee)
 */
export async function respondToReview(
  reviewId: string,
  response: string
): Promise<Review | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reviews')
    .update({
      response,
      response_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) {
    console.error('Error responding to review:', error);
    throw error;
  }

  return data;
}

/**
 * Calculer la note moyenne d'un petsitter
 */
export async function getSitterAverageRating(sitterId: string): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('reviewee_id', sitterId)
    .eq('reviewer_role', 'owner')
    .eq('is_visible', true);

  if (error || !data || data.length === 0) {
    return 0;
  }

  const sum = data.reduce((acc: number, review: any) => acc + review.rating, 0);
  return Math.round((sum / data.length) * 10) / 10;
}

/**
 * Compter le nombre d'avis d'un petsitter
 */
export async function countSitterReviews(sitterId: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('reviewee_id', sitterId)
    .eq('reviewer_role', 'owner')
    .eq('is_visible', true);

  if (error) {
    console.error('Error counting reviews:', error);
    return 0;
  }

  return count || 0;
}
