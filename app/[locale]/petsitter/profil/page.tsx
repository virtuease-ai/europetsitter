'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import {
  getDefaultFormData,
  getProfileTabErrors,
  canPublishProfile,
  type SitterProfileFormData,
} from '@/types/sitterProfileForm';
import { SitterLayout } from '@/components/layout/SitterLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ProfileTabContent } from '@/components/sitter/profile/ProfileTabContent';
import { ServicesTabContent } from '@/components/sitter/profile/ServicesTabContent';
import { SpecificitiesTabContent } from '@/components/sitter/profile/SpecificitiesTabContent';
import { ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => keysB.includes(k) && deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

function ProfileContent() {
  const { user, refreshKey } = useAuth();
  const t = useTranslations('sitterDashboard.profilePage');
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<SitterProfileFormData>(getDefaultFormData());
  const [initialData, setInitialData] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const TABS = [
    { id: 'profil', label: t('tabs.profile') },
    { id: 'services', label: t('tabs.services') },
    { id: 'specificites', label: t('tabs.specifics') },
  ];

  const hasChanges = useMemo(() => {
    if (!initialData) return false;
    try {
      return !deepEqual(formData, JSON.parse(initialData));
    } catch {
      return true;
    }
  }, [formData, initialData]);

  const profileErrors = useMemo(() => getProfileTabErrors(formData.profile), [formData.profile]);
  const publishValidation = useMemo(() => canPublishProfile(formData), [formData]);

  // Fonction de chargement du profil (réutilisable)
  const loadProfile = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('sitter_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      const defaultData = getDefaultFormData();
      defaultData.profile.name = data.name ?? '';
      defaultData.profile.description = data.description ?? '';
      defaultData.profile.address = data.address ?? (data.specificities as { address?: string } | null)?.address ?? '';
      defaultData.profile.phone = data.phone ?? '';
      defaultData.profile.avatar = data.avatar ?? '';
      defaultData.profile.photos = Array.isArray(data.photos) ? data.photos : (data.photos && typeof data.photos === 'object' ? (data.photos as string[]) : []);
      defaultData.profile.businessName = [data.first_name, data.last_name].filter(Boolean).join(' ') || ((data.specificities as { businessName?: string } | null)?.businessName ?? '');
      defaultData.profile.businessType = (data.business_type as SitterProfileFormData['profile']['businessType']) ?? 'individual';
      defaultData.profile.tvaNumber = data.tva_number ?? '';
      defaultData.profile.siretNumber = data.siret_number ?? '';
      if (data.coordinates != null) {
        if (typeof data.coordinates === 'object') {
          const c = data.coordinates as { latitude?: number; longitude?: number; x?: number; y?: number };
          defaultData.profile.coordinates =
            c.latitude != null && c.longitude != null
              ? { latitude: c.latitude, longitude: c.longitude }
              : c.y != null && c.x != null
                ? { latitude: c.y, longitude: c.x }
                : null;
        } else if (typeof data.coordinates === 'string') {
          const match = data.coordinates.match(/^\s*\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)\s*$/);
          if (match) {
            const lon = parseFloat(match[1]);
            const lat = parseFloat(match[2]);
            if (!Number.isNaN(lon) && !Number.isNaN(lat)) {
              defaultData.profile.coordinates = { latitude: lat, longitude: lon };
            }
          }
        }
      }
      defaultData.specificities.housingType = (data.housing_type as SitterProfileFormData['specificities']['housingType']) ?? defaultData.specificities.housingType;
      defaultData.specificities.children = (data.children_presence as SitterProfileFormData['specificities']['children']) ?? defaultData.specificities.children;
      defaultData.specificities.walkingAreas = (Array.isArray(data.walking_places) ? data.walking_places : []) as SitterProfileFormData['specificities']['walkingAreas'];
      defaultData.specificities.experience = (Array.isArray(data.skills) ? data.skills : []) as SitterProfileFormData['specificities']['experience'];
      defaultData.specificities.yearsOfExperience = (data.years_experience as SitterProfileFormData['specificities']['yearsOfExperience']) ?? defaultData.specificities.yearsOfExperience;
      if (data.specificities && typeof data.specificities === 'object') {
        const sp = data.specificities as Record<string, unknown>;
        const { address: _a, businessName: _b, ...rest } = sp;
        defaultData.specificities = { ...defaultData.specificities, ...rest } as SitterProfileFormData['specificities'];
      }
      defaultData.services.animals = (Array.isArray(data.animals) ? data.animals : []) as SitterProfileFormData['services']['animals'];
      const rawServices = data.services as { services?: Record<string, { active?: boolean; price?: string; priceWeek?: string; description?: string }>; serviceOptions?: Record<string, string[]> } | null;
      if (rawServices?.serviceOptions && typeof rawServices.serviceOptions === 'object') {
        defaultData.services.serviceOptions = { ...defaultData.services.serviceOptions, ...rawServices.serviceOptions };
      }
      if (data.service_options && typeof data.service_options === 'object') {
        defaultData.services.serviceOptions = { ...defaultData.services.serviceOptions, ...data.service_options };
      }
      if (data.services && typeof data.services === 'object') {
        const raw = data.services as { services?: Record<string, { active?: boolean; price?: string; priceWeek?: string; description?: string }> };
        if (raw.services) {
          Object.entries(raw.services).forEach(([key, val]) => {
            const type = key as keyof typeof defaultData.services.services;
            if (defaultData.services.services[type] && val) {
              defaultData.services.services[type] = { ...defaultData.services.services[type], ...val, active: val.active ?? false };
            }
          });
        }
      }
      setFormData(defaultData);
      setInitialData(JSON.stringify(defaultData));
    } else {
      setInitialData(JSON.stringify(getDefaultFormData()));
    }
  }, [user]);

  // Chargement initial + rechargement au retour d'onglet (via refreshKey)
  useEffect(() => {
    if (user) loadProfile();
  }, [user, loadProfile, refreshKey]);

  const getProfilePayload = (): Record<string, unknown> => {
    const parts = (formData.profile.businessName || '').trim().split(/\s+/);
    const first_name = parts[0] ?? null;
    const last_name = parts.length > 1 ? parts.slice(1).join(' ') : null;
    const coords = formData.profile.coordinates;
    const coordinates =
      coords?.latitude != null && coords?.longitude != null
        ? `(${coords.longitude},${coords.latitude})`
        : null;
    return {
      id: user!.id,
      name: formData.profile.name || '',
      address: formData.profile.address || null,
      description: formData.profile.description || null,
      phone: formData.profile.phone || null,
      avatar: formData.profile.avatar || null,
      photos: formData.profile.photos?.length ? formData.profile.photos : null,
      first_name,
      last_name,
      business_type: formData.profile.businessType,
      tva_number: formData.profile.tvaNumber || null,
      siret_number: formData.profile.siretNumber || null,
      coordinates,
    };
  };

  const getServicesPayload = (): Record<string, unknown> => ({
    animals: formData.services.animals?.length ? formData.services.animals : null,
    services: {
      services: formData.services.services,
      serviceOptions: formData.services.serviceOptions,
    },
  });

  const getSpecificitiesColumns = (): Record<string, unknown> => ({
    housing_type: formData.specificities.housingType,
    children_presence: formData.specificities.children,
    walking_places: formData.specificities.walkingAreas?.length ? formData.specificities.walkingAreas : null,
    skills: formData.specificities.experience?.length ? formData.specificities.experience : null,
    years_experience: formData.specificities.yearsOfExperience,
  });

  const save = async (options: { tabIndex?: number; publish?: boolean } = {}) => {
    const { tabIndex, publish = false } = options;
    if (!user) return;
    setIsSaving(true);
    setMessage(null);
    const timeoutId = setTimeout(() => {
      setIsSaving(false);
      setMessage({ type: 'error', text: 'La requête a pris trop de temps. Vérifiez votre connexion ou réessayez.' });
    }, 15000);
    try {
      const supabase = createClient();

      if (publish) {
        const fullPayload: Record<string, unknown> = {
          ...getProfilePayload(),
          ...getServicesPayload(),
          ...getSpecificitiesColumns(),
          is_visible: true,
          updated_at: new Date().toISOString(),
          profile_completed: true,
        };
        const { error } = await supabase
          .from('sitter_profiles')
          .upsert(fullPayload, { onConflict: 'id' });
        if (error) throw error;
        setInitialData(JSON.stringify(formData));
        setMessage({ type: 'success', text: 'Votre profil a été publié avec succès !' });
      } else if (tabIndex === 0) {
        const { error } = await supabase
          .from('sitter_profiles')
          .upsert(getProfilePayload(), { onConflict: 'id' });
        if (error) throw error;
        setInitialData(JSON.stringify(formData));
        setMessage({ type: 'success', text: 'Profil enregistré.' });
      } else if (tabIndex === 1) {
        const payload = getServicesPayload();
        const { data, error } = await supabase
          .from('sitter_profiles')
          .update(payload)
          .eq('id', user.id)
          .select('id')
          .maybeSingle();
        if (error) throw error;
        if (data == null) {
          clearTimeout(timeoutId);
          setMessage({ type: 'error', text: 'Enregistrez d\'abord l\'onglet Profil, puis réessayez.' });
          return;
        }
        setInitialData(JSON.stringify(formData));
        setMessage({ type: 'success', text: 'Services enregistrés.' });
      } else if (tabIndex === 2) {
        const payload = getSpecificitiesColumns();
        const { data, error } = await supabase
          .from('sitter_profiles')
          .update(payload)
          .eq('id', user.id)
          .select('id')
          .maybeSingle();
        if (error) throw error;
        if (data == null) {
          clearTimeout(timeoutId);
          setMessage({ type: 'error', text: 'Enregistrez d\'abord l\'onglet Profil, puis réessayez.' });
          return;
        }
        setInitialData(JSON.stringify(formData));
        setMessage({ type: 'success', text: 'Spécificités enregistrées.' });
      } else {
        const fullPayload: Record<string, unknown> = {
          ...getProfilePayload(),
          ...getServicesPayload(),
          ...getSpecificitiesColumns(),
          updated_at: new Date().toISOString(),
          profile_completed: true,
        };
        const { error } = await supabase
          .from('sitter_profiles')
          .upsert(fullPayload, { onConflict: 'id' });
        if (error) throw error;
        setInitialData(JSON.stringify(formData));
        setMessage({ type: 'success', text: 'Modifications enregistrées avec succès !' });
      }

      clearTimeout(timeoutId);
      setTimeout(() => setMessage(null), 4000);
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const errObj = err as { message?: string; details?: string } | null;
      const errorMessage = errObj?.message || (err instanceof Error ? err.message : 'Une erreur est survenue.');
      setMessage({ type: 'error', text: errorMessage });
      if (typeof window !== 'undefined') console.error('Erreur sauvegarde profil:', err);
    } finally {
      clearTimeout(timeoutId);
      setIsSaving(false);
    }
  };

  const handleSave = () => save({});
  const handlePublish = () => {
    if (!publishValidation.ok) {
      setMessage({ type: 'error', text: publishValidation.errors.join('. ') });
      setTimeout(() => setMessage(null), 5000);
      return;
    }
    save({ publish: true });
  };
  const handleNext = () => {
    save({ tabIndex: activeTab }).then(() => {
      setActiveTab(activeTab + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  return (
    <SitterLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-2">{t('subtitle')}</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Onglets profil">
              {TABS.map((tab, i) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(i);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === i
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 0 && (
              <ProfileTabContent
                data={formData.profile}
                onChange={(profile) => setFormData((prev) => ({ ...prev, profile }))}
                errors={profileErrors}
              />
            )}
            {activeTab === 1 && (
              <ServicesTabContent
                data={formData.services}
                onChange={(services) => setFormData((prev) => ({ ...prev, services }))}
              />
            )}
            {activeTab === 2 && (
              <SpecificitiesTabContent
                data={formData.specificities}
                onChange={(specificities) => setFormData((prev) => ({ ...prev, specificities }))}
              />
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
              <div className="flex gap-2">
                {activeTab > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab(activeTab - 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t('back')}
                  </button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {hasChanges && (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-error text-white rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {t('save')}
                  </button>
                )}
                {activeTab < 2 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-dark rounded-lg font-medium text-sm hover:bg-primary-hover disabled:opacity-50"
                  >
                    {t('next')}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isSaving || !publishValidation.ok}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-dark rounded-lg font-medium text-sm hover:bg-primary-hover disabled:opacity-50"
                    title={!publishValidation.ok ? publishValidation.errors.join('\n') : undefined}
                  >
                    <Send className="w-4 h-4" />
                    {t('publish')}
                  </button>
                )}
              </div>
            </div>

            {activeTab === 2 && !publishValidation.ok && (
              <div className="mt-6 p-4 bg-primary-light/60 border border-primary/30 rounded-xl text-sm text-primary">
                <p className="font-semibold mb-2">{t('toPublishComplete')}</p>
                <ul className="list-disc list-inside space-y-1">
                  {publishValidation.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </SitterLayout>
  );
}

export default function SitterProfilePage() {
  return (
    <AuthGuard requiredRole="sitter">
      <ProfileContent />
    </AuthGuard>
  );
}
