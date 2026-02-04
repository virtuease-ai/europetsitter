'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Calendar, MapPin, DollarSign, MessageSquare, Check, X } from 'lucide-react';
import type { Reservation } from '@/types';
import { acceptReservation, rejectReservation } from '@/lib/supabase/reservations';

interface SitterReservationCardProps {
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

export function SitterReservationCard({ reservation, onUpdate }: SitterReservationCardProps) {
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'reject'>('accept');
  const [response, setResponse] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleAction = async () => {
    setProcessing(true);
    try {
      if (actionType === 'accept') {
        await acceptReservation(reservation.id, response);
      } else {
        await rejectReservation(reservation.id, response);
      }
      setShowResponseModal(false);
      setResponse('');
      onUpdate?.();
    } catch (error) {
      console.error('Error processing reservation:', error);
      alert('Erreur lors du traitement');
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (type: 'accept' | 'reject') => {
    setActionType(type);
    setShowResponseModal(true);
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

  return (
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold mb-1">
                  Réservation de {reservation.owner?.name || 'Propriétaire'}
                </h3>
                {reservation.pet && (
                  <p className="text-gray-600">
                    {reservation.pet.name} ({reservation.pet.type})
                  </p>
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

            {/* Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>
                  {formatDate(reservation.start_date)} → {formatDate(reservation.end_date)}
                </span>
                <span className="text-gray-500">({calculateDuration()} jours)</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="font-semibold">{reservation.total_price} €</span>
                <span className="text-gray-500">({reservation.price_per_day} €/jour)</span>
              </div>

              <div className="text-sm text-gray-600">
                Service: <span className="font-semibold capitalize">{reservation.service_type.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Owner Message */}
            {reservation.owner_message && (
              <div className="p-3 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Message du propriétaire:</p>
                    <p className="text-gray-600">{reservation.owner_message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Your Response */}
            {reservation.sitter_response && (
              <div className="p-3 bg-blue-50 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Votre réponse:</p>
                    <p className="text-gray-700">{reservation.sitter_response}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Pet Details */}
            {reservation.pet && (
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold mb-2">Informations sur l'animal:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {reservation.pet.breed && (
                    <div>
                      <span className="text-gray-500">Race:</span>{' '}
                      <span className="font-medium">{reservation.pet.breed}</span>
                    </div>
                  )}
                  {reservation.pet.age && (
                    <div>
                      <span className="text-gray-500">Âge:</span>{' '}
                      <span className="font-medium">{reservation.pet.age} ans</span>
                    </div>
                  )}
                  {reservation.pet.weight && (
                    <div>
                      <span className="text-gray-500">Poids:</span>{' '}
                      <span className="font-medium">{reservation.pet.weight} kg</span>
                    </div>
                  )}
                  {reservation.pet.gender && (
                    <div>
                      <span className="text-gray-500">Sexe:</span>{' '}
                      <span className="font-medium">
                        {reservation.pet.gender === 'male' ? 'Mâle' : 'Femelle'}
                      </span>
                    </div>
                  )}
                </div>
                {reservation.pet.special_needs && (
                  <div className="mt-2">
                    <span className="text-gray-500">Besoins spéciaux:</span>
                    <p className="text-sm mt-1">{reservation.pet.special_needs}</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            {reservation.status === 'pending' && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => openModal('accept')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="w-5 h-5" />
                  Accepter
                </button>
                <button
                  onClick={() => openModal('reject')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Refuser
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {actionType === 'accept' ? 'Accepter' : 'Refuser'} la réservation
            </h3>
            <p className="text-gray-600 mb-4">
              {actionType === 'accept'
                ? 'Vous pouvez ajouter un message pour confirmer la réservation.'
                : 'Veuillez indiquer la raison du refus (optionnel).'}
            </p>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder={actionType === 'accept' ? 'Message de confirmation (optionnel)' : 'Raison du refus (optionnel)'}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[100px]"
              disabled={processing}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowResponseModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={processing}
              >
                Annuler
              </button>
              <button
                onClick={handleAction}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-50 ${
                  actionType === 'accept'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={processing}
              >
                {processing ? 'Traitement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
