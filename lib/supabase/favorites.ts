import { createClient } from './client';
import type { Favorite } from '@/types';

/**
 * Récupérer les favoris d'un propriétaire
 */
export async function getOwnerFavorites(ownerId: string): Promise<Favorite[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      sitter:sitter_profiles(
        id,
        name,
        avatar,
        city,
        description,
        rating,
        reviews_count,
        animals,
        services
      )
    `)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }

  return data || [];
}

/**
 * Vérifier si un petsitter est en favori
 */
export async function isFavorite(ownerId: string, sitterId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('owner_id', ownerId)
    .eq('sitter_id', sitterId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking favorite:', error);
  }

  return !!data;
}

/**
 * Ajouter un petsitter aux favoris
 */
export async function addFavorite(ownerId: string, sitterId: string): Promise<Favorite | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('favorites')
    .insert([{ owner_id: ownerId, sitter_id: sitterId }])
    .select()
    .single();

  if (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }

  return data;
}

/**
 * Retirer un petsitter des favoris
 */
export async function removeFavorite(ownerId: string, sitterId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('owner_id', ownerId)
    .eq('sitter_id', sitterId);

  if (error) {
    console.error('Error removing favorite:', error);
    return false;
  }

  return true;
}

/**
 * Basculer le statut favori (toggle)
 */
export async function toggleFavorite(ownerId: string, sitterId: string): Promise<boolean> {
  const isFav = await isFavorite(ownerId, sitterId);
  
  if (isFav) {
    return await removeFavorite(ownerId, sitterId);
  } else {
    const result = await addFavorite(ownerId, sitterId);
    return !!result;
  }
}

/**
 * Compter le nombre de favoris d'un propriétaire
 */
export async function countOwnerFavorites(ownerId: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', ownerId);

  if (error) {
    console.error('Error counting favorites:', error);
    return 0;
  }

  return count || 0;
}
