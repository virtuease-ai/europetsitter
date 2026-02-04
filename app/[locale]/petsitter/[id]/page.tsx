'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star,
  MapPin,
  Calendar,
  CheckCircle,
  MessageCircle,
  Home,
  Dog,
  Heart,
  Clock,
  Shield,
  Award,
  ChevronLeft,
  Users,
  Sparkles,
} from 'lucide-react';

// Lazy load the BookingWizard modal (only shown on user interaction)
const BookingWizard = dynamic(
  () => import('@/components/booking/BookingWizard').then(mod => mod.BookingWizard),
  { ssr: false }
);

interface SitterProfile {
  id: string;
  name: string;
  avatar: string | null;
  photos: string[] | null;
  city: string | null;
  address: string | null;
  description: string | null;
  phone: string | null;
  housing_type: string | null;
  children_presence: string | null;
  years_experience: string | null;
  animals: string[] | null;
  services: any;
  average_rating: number;
  total_reviews: number;
  is_verified: boolean;
  daily_rate: number | null;
  hourly_rate: number | null;
  skills: string[] | null;
  walking_places: string[] | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string;
}

export default function SitterProfilePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [sitter, setSitter] = useState<SitterProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookingWizardOpen, setIsBookingWizardOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sitterId, setSitterId] = useState<string>('');

  const supabase = createClient();

  const fetchSitterData = useCallback(async (id: string) => {
    setLoading(true);

    try {
      const { data: sitterData, error: sitterError } = await supabase
        .from('sitter_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (sitterError || !sitterData) {
        console.error('Erreur:', sitterError);
        setLoading(false);
        return;
      }

      setSitter(sitterData);

      // Récupérer les avis
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, reviewer_id')
        .eq('reviewee_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (reviewsData && reviewsData.length > 0) {
        const reviewerIds = reviewsData.map((r: any) => r.reviewer_id);
        const { data: users } = await supabase
          .from('users')
          .select('id, name')
          .in('id', reviewerIds);

        const enrichedReviews = reviewsData.map((review: any) => ({
          ...review,
          reviewer_name: users?.find((u: any) => u.id === review.reviewer_id)?.name || 'Utilisateur',
        }));

        setReviews(enrichedReviews);
      }

      // Vérifier si c'est un favori
      if (user) {
        const { data: favData } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('sitter_id', id)
          .single();

        setIsFavorite(!!favData);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    params.then(({ id }) => {
      setSitterId(id);
      fetchSitterData(id);
    });
  }, [params, fetchSitterData]);

  const toggleFavorite = async () => {
    if (!user) {
      router.push('/fr/connexion');
      return;
    }

    try {
      if (isFavorite) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('sitter_id', sitterId);
        setIsFavorite(false);
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, sitter_id: sitterId });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Erreur favoris:', error);
    }
  };

  const handleBookingSuccess = () => {
    setMessage({ type: 'success', text: '🎉 Demande envoyée avec succès ! Le petsitter va examiner votre demande.' });
    setTimeout(() => setMessage(null), 5000);
  };

  const getServicesList = () => {
    if (!sitter?.services?.services) return [];
    return Object.entries(sitter.services.services)
      .filter(([_, val]: [string, any]) => val?.active)
      .map(([key, val]: [string, any]) => ({
        name: key,
        price: val?.price || '0',
        priceWeek: val?.priceWeek,
      }));
  };

  const getHousingLabel = (type: string | null) => {
    if (!type) return null;
    const labels: Record<string, string> = {
      'apartment': 'Appartement',
      'house': 'Maison',
      'house_garden': 'Maison avec jardin',
      'farm': 'Ferme',
    };
    return labels[type] || type;
  };

  const getChildrenLabel = (presence: string | null) => {
    if (!presence) return null;
    const labels: Record<string, string> = {
      'none': 'Pas d\'enfants',
      'older': 'Enfants de plus de 10 ans',
      'young': 'Jeunes enfants',
    };
    return labels[presence] || presence;
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!sitter) {
    return (
      <div className="min-h-screen py-12 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-4">Petsitter non trouvé</h1>
          <Link href="/fr/recherche" className="text-primary hover:underline">
            Retour à la recherche
          </Link>
        </div>
      </div>
    );
  }

  const services = getServicesList();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Message de succès */}
      {message && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`px-6 py-4 rounded-xl shadow-lg ${
            message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {message.text}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative">
        <div className="h-64 md:h-80 bg-gradient-to-br from-primary via-primary-light to-primary/60">
          {/* Photos en arrière-plan si disponibles */}
          {sitter.photos && sitter.photos.length > 0 && (
            <div className="absolute inset-0 opacity-20">
              <Image src={sitter.photos[0]} alt="" fill className="object-cover" priority={false} />
            </div>
          )}
        </div>

        <div className="container mx-auto max-w-6xl px-4">
          <div className="relative -mt-24 md:-mt-32">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-6xl shadow-lg border-4 border-white mx-auto md:mx-0 relative overflow-hidden">
                    {sitter.avatar ? (
                      <Image src={sitter.avatar} alt={sitter.name} fill className="object-cover rounded-xl" sizes="(max-width: 768px) 128px, 160px" priority />
                    ) : (
                      '👤'
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{sitter.name}</h1>
                      
                      {sitter.city && (
                        <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2 mb-4">
                          <MapPin className="w-5 h-5 text-primary" />
                          {sitter.city}
                        </p>
                      )}

                      {/* Badges */}
                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        {/* Rating */}
                        <div className="flex items-center gap-1.5 bg-primary-light/50 px-3 py-1.5 rounded-full">
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          <span className="font-bold">{sitter.average_rating?.toFixed(1) || '5.0'}</span>
                          <span className="text-gray-600 text-sm">({sitter.total_reviews || 0} avis)</span>
                        </div>

                        {sitter.is_verified && (
                          <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            Vérifié
                          </span>
                        )}

                        {sitter.years_experience && (
                          <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            {sitter.years_experience}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bouton favori - visible uniquement pour les non-petsitters */}
                    {(!user || user.role !== 'sitter') && (
                      <button
                        onClick={toggleFavorite}
                        className={`p-3 rounded-full border-2 transition-all self-center ${
                          isFavorite
                            ? 'bg-red-50 border-red-200 text-red-500'
                            : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400'
                        }`}
                      >
                        <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* À propos */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                À propos de moi
              </h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">
                {sitter.description || "Je suis passionné(e) par les animaux et je serai ravi(e) de prendre soin de vos compagnons !"}
              </p>
            </div>

            {/* Informations détaillées */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6">Mon environnement</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {sitter.housing_type && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="p-3 bg-primary-light rounded-xl">
                      <Home className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Logement</p>
                      <p className="text-gray-600">{getHousingLabel(sitter.housing_type)}</p>
                    </div>
                  </div>
                )}

                {sitter.children_presence && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="p-3 bg-primary-light rounded-xl">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Enfants</p>
                      <p className="text-gray-600">{getChildrenLabel(sitter.children_presence)}</p>
                    </div>
                  </div>
                )}

                {sitter.years_experience && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="p-3 bg-primary-light rounded-xl">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Expérience</p>
                      <p className="text-gray-600">{sitter.years_experience}</p>
                    </div>
                  </div>
                )}

                {sitter.animals && sitter.animals.length > 0 && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl sm:col-span-2">
                    <div className="p-3 bg-primary-light rounded-xl">
                      <Dog className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-2">Animaux acceptés</p>
                      <div className="flex flex-wrap gap-2">
                        {sitter.animals.map((animal, idx) => (
                          <span key={idx} className="bg-white px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200">
                            {animal}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Compétences */}
              {sitter.skills && sitter.skills.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <p className="font-semibold text-gray-900 mb-3">Compétences</p>
                  <div className="flex flex-wrap gap-2">
                    {sitter.skills.map((skill, idx) => (
                      <span key={idx} className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Avis */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-primary" />
                Avis ({sitter.total_reviews || 0})
              </h2>

              {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Aucun avis pour le moment</p>
                  <p className="text-sm mt-1">Soyez le premier à laisser un avis !</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-light to-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {review.reviewer_name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold">{review.reviewer_name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Brussels' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className={`w-5 h-5 ${i <= review.rating ? 'fill-primary text-primary' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      {review.comment && <p className="text-gray-700 leading-relaxed">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Card de réservation */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Services & Tarifs</h3>

              {services.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {services.map((service) => (
                    <div key={service.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-700 font-medium">{service.name}</span>
                      <span className="font-bold text-primary">{service.price}€/jour</span>
                    </div>
                  ))}
                </div>
              ) : sitter.daily_rate ? (
                <div className="mb-6 p-4 bg-primary-light/30 rounded-xl text-center">
                  <p className="text-sm text-gray-600">À partir de</p>
                  <p className="text-3xl font-bold text-primary">{sitter.daily_rate}€<span className="text-lg">/jour</span></p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-6">Tarifs sur demande</p>
              )}

              {user && user.role === 'owner' ? (
                <>
                  <button
                    onClick={() => setIsBookingWizardOpen(true)}
                    className="w-full bg-primary hover:bg-primary-hover text-dark font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mb-3 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02]"
                  >
                    <Calendar className="w-5 h-5" />
                    Demander une réservation
                  </button>
                  <button className="w-full border-2 border-gray-200 hover:border-primary text-gray-700 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Envoyer un message
                  </button>
                </>
              ) : user ? (
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">
                    Seuls les propriétaires d'animaux peuvent faire une réservation
                  </p>
                </div>
              ) : (
                <>
                  <Link href="/fr/connexion">
                    <button className="w-full bg-primary hover:bg-primary-hover text-dark font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mb-3">
                      Connectez-vous pour réserver
                    </button>
                  </Link>
                  <p className="text-xs text-gray-500 text-center">
                    Vous devez être connecté pour contacter un petsitter
                  </p>
                </>
              )}
            </div>

            {/* Photos */}
            {sitter.photos && sitter.photos.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">Photos</h3>
                <div className="grid grid-cols-2 gap-2">
                  {sitter.photos.slice(0, 4).map((photo, idx) => (
                    <div key={idx} className="relative h-24 rounded-xl overflow-hidden hover:opacity-90 transition-opacity cursor-pointer">
                      <Image
                        src={photo}
                        alt={`Photo ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 150px"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lieux de promenade */}
            {sitter.walking_places && sitter.walking_places.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-3">Lieux de promenade</h3>
                <div className="flex flex-wrap gap-2">
                  {sitter.walking_places.map((place, idx) => (
                    <span key={idx} className="bg-gray-100 px-3 py-1.5 rounded-full text-sm">
                      {place}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bouton retour */}
        <div className="mt-8">
          <Link href="/fr/recherche" className="text-primary hover:underline flex items-center gap-2 font-medium">
            <ChevronLeft className="w-5 h-5" />
            Retour à la recherche
          </Link>
        </div>
      </div>

      {/* Booking Wizard Modal - only mount when open for performance */}
      {isBookingWizardOpen && sitter && (
        <BookingWizard
          isOpen={isBookingWizardOpen}
          onClose={() => setIsBookingWizardOpen(false)}
          sitter={{
            id: sitter.id,
            name: sitter.name,
            avatar: sitter.avatar,
            city: sitter.city,
            services: sitter.services,
            daily_rate: sitter.daily_rate,
          }}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
