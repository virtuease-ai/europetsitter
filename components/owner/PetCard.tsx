'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Pencil, Trash2, PawPrint } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  photo?: string;
  bio?: string;
}

interface PetCardProps {
  pet: Pet;
  onEdit: (pet: Pet) => void;
  onDelete: (petId: string) => void;
}

const petTypeEmojis: Record<string, string> = {
  chien: '🐕',
  chat: '🐈',
  lapin: '🐰',
  oiseau: '🦜',
  rongeur: '🐹',
  reptile: '🦎',
  poisson: '🐠',
  nac: '🐾',
};

export function PetCard({ pet, onEdit, onDelete }: PetCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    onDelete(pet.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex gap-4">
        {/* Photo */}
        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {pet.photo ? (
            <Image
              src={pet.photo}
              alt={pet.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              {petTypeEmojis[pet.type] || <PawPrint className="w-12 h-12 text-gray-400" />}
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-bold">{pet.name}</h3>
              <p className="text-gray-600 capitalize">
                {pet.breed || pet.type}
                {pet.age && ` • ${pet.age} ans`}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(pet)}
                className="p-2 text-primary hover:bg-primary-light rounded-lg transition-colors"
                title="Modifier"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {pet.bio && (
            <p className="text-sm text-gray-600 line-clamp-2">{pet.bio}</p>
          )}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Supprimer {pet.name} ?</h3>
            <p className="text-gray-600 mb-6">
              Cette action est irréversible. Toutes les réservations liées à cet animal seront également supprimées.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
