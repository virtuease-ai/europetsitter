'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
  Home,
  Dog,
  Clock,
  MapPin,
  Send,
  AlertCircle,
  PawPrint,
} from 'lucide-react';

// Fuseau horaire de Bruxelles
const TIMEZONE = 'Europe/Brussels';

// Fonction pour obtenir la date actuelle dans le fuseau horaire de Bruxelles
const getTodayInBrussels = (): Date => {
  const now = new Date();
  const brusselsDate = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }));
  brusselsDate.setHours(0, 0, 0, 0);
  return brusselsDate;
};

// Fonction pour formater une date en YYYY-MM-DD dans le fuseau horaire de Bruxelles
const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Créer une date à partir d'une chaîne YYYY-MM-DD (sans décalage de fuseau horaire)
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

interface SitterProfile {
  id: string;
  name: string;
  avatar: string | null;
  city: string | null;
  services: any;
  daily_rate: number | null;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
}

interface BookingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  sitter: SitterProfile;
  onSuccess: () => void;
}

interface ServiceOption {
  id: string;
  name: string;
  description: string;
  price: string;
  priceWeek?: string;
  icon: any;
}

const STEPS = [
  { id: 1, title: 'Service', icon: Home },
  { id: 2, title: 'Dates', icon: Calendar },
  { id: 3, title: 'Animaux', icon: PawPrint },
  { id: 4, title: 'Validation', icon: Check },
];

const SERVICE_ICONS: Record<string, any> = {
  'Hébergement': Home,
  'Garde de jour': Clock,
  'Visite à domicile': MapPin,
  'Promenade': Dog,
};

export function BookingWizard({ isOpen, onClose, sitter, onSuccess }: BookingWizardProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Données du formulaire
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedPets, setSelectedPets] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Données chargées
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Charger les données au montage
  useEffect(() => {
    if (isOpen && user) {
      loadData();
    }
  }, [isOpen, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les animaux de l'utilisateur
      const { data: petsData } = await supabase
        .from('pets')
        .select('id, name, species, breed')
        .eq('owner_id', user!.id);
      setPets(petsData || []);

      // Extraire les services du sitter
      const sitterServices: ServiceOption[] = [];
      if (sitter.services?.services) {
        Object.entries(sitter.services.services).forEach(([key, val]: [string, any]) => {
          if (val?.active) {
            sitterServices.push({
              id: key,
              name: key,
              description: getServiceDescription(key),
              price: val.price || '0',
              priceWeek: val.priceWeek,
              icon: SERVICE_ICONS[key] || Home,
            });
          }
        });
      }

      // Si aucun service défini, ajouter des services par défaut
      if (sitterServices.length === 0) {
        sitterServices.push(
          { id: 'hebergement', name: 'Hébergement', description: 'Garde à domicile du petsitter', price: sitter.daily_rate?.toString() || '25', icon: Home },
          { id: 'garde-jour', name: 'Garde de jour', description: 'Garde pendant la journée', price: '20', icon: Clock },
          { id: 'visite', name: 'Visite à domicile', description: 'Visite chez vous', price: '15', icon: MapPin },
        );
      }
      setServices(sitterServices);

      // Charger les dates indisponibles
      await loadUnavailableDates();
    } catch (err) {
      console.error('Erreur chargement données:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUnavailableDates = async () => {
    try {
      // Dates bloquées par le sitter
      const { data: blocked } = await supabase
        .from('availability')
        .select('date')
        .eq('sitter_id', sitter.id)
        .eq('is_available', false);

      // Réservations existantes
      const { data: bookings } = await supabase
        .from('bookings')
        .select('start_date, end_date')
        .eq('sitter_id', sitter.id)
        .in('status', ['pending', 'accepted']);

      const unavailable: string[] = [];

      // Ajouter les dates bloquées
      blocked?.forEach((b: any) => unavailable.push(b.date));

      // Ajouter les dates des réservations (en utilisant des dates locales)
      bookings?.forEach((booking: any) => {
        const start = parseLocalDate(booking.start_date);
        const end = parseLocalDate(booking.end_date);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          unavailable.push(formatDateToYYYYMMDD(d));
        }
      });

      setUnavailableDates(unavailable);
    } catch (err) {
      console.error('Erreur chargement disponibilités:', err);
    }
  };

  const getServiceDescription = (name: string): string => {
    const descriptions: Record<string, string> = {
      'Hébergement': 'Votre animal séjourne chez le petsitter',
      'Garde de jour': 'Garde pendant la journée uniquement',
      'Visite à domicile': 'Le petsitter vient chez vous',
      'Promenade': 'Promenade et exercice pour votre animal',
    };
    return descriptions[name] || 'Service de garde pour votre animal';
  };

  const getSpeciesLabel = (species: string): string => {
    const labels: Record<string, string> = {
      dog: 'Chien', cat: 'Chat', bird: 'Oiseau', rabbit: 'Lapin',
      hamster: 'Hamster', fish: 'Poisson', reptile: 'Reptile', other: 'Autre',
    };
    return labels[species] || species;
  };

  // Navigation
  const canGoNext = (): boolean => {
    switch (currentStep) {
      case 1: return selectedService !== null;
      case 2: return startDate !== null && endDate !== null;
      case 3: return selectedPets.length > 0;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (canGoNext() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedService || !startDate || !endDate || selectedPets.length === 0) {
      setError('Veuillez compléter toutes les étapes');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const selectedPetData = pets.filter(p => selectedPets.includes(p.id));
      const petNames = selectedPetData.map(p => p.name).join(', ');
      const petTypes = [...new Set(selectedPetData.map(p => getSpeciesLabel(p.species)))].join(', ');

      // Calculer le nombre de jours
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const totalPrice = days * parseFloat(selectedService.price);

      const { error: insertError } = await supabase.from('bookings').insert({
        owner_id: user.id,
        sitter_id: sitter.id,
        start_date: formatDateToYYYYMMDD(startDate),
        end_date: formatDateToYYYYMMDD(endDate),
        service_type: selectedService.name,
        animal_type: petTypes,
        animal_name: petNames,
        special_instructions: specialInstructions || null,
        total_price: totalPrice,
        status: 'pending',
      });

      if (insertError) throw insertError;

      // Créer une notification pour le petsitter
      await supabase.from('notifications').insert({
        user_id: sitter.id,
        type: 'booking_request',
        title: 'Nouvelle demande de réservation',
        message: `${user.name} souhaite réserver vos services du ${formatDate(startDate)} au ${formatDate(endDate)}`,
        link: '/fr/petsitter/reservations',
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de la demande');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setStartDate(null);
    setEndDate(null);
    setSelectedPets([]);
    setSpecialInstructions('');
    setError(null);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-BE', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      timeZone: TIMEZONE 
    });
  };

  // Calendrier
  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Ajouter les jours vides du début
    for (let i = 0; i < (firstDay.getDay() || 7) - 1; i++) {
      days.push(new Date(year, month, -i));
    }
    days.reverse();

    // Ajouter les jours du mois
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  };

  const isDateUnavailable = (date: Date): boolean => {
    const dateStr = formatDateToYYYYMMDD(date);
    return unavailableDates.includes(dateStr);
  };

  const isDatePast = (date: Date): boolean => {
    const today = getTodayInBrussels();
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck < today;
  };

  const isDateSelected = (date: Date): boolean => {
    if (!startDate) return false;
    const dateStr = formatDateToYYYYMMDD(date);
    const startStr = formatDateToYYYYMMDD(startDate);
    if (!endDate) return dateStr === startStr;
    const endStr = formatDateToYYYYMMDD(endDate);
    return dateStr >= startStr && dateStr <= endStr;
  };

  const handleDateClick = (date: Date) => {
    if (isDatePast(date) || isDateUnavailable(date)) return;

    // Créer une copie de la date pour éviter les mutations
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (!startDate || (startDate && endDate)) {
      setStartDate(selectedDate);
      setEndDate(null);
    } else {
      const startDateStr = formatDateToYYYYMMDD(startDate);
      const selectedDateStr = formatDateToYYYYMMDD(selectedDate);
      
      if (selectedDateStr < startDateStr) {
        setStartDate(selectedDate);
        setEndDate(null);
      } else {
        // Vérifier qu'il n'y a pas de date indisponible entre les deux
        let hasUnavailable = false;
        for (let d = new Date(startDate); d <= selectedDate; d.setDate(d.getDate() + 1)) {
          if (isDateUnavailable(d)) {
            hasUnavailable = true;
            break;
          }
        }
        if (hasUnavailable) {
          setStartDate(selectedDate);
          setEndDate(null);
        } else {
          setEndDate(selectedDate);
        }
      }
    }
  };

  const togglePet = (petId: string) => {
    setSelectedPets(prev =>
      prev.includes(petId)
        ? prev.filter(id => id !== petId)
        : [...prev, petId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-hover px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center relative overflow-hidden">
                {sitter.avatar ? (
                  <Image
                    src={sitter.avatar}
                    alt={sitter.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <div className="text-white">
                <h2 className="font-bold text-lg">Réserver avec {sitter.name}</h2>
                {sitter.city && <p className="text-white/80 text-sm">{sitter.city}</p>}
              </div>
            </div>
            <button
              onClick={() => { onClose(); resetForm(); }}
              className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex flex-col items-center ${idx > 0 ? 'ml-2' : ''}`}>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-white text-primary'
                          : isActive
                          ? 'bg-white text-primary ring-4 ring-white/30'
                          : 'bg-white/20 text-white/60'
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs mt-1 ${isActive || isCompleted ? 'text-white' : 'text-white/60'}`}>
                      {step.title}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${isCompleted ? 'bg-white' : 'bg-white/20'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Step 1: Service Selection */}
              {currentStep === 1 && (
                <div>
                  <h3 className="text-xl font-bold mb-2">Quel service souhaitez-vous ?</h3>
                  <p className="text-gray-600 mb-6">Sélectionnez le type de garde pour votre animal</p>
                  
                  <div className="grid gap-4">
                    {services.map((service) => {
                      const Icon = service.icon;
                      const isSelected = selectedService?.id === service.id;
                      return (
                        <button
                          key={service.id}
                          onClick={() => setSelectedService(service)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-primary bg-primary-light/30'
                              : 'border-gray-200 hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-lg">{service.name}</h4>
                                <span className="text-primary font-bold text-lg">{service.price}€/jour</span>
                              </div>
                              <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Date Selection */}
              {currentStep === 2 && (
                <div>
                  <h3 className="text-xl font-bold mb-2">Quand avez-vous besoin de ce service ?</h3>
                  <p className="text-gray-600 mb-6">Sélectionnez vos dates de début et de fin</p>

                  {/* Légende */}
                  <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary rounded"></div>
                      <span>Sélectionné</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                      <span>Indisponible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-100 rounded"></div>
                      <span>Passé</span>
                    </div>
                  </div>

                  {/* Calendrier */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <h4 className="font-bold text-lg">
                        {currentMonth.toLocaleDateString('fr-BE', { month: 'long', year: 'numeric', timeZone: TIMEZONE })}
                      </h4>
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                        <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {getDaysInMonth(currentMonth).map((date, idx) => {
                        const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                        const isPast = isDatePast(date);
                        const isUnavailable = isDateUnavailable(date);
                        const isSelected = isDateSelected(date);
                        const dateStr = formatDateToYYYYMMDD(date);
                        const isStart = startDate && dateStr === formatDateToYYYYMMDD(startDate);
                        const isEnd = endDate && dateStr === formatDateToYYYYMMDD(endDate);

                        return (
                          <button
                            key={idx}
                            onClick={() => handleDateClick(date)}
                            disabled={!isCurrentMonth || isPast || isUnavailable}
                            className={`
                              aspect-square rounded-lg text-sm font-medium transition-all
                              ${!isCurrentMonth ? 'text-gray-300' : ''}
                              ${isPast && isCurrentMonth ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                              ${isUnavailable && isCurrentMonth && !isPast ? 'bg-red-50 text-red-400 cursor-not-allowed border border-red-200' : ''}
                              ${isSelected && !isPast && !isUnavailable ? 'bg-primary text-white' : ''}
                              ${isStart || isEnd ? 'ring-2 ring-primary ring-offset-2' : ''}
                              ${!isSelected && !isPast && !isUnavailable && isCurrentMonth ? 'hover:bg-primary-light cursor-pointer' : ''}
                            `}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dates sélectionnées */}
                  {startDate && (
                    <div className="mt-4 p-4 bg-primary-light/30 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Du</p>
                          <p className="font-bold">{formatDate(startDate)}</p>
                        </div>
                        {endDate && (
                          <>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Au</p>
                              <p className="font-bold">{formatDate(endDate)}</p>
                            </div>
                          </>
                        )}
                      </div>
                      {endDate && selectedService && (
                        <div className="mt-3 pt-3 border-t border-primary/20">
                          <p className="text-sm text-gray-600">
                            {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} jours × {selectedService.price}€
                          </p>
                          <p className="font-bold text-primary text-lg">
                            Total estimé: {(Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1) * parseFloat(selectedService.price)}€
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Pet Selection */}
              {currentStep === 3 && (
                <div>
                  <h3 className="text-xl font-bold mb-2">Quel(s) animal(aux) ?</h3>
                  <p className="text-gray-600 mb-6">Sélectionnez les animaux à faire garder</p>

                  {pets.length === 0 ? (
                    <div className="text-center py-8 bg-primary-light/60 rounded-xl border border-primary/30">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-primary" />
                      <p className="font-medium text-primary mb-2">Aucun animal enregistré</p>
                      <p className="text-sm text-gray-700 mb-4">
                        Vous devez d'abord ajouter vos animaux pour pouvoir faire une réservation
                      </p>
                      <a
                        href="/fr/proprietaire/mes-animaux"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-dark font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
                        <PawPrint className="w-4 h-4" />
                        Ajouter un animal
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pets.map((pet) => {
                        const isSelected = selectedPets.includes(pet.id);
                        return (
                          <button
                            key={pet.id}
                            onClick={() => togglePet(pet.id)}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                              isSelected
                                ? 'border-primary bg-primary-light/30'
                                : 'border-gray-200 hover:border-primary/50'
                            }`}
                          >
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                              isSelected ? 'bg-primary' : 'bg-gray-100'
                            }`}>
                              {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold">{pet.name}</h4>
                              <p className="text-sm text-gray-600">
                                {getSpeciesLabel(pet.species)}
                                {pet.breed && ` • ${pet.breed}`}
                              </p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'bg-primary border-primary' : 'border-gray-300'
                            }`}>
                              {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Instructions spéciales */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructions spéciales (optionnel)
                    </label>
                    <textarea
                      rows={3}
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder="Régime alimentaire, médicaments, habitudes, préférences..."
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Summary */}
              {currentStep === 4 && (
                <div>
                  <h3 className="text-xl font-bold mb-2">Récapitulatif de votre demande</h3>
                  <p className="text-gray-600 mb-6">Vérifiez les informations avant d'envoyer</p>

                  <div className="space-y-4">
                    {/* Service */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Service</p>
                      <p className="font-bold text-lg">{selectedService?.name}</p>
                      <p className="text-primary font-semibold">{selectedService?.price}€/jour</p>
                    </div>

                    {/* Dates */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Période</p>
                      <p className="font-bold">
                        Du {startDate && formatDate(startDate)} au {endDate && formatDate(endDate)}
                      </p>
                      {startDate && endDate && (
                        <p className="text-gray-600">
                          {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} jours
                        </p>
                      )}
                    </div>

                    {/* Animaux */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Animaux</p>
                      <div className="flex flex-wrap gap-2">
                        {pets.filter(p => selectedPets.includes(p.id)).map(pet => (
                          <span key={pet.id} className="bg-white px-3 py-1 rounded-full text-sm font-medium border">
                            {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'} {pet.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Instructions */}
                    {specialInstructions && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Instructions</p>
                        <p className="text-gray-700">{specialInstructions}</p>
                      </div>
                    )}

                    {/* Total */}
                    <div className="p-4 bg-primary-light/50 rounded-xl border-2 border-primary">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-lg">Total estimé</p>
                        <p className="font-bold text-2xl text-primary">
                          {startDate && endDate && selectedService
                            ? `${(Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1) * parseFloat(selectedService.price)}€`
                            : '-'
                          }
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Le paiement sera effectué après confirmation du petsitter
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {error}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
          <button
            onClick={currentStep === 1 ? () => { onClose(); resetForm(); } : handleBack}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            {currentStep === 1 ? 'Annuler' : 'Retour'}
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canGoNext()}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-dark font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuer
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || pets.length === 0}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-dark font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dark"></div>
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Envoyer la demande
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
