// ============================================
// USER & PROFILES
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'sitter';
  created_at: string;
  trial_end_date?: string;
  subscription_status?: 'trial' | 'active' | 'expired';
  subscription_end_date?: string;
}

export interface SitterProfile {
  id: string;
  name: string;
  avatar?: string;
  photos?: string[];
  address?: string;
  city?: string;
  coordinates?: {
    x: number;
    y: number;
  };
  description?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  business_type?: 'individual' | 'independent' | 'company';
  tva_number?: string;
  siret_number?: string;
  animals?: string[];
  services?: Service[];
  housing_type?: string;
  children_presence?: string;
  walking_places?: string[];
  skills?: string[];
  years_experience?: string;
  profile_completed: boolean;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  rating?: number;
  reviews_count?: number;
}

export interface OwnerProfile {
  id: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  bio?: string;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// PETS
// ============================================

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  type: PetType;
  breed?: string;
  age?: number;
  weight?: number;
  gender?: 'male' | 'female';
  bio?: string;
  health_info?: string;
  special_needs?: string;
  vaccinations_up_to_date: boolean;
  sterilized: boolean;
  photo?: string;
  created_at: string;
  updated_at: string;
}

export type PetType = 
  | 'chien' 
  | 'chat' 
  | 'lapin' 
  | 'oiseau' 
  | 'rongeur' 
  | 'reptile' 
  | 'poisson' 
  | 'nac';

// ============================================
// RESERVATIONS
// ============================================

export interface Reservation {
  id: string;
  owner_id: string;
  sitter_id: string;
  pet_id: string;
  start_date: string;
  end_date: string;
  service_type: ServiceType;
  price_per_day: number;
  total_price: number;
  status: ReservationStatus;
  owner_message?: string;
  sitter_response?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  accepted_at?: string;
  rejected_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  // Relations
  pet?: Pet;
  sitter?: SitterProfile;
  owner?: User;
}

export type ReservationStatus = 
  | 'pending' 
  | 'accepted' 
  | 'rejected' 
  | 'completed' 
  | 'cancelled';

// ============================================
// REVIEWS
// ============================================

export interface Review {
  id: string;
  reservation_id: string;
  reviewer_id: string;
  reviewee_id: string;
  reviewer_role: 'owner' | 'sitter';
  rating: number;
  comment?: string;
  criteria?: Record<string, number>;
  photos?: string[];
  response?: string;
  response_date?: string;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  reservation?: Reservation;
  reviewer?: User;
  reviewee?: User;
}

// ============================================
// FAVORITES
// ============================================

export interface Favorite {
  id: string;
  owner_id: string;
  sitter_id: string;
  created_at: string;
  // Relations
  sitter?: SitterProfile;
}

// ============================================
// NOTIFICATIONS
// ============================================

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  related_id?: string;
  related_type?: string;
  read: boolean;
  read_at?: string;
  created_at: string;
}

export type NotificationType =
  | 'new_reservation'
  | 'reservation_accepted'
  | 'reservation_rejected'
  | 'reservation_completed'
  | 'reservation_cancelled'
  | 'new_review'
  | 'review_response'
  | 'new_message'
  | 'trial_ending'
  | 'subscription_expired';

// ============================================
// CALENDAR & AVAILABILITY
// ============================================

export interface SitterUnavailability {
  id: string;
  sitter_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
  created_at: string;
}

// ============================================
// SUBSCRIPTIONS & PAYMENTS
// ============================================

export interface Subscription {
  id: string;
  sitter_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_payment_intent_id?: string;
  plan: 'trial' | 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  start_date: string;
  end_date: string;
  trial_end_date?: string;
  amount?: number;
  currency: string;
  auto_renew: boolean;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: string;
  sitter_id: string;
  subscription_id?: string;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  payment_method?: string;
  description?: string;
  invoice_url?: string;
  created_at: string;
}

// ============================================
// MESSAGING (Optional)
// ============================================

export interface Conversation {
  id: string;
  owner_id: string;
  sitter_id: string;
  reservation_id?: string;
  status: 'active' | 'archived';
  last_message_at: string;
  last_message_preview?: string;
  created_at: string;
  // Relations
  owner?: User;
  sitter?: SitterProfile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachments?: string[];
  read: boolean;
  read_at?: string;
  created_at: string;
  // Relations
  sender?: User;
}

// ============================================
// SERVICES & ANIMALS
// ============================================

export interface Service {
  id: string;
  name: string;
  enabled: boolean;
  price_per_day?: number;
  price_per_week?: number;
  description?: string;
  options?: ServiceOption[];
}

export interface ServiceOption {
  id: string;
  label: string;
  selected: boolean;
}

export type AnimalType = 
  | 'petit-chien'
  | 'moyen-chien'
  | 'grand-chien'
  | 'chien-attaque'
  | 'chien-garde'
  | 'chat'
  | 'lapin'
  | 'petit-rongeur'
  | 'oiseau'
  | 'volaille'
  | 'nac';

export type ServiceType =
  | 'hebergement'
  | 'garde_jour'
  | 'visite_domicile'
  | 'promenade';

// ============================================
// DASHBOARD STATS
// ============================================

export interface OwnerStats {
  owner_id: string;
  total_pets: number;
  total_reservations: number;
  completed_reservations: number;
  total_favorites: number;
  total_spent: number;
}

export interface SitterStats {
  sitter_id: string;
  total_reservations: number;
  completed_reservations: number;
  total_reviews: number;
  average_rating: number;
  total_earned: number;
}
