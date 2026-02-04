-- ============================================================
-- EuroPetSitter : Activer RLS et politiques de sécurité
-- Schéma DB : users, sitter_profiles, pets, favorites, bookings,
--            reviews, notifications, availability, conversations, messages
-- À exécuter dans Supabase : SQL Editor > New query > Coller et Run
-- ============================================================

-- 1. USERS : chaque utilisateur ne voit/modifie que son propre profil
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. SITTER_PROFILES : lecture publique des profils visibles, écriture par le propriétaire
ALTER TABLE public.sitter_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sitter_profiles_public_read" ON public.sitter_profiles;
CREATE POLICY "sitter_profiles_public_read" ON public.sitter_profiles
  FOR SELECT USING (is_visible = true OR id = auth.uid());

DROP POLICY IF EXISTS "sitter_profiles_own_all" ON public.sitter_profiles;
CREATE POLICY "sitter_profiles_own_all" ON public.sitter_profiles
  FOR ALL USING (id = auth.uid());

-- 3. PETS : le propriétaire seul gère ses animaux
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pets_owner_all" ON public.pets;
CREATE POLICY "pets_owner_all" ON public.pets
  FOR ALL USING (owner_id = auth.uid());

-- 4. FAVORITES : schéma utilise user_id (propriétaire qui met en favori)
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_user_all" ON public.favorites;
CREATE POLICY "favorites_user_all" ON public.favorites
  FOR ALL USING (user_id = auth.uid());

-- 5. BOOKINGS : propriétaire et petsitter voient leurs réservations
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings_owner_sitter" ON public.bookings;
CREATE POLICY "bookings_owner_sitter" ON public.bookings
  FOR ALL USING (owner_id = auth.uid() OR sitter_id = auth.uid());

-- 6. REVIEWS : lié à booking_id, reviewer_id, reviewee_id (pas de colonne is_visible)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select_all" ON public.reviews;
CREATE POLICY "reviews_select_all" ON public.reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "reviews_insert_reviewer" ON public.reviews;
CREATE POLICY "reviews_insert_reviewer" ON public.reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());

DROP POLICY IF EXISTS "reviews_update_reviewer" ON public.reviews;
CREATE POLICY "reviews_update_reviewer" ON public.reviews
  FOR UPDATE USING (reviewer_id = auth.uid());

DROP POLICY IF EXISTS "reviews_delete_reviewer" ON public.reviews;
CREATE POLICY "reviews_delete_reviewer" ON public.reviews
  FOR DELETE USING (reviewer_id = auth.uid());

-- 7. NOTIFICATIONS : chaque utilisateur ne voit que les siennes
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_user_all" ON public.notifications;
CREATE POLICY "notifications_user_all" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

-- 8. AVAILABILITY : lecture publique (calendrier), écriture par le petsitter
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "availability_select_public" ON public.availability;
CREATE POLICY "availability_select_public" ON public.availability
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "availability_sitter_modify" ON public.availability;
CREATE POLICY "availability_sitter_modify" ON public.availability
  FOR ALL USING (sitter_id = auth.uid());

-- 9. CONVERSATIONS : user1_id, user2_id
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations_participants" ON public.conversations;
CREATE POLICY "conversations_participants" ON public.conversations
  FOR ALL USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- 10. MESSAGES : accès si on fait partie de la conversation (user1 ou user2)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_conversation_participant" ON public.messages;
CREATE POLICY "messages_conversation_participant" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "messages_insert_sender" ON public.messages;
CREATE POLICY "messages_insert_sender" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "messages_update_read" ON public.messages;
CREATE POLICY "messages_update_read" ON public.messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );
