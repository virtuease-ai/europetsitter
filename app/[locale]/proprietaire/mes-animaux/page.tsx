'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { OwnerLayout } from '@/components/layout/OwnerLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PawPrint, Plus, Edit2, Trash2, X, Dog, Cat, Bird, Rabbit } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age_years: number | null;
  age_months: number | null;
  weight: number | null;
  gender: string | null;
  is_neutered: boolean;
  description: string | null;
  medical_info: string | null;
  special_needs: string | null;
  vaccinations_up_to_date: boolean;
}

const SPECIES_OPTIONS = [
  { value: 'dog', label: 'Chien', icon: Dog },
  { value: 'cat', label: 'Chat', icon: Cat },
  { value: 'bird', label: 'Oiseau', icon: Bird },
  { value: 'rabbit', label: 'Lapin', icon: Rabbit },
  { value: 'hamster', label: 'Hamster', icon: PawPrint },
  { value: 'fish', label: 'Poisson', icon: PawPrint },
  { value: 'reptile', label: 'Reptile', icon: PawPrint },
  { value: 'other', label: 'Autre', icon: PawPrint },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Mâle' },
  { value: 'female', label: 'Femelle' },
  { value: 'unknown', label: 'Inconnu' },
];

function PetsContent() {
  const { user, refreshKey } = useAuth();
  const t = useTranslations('ownerDashboard.petsPage');
  const tPets = useTranslations('pets');
  const tCommon = useTranslations('common');
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    age_years: '',
    age_months: '',
    weight: '',
    gender: 'unknown',
    is_neutered: false,
    description: '',
    medical_info: '',
    special_needs: '',
    vaccinations_up_to_date: false,
  });

  const supabase = createClient();

  const fetchPets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement animaux:', error);
      } else {
        setPets(data || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) fetchPets();
  }, [user, refreshKey, fetchPets]);

  const resetForm = () => {
    setFormData({
      name: '',
      species: 'dog',
      breed: '',
      age_years: '',
      age_months: '',
      weight: '',
      gender: 'unknown',
      is_neutered: false,
      description: '',
      medical_info: '',
      special_needs: '',
      vaccinations_up_to_date: false,
    });
    setEditingPet(null);
  };

  const openModal = (pet?: Pet) => {
    if (pet) {
      setEditingPet(pet);
      setFormData({
        name: pet.name,
        species: pet.species,
        breed: pet.breed || '',
        age_years: pet.age_years?.toString() || '',
        age_months: pet.age_months?.toString() || '',
        weight: pet.weight?.toString() || '',
        gender: pet.gender || 'unknown',
        is_neutered: pet.is_neutered,
        description: pet.description || '',
        medical_info: pet.medical_info || '',
        special_needs: pet.special_needs || '',
        vaccinations_up_to_date: pet.vaccinations_up_to_date,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    const payload = {
      owner_id: user.id,
      name: formData.name,
      species: formData.species,
      breed: formData.breed || null,
      age_years: formData.age_years ? parseInt(formData.age_years) : null,
      age_months: formData.age_months ? parseInt(formData.age_months) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      gender: formData.gender,
      is_neutered: formData.is_neutered,
      description: formData.description || null,
      medical_info: formData.medical_info || null,
      special_needs: formData.special_needs || null,
      vaccinations_up_to_date: formData.vaccinations_up_to_date,
    };

    try {
      if (editingPet) {
        const { error } = await supabase
          .from('pets')
          .update(payload)
          .eq('id', editingPet.id);

        if (error) throw error;
        setMessage({ type: 'success', text: 'Animal mis à jour !' });
      } else {
        const { error } = await supabase
          .from('pets')
          .insert(payload);

        if (error) throw error;
        setMessage({ type: 'success', text: 'Animal ajouté !' });
      }

      await fetchPets();
      closeModal();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Une erreur est survenue' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (petId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet animal ?')) return;

    try {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Animal supprimé' });
      await fetchPets();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const getSpeciesIcon = (species: string) => {
    const option = SPECIES_OPTIONS.find(o => o.value === species);
    const Icon = option?.icon || PawPrint;
    return <Icon className="w-8 h-8" />;
  };

  const getSpeciesLabel = (species: string) => {
    return SPECIES_OPTIONS.find(o => o.value === species)?.label || species;
  };

  if (loading) {
    return (
      <OwnerLayout>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout>
      <div className="p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-600 mt-2">{t('subtitle')}</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-dark font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('addPet')}
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {pets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-16 text-gray-500">
              <PawPrint className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium text-lg">{t('noPets')}</p>
              <p className="text-sm mt-2 mb-6">{t('noPetsText')}</p>
              <button
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-dark font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t('addPet')}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <div key={pet.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-br from-primary-light to-primary p-6 text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-primary">
                    {getSpeciesIcon(pet.species)}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{pet.name}</h3>
                  <p className="text-gray-600 mb-4">
                    {getSpeciesLabel(pet.species)}
                    {pet.breed && ` • ${pet.breed}`}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {(pet.age_years || pet.age_months) && (
                      <p>
                        <span className="font-medium">Âge:</span>{' '}
                        {pet.age_years ? `${pet.age_years} an${pet.age_years > 1 ? 's' : ''}` : ''}
                        {pet.age_years && pet.age_months ? ' et ' : ''}
                        {pet.age_months ? `${pet.age_months} mois` : ''}
                      </p>
                    )}
                    {pet.weight && (
                      <p><span className="font-medium">Poids:</span> {pet.weight} kg</p>
                    )}
                    {pet.gender && pet.gender !== 'unknown' && (
                      <p><span className="font-medium">Sexe:</span> {pet.gender === 'male' ? 'Mâle' : 'Femelle'}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {pet.vaccinations_up_to_date && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        {t('vaccinated')}
                      </span>
                    )}
                    {pet.is_neutered && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                        {t('sterilized')}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(pet)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      {tCommon('edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(pet.id)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {editingPet ? t('editPet') : t('addPet')}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Nom et Espèce */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Ex: Max"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Espèce *
                    </label>
                    <select
                      required
                      value={formData.species}
                      onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {SPECIES_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Race et Sexe */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Race
                    </label>
                    <input
                      type="text"
                      value={formData.breed}
                      onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Ex: Labrador"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sexe
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {GENDER_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Âge et Poids */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Âge (années)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.age_years}
                      onChange={(e) => setFormData({ ...formData, age_years: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Âge (mois)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={formData.age_months}
                      onChange={(e) => setFormData({ ...formData, age_months: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Poids (kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_neutered}
                      onChange={(e) => setFormData({ ...formData, is_neutered: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Stérilisé(e)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.vaccinations_up_to_date}
                      onChange={(e) => setFormData({ ...formData, vaccinations_up_to_date: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Vaccins à jour</span>
                  </label>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description / Caractère
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Décrivez le caractère de votre animal..."
                  />
                </div>

                {/* Infos médicales */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Informations médicales
                  </label>
                  <textarea
                    rows={2}
                    value={formData.medical_info}
                    onChange={(e) => setFormData({ ...formData, medical_info: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Allergies, traitements en cours..."
                  />
                </div>

                {/* Besoins spéciaux */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Besoins spéciaux
                  </label>
                  <textarea
                    rows={2}
                    value={formData.special_needs}
                    onChange={(e) => setFormData({ ...formData, special_needs: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Régime alimentaire particulier, routines..."
                  />
                </div>

                {/* Boutons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    {tCommon('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-primary hover:bg-primary-hover text-dark font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {saving ? tCommon('loading') : tCommon('save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}

export default function OwnerPetsPage() {
  return (
    <AuthGuard requiredRole="owner">
      <PetsContent />
    </AuthGuard>
  );
}
