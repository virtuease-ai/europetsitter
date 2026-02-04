'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, DollarSign, MessageSquare, X, Check } from 'lucide-react';
import type { Reservation } from '@/types';
import { cancelReservation } from '@/lib/supabase/reservations';

interface ReservationCardProps {
  reservation: Reservation;
  onUpdate?: () => void;
}

const statusColors = {
  pending: 'bg-orange-100 text-orange-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  pending: 'En attente',
  accepted: 'Confirmée',
  rejected: 'Refusée',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

export function ReservationCard({ reservation, onUpdate }: ReservationCardProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  const handleCancel = async () => {
    if (!cancellationReason.trim()) {
      alert('Veuillez indiquer une raison d\'annulation');
      return;
    }

    setCancelling(true);
    try {
      await cancelReservation(reservation.id, cancellationReason);
      setShowCancelModal(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('Erreur lors de l\'annulation');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const calculateDuration = () => {
    const start = new Date(reservation.start_date);
    const end = new Date(reservation.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days;
  };

  const canCancel = () => {
    const today = new Date();
    const startDate = new Date(reservation.start_date);
    return reservation.status === 'accepted' && startDate > today;
  };

  const canReview = () => {
    return reservation.status === 'completed';
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sitter Info */}
          <div className="flex items-start gap-4 flex-1">
            {reservation.sitter?.avatar && (
              <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={reservation.sitter.avatar}
                  alt={reservation.sitter.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Link
                    href={`/petsitter/${reservation.sitter_id}`}
                    className="text-lg font-bold hover:text-primary"
                  >
                    {reservation.sitter?.name}
                  </Link>
                  {reservation.sitter?.city && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      {reservation.sitter.city}
                    </div>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    statusColors[reservation.status]
                  }`}
                >
                  {statusLabels[reservation.status]}
                </span>
              </div>

              {/* Reservation Details */}
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>
                    {formatDate(reservation.start_date)} → {formatDate(reservation.end_date)}
                  </span>
                  <span className="text-gray-500">({calculateDuration()} jours)</span>
                </div>

                {reservation.pet && (
                  <div className="text-sm text-gray-600">
                    Animal: <span className="font-semibold">{reservation.pet.name}</span> ({reservation.pet.type})
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">{reservation.total_price} €</span>
                  <span className="text-gray-500">
                    ({reservation.price_per_day} €/jour)
                  </span>
                </div>

                {reservation.owner_message && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold mb-1">Votre message:</p>
                        <p className="text-gray-600">{reservation.owner_message}</p>
                      </div>
                    </div>
                  </div>
                )}

                {reservation.sitter_response && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-400 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold mb-1">Réponse du petsitter:</p>
                        <p className="text-gray-700">{reservation.sitter_response}</p>
                      </div>
                    </div>
                  </div>
                )}

                {reservation.cancellation_reason && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm font-semibold mb-1">Raison d'annulation:</p>
                    <p className="text-sm text-gray-700">{reservation.cancellation_reason}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                {canCancel() && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                  >
                    Annuler la réservation
                  </button>
                )}

                {canReview() && (
                  <Link
                    href={`/proprietaire/reservations/${reservation.id}/avis`}
                    className="px-4 py-2 bg-primary text-dark rounded-lg hover:bg-primary-hover transition-colors text-sm font-semibold"
                  >
                    Laisser un avis
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Annuler la réservation</h3>
            <p className="text-gray-600 mb-4">
              Veuillez indiquer la raison de l'annulation. Le petsitter en sera informé.
            </p>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Raison de l'annulation..."
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[100px]"
              disabled={cancelling}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={cancelling}
              >
                Fermer
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={cancelling}
              >
                {cancelling ? 'Annulation...' : 'Confirmer l\'annulation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
