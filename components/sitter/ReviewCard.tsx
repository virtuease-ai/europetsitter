'use client';

import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import type { Review } from '@/types';
import { respondToReview } from '@/lib/supabase/reviews';

interface ReviewCardProps {
  review: Review;
  canRespond?: boolean;
  onUpdate?: () => void;
}

export function ReviewCard({ review, canRespond = false, onUpdate }: ReviewCardProps) {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [response, setResponse] = useState(review.response || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitResponse = async () => {
    if (!response.trim()) {
      alert('Veuillez écrire une réponse');
      return;
    }

    setSubmitting(true);
    try {
      await respondToReview(review.id, response);
      setShowResponseForm(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Erreur lors de l\'envoi de la réponse');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'fill-primary text-primary'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-bold text-lg">{review.reviewer?.name || 'Utilisateur'}</p>
          <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
        </div>
        {renderStars(review.rating)}
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-gray-700 mb-4">{review.comment}</p>
      )}

      {/* Criteria */}
      {review.criteria && Object.keys(review.criteria).length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-semibold mb-2">Détails:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(review.criteria).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600 capitalize">{key}:</span>
                <span className="font-semibold">{value}/5</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Response */}
      {review.response && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <div className="flex items-start gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-blue-600 mt-1" />
            <p className="font-semibold text-blue-900">Votre réponse:</p>
          </div>
          <p className="text-gray-700 text-sm">{review.response}</p>
          {review.response_date && (
            <p className="text-xs text-gray-500 mt-2">
              {formatDate(review.response_date)}
            </p>
          )}
        </div>
      )}

      {/* Response Form */}
      {canRespond && !review.response && (
        <div className="mt-4">
          {!showResponseForm ? (
            <button
              onClick={() => setShowResponseForm(true)}
              className="text-primary hover:underline font-semibold text-sm"
            >
              Répondre à cet avis
            </button>
          ) : (
            <div className="space-y-3">
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Écrivez votre réponse..."
                className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px]"
                disabled={submitting}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResponseForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitResponse}
                  className="px-4 py-2 bg-primary text-dark font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Envoi...' : 'Publier la réponse'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
