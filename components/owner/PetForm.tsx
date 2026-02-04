'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Pet, PetType } from '@/types';
import { createPet, updatePet } from '@/lib/supabase/pets';

interface PetFormProps {
  pet?: Pet;
  ownerId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const petTypes: { value: PetType; label: string }[] = [
  { value: 'chien', label: 'Chien' },
  { value: 'chat', label: 'Chat' },
  { value: 'lapin', label: 'Lapin' },
  { value: 'oiseau', label: 'Oiseau' },
  { value: 'rongeur', label: 'Rongeur' },
  { value: 'reptile', label: 'Reptile' },
  { value: 'poisson', label: 'Poisson' },
  { value: 'nac', label: 'NAC (Nouvel Animal de Compagnie)' },
];

export function PetForm({ pet, ownerId, onClose, onSuccess }: PetFormProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: pet?.name || '',
    type: pet?.type || 'chien' as PetType,
    breed: pet?.breed || '',
    age: pet?.age?.toString() || '',
    weight: pet?.weight?.toString() || '',
    gender: pet?.gender || 'male',
    bio: pet?.bio || '',
    health_info: pet?.health_info || '',
    special_needs: pet?.special_needs || '',
    vaccinations_up_to_date: pet?.vaccinations_up_to_date || false,
    sterilized: pet?.sterilized || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Le nom est obligatoire');
      return;
    }

    setSaving(true);
    try {
      const petData = {
        owner_id: ownerId,
        name: formData.name.trim(),
        type: formData.type,
        breed: formData.breed.trim() || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        gender: formData.gender as 'male' | 'female',
        bio: formData.bio.trim() || undefined,
        health_info: formData.health_info.trim() || undefined,
        special_needs: formData.special_needs.trim() || undefined,
        vaccinations_up_to_date: formData.vaccinations_up_to_date,
        sterilized: formData.sterilized,
      };

      if (pet) {
        await updatePet(pet.id, petData);
      } else {
        await createPet(petData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving pet:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {pet ? 'Modifier' : 'Ajouter'} un animal
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as PetType })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                required
              >
                {petTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Race</label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Âge (années)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Poids (kg)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Sexe</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="male">Mâle</option>
                <option value="female">Femelle</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">Description / Personnalité</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[100px]"
              placeholder="Décrivez le caractère et les habitudes de votre animal..."
            />
          </div>

          {/* Informations médicales */}
          <div>
            <label className="block text-sm font-semibold mb-2">Informations médicales</label>
            <textarea
              value={formData.health_info}
              onChange={(e) => setFormData({ ...formData, health_info: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[80px]"
              placeholder="Allergies, traitements en cours, etc."
            />
          </div>

          {/* Besoins spéciaux */}
          <div>
            <label className="block text-sm font-semibold mb-2">Besoins spéciaux</label>
            <textarea
              value={formData.special_needs}
              onChange={(e) => setFormData({ ...formData, special_needs: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[80px]"
              placeholder="Régime alimentaire particulier, exercices requis, etc."
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.vaccinations_up_to_date}
                onChange={(e) =>
                  setFormData({ ...formData, vaccinations_up_to_date: e.target.checked })
                }
                className="w-5 h-5 rounded border-gray-300"
              />
              <span className="text-sm">Vaccins à jour</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.sterilized}
                onChange={(e) => setFormData({ ...formData, sterilized: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300"
              />
              <span className="text-sm">Stérilisé(e)</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={saving}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-dark font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : pet ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
