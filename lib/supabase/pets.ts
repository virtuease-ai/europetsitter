import { createClient } from './client';
import type { Pet } from '@/types';

/**
 * Récupérer tous les animaux d'un propriétaire
 */
export async function getOwnerPets(ownerId: string): Promise<Pet[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pets:', error);
    return [];
  }

  return data || [];
}

/**
 * Récupérer un animal par son ID
 */
export async function getPetById(petId: string): Promise<Pet | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', petId)
    .single();

  if (error) {
    console.error('Error fetching pet:', error);
    return null;
  }

  return data;
}

/**
 * Créer un nouvel animal
 */
export async function createPet(pet: Omit<Pet, 'id' | 'created_at' | 'updated_at'>): Promise<Pet | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('pets')
    .insert([pet])
    .select()
    .single();

  if (error) {
    console.error('Error creating pet:', error);
    throw error;
  }

  return data;
}

/**
 * Mettre à jour un animal
 */
export async function updatePet(petId: string, updates: Partial<Pet>): Promise<Pet | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('pets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', petId)
    .select()
    .single();

  if (error) {
    console.error('Error updating pet:', error);
    throw error;
  }

  return data;
}

/**
 * Supprimer un animal
 */
export async function deletePet(petId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', petId);

  if (error) {
    console.error('Error deleting pet:', error);
    return false;
  }

  return true;
}

/**
 * Compter le nombre d'animaux d'un propriétaire
 */
export async function countOwnerPets(ownerId: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from('pets')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', ownerId);

  if (error) {
    console.error('Error counting pets:', error);
    return 0;
  }

  return count || 0;
}
