import { createClient } from './client';
import type { Notification, NotificationType } from '@/types';

/**
 * Récupérer les notifications d'un utilisateur
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 20
): Promise<Notification[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data || [];
}

/**
 * Récupérer les notifications non lues
 */
export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('read', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching unread notifications:', error);
    return [];
  }

  return data || [];
}

/**
 * Compter les notifications non lues
 */
export async function countUnreadNotifications(userId: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error counting unread notifications:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Marquer une notification comme lue
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('notifications')
    .update({
      read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }

  return true;
}

/**
 * Marquer toutes les notifications comme lues
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('notifications')
    .update({
      read: true,
      read_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }

  return true;
}

/**
 * Créer une notification
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  options?: {
    link?: string;
    related_id?: string;
    related_type?: string;
  }
): Promise<Notification | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notifications')
    .insert([
      {
        user_id: userId,
        type,
        title,
        message,
        link: options?.link,
        related_id: options?.related_id,
        related_type: options?.related_type,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    throw error;
  }

  return data;
}

/**
 * Supprimer une notification
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Error deleting notification:', error);
    return false;
  }

  return true;
}

/**
 * Supprimer toutes les notifications lues
 */
export async function deleteReadNotifications(userId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId)
    .eq('read', true);

  if (error) {
    console.error('Error deleting read notifications:', error);
    return false;
  }

  return true;
}
