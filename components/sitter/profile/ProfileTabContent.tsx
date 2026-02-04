'use client';

import { useTranslations } from 'next-intl';
import type { ProfileTabData } from '@/types/sitterProfileForm';
import { AvatarUpload } from '../AvatarUpload';
import { PhotoGallery } from '../PhotoGallery';
import { AddressAutocomplete } from '../AddressAutocomplete';

interface ProfileTabContentProps {
  data: ProfileTabData;
  onChange: (data: ProfileTabData) => void;
  errors?: Partial<Record<keyof ProfileTabData, string>>;
}

export function ProfileTabContent({ data, onChange, errors = {} }: ProfileTabContentProps) {
  const t = useTranslations('sitterDashboard.profilePage.profileTab');

  const BUSINESS_OPTIONS: { value: ProfileTabData['businessType']; label: string }[] = [
    { value: 'individual', label: t('businessTypes.individual') },
    { value: 'independent', label: t('businessTypes.independent') },
    { value: 'company', label: t('businessTypes.company') },
  ];
  const update = (partial: Partial<ProfileTabData>) => onChange({ ...data, ...partial });

  const showTvaSiret = data.businessType === 'independent' || data.businessType === 'company';

  const handleAddressChange = (address: string, coordinates: { latitude: number; longitude: number } | null) => {
    update({ address, coordinates });
  };

  const formatPhone = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    update({ phone: formatPhone(raw) });
  };

  const handleTvaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.toUpperCase().replace(/[^FR0-9]/g, '');
    if (v.length > 0 && !v.startsWith('FR')) v = 'FR' + v.replace(/^FR/, '');
    v = v.slice(0, 13);
    update({ tvaNumber: v });
  };

  const handleSiretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 14);
    update({ siretNumber: v });
  };

  const handleBusinessTypeChange = (businessType: ProfileTabData['businessType']) => {
    if (businessType === 'individual') {
      update({ businessType, tvaNumber: '', siretNumber: '' });
    } else {
      update({ businessType });
    }
  };

  return (
    <div className="space-y-6">
      <AvatarUpload value={data.avatar} onChange={(avatar) => update({ avatar })} />
      <PhotoGallery photos={data.photos} onChange={(photos) => update({ photos })} />

      <div>
        <label className="block text-sm font-semibold mb-2">{t('commercialName')}</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder={t('commercialNamePlaceholder')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">{t('fullName')}</label>
        <input
          type="text"
          value={data.businessName}
          onChange={(e) => update({ businessName: e.target.value })}
          placeholder={t('fullNamePlaceholder')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <AddressAutocomplete
        value={data.address}
        coordinates={data.coordinates}
        onChange={handleAddressChange}
        error={errors.address}
      />

      <div>
        <label className="block text-sm font-semibold mb-2">{t('phone')}</label>
        <input
          type="tel"
          value={data.phone}
          onChange={handlePhoneChange}
          placeholder={t('phonePlaceholder')}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.phone ? 'border-error' : 'border-gray-300'
          }`}
        />
        {errors.phone && <p className="text-sm text-error mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">{t('status')}</label>
        <select
          value={data.businessType}
          onChange={(e) => handleBusinessTypeChange(e.target.value as ProfileTabData['businessType'])}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {BUSINESS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {showTvaSiret && (
        <>
          <div>
            <label className="block text-sm font-semibold mb-2">{t('tvaNumber')}</label>
            <input
              type="text"
              value={data.tvaNumber}
              onChange={handleTvaChange}
              placeholder={t('tvaPlaceholder')}
              maxLength={13}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.tvaNumber ? 'border-error' : 'border-gray-300'
              }`}
            />
            {errors.tvaNumber && <p className="text-sm text-error mt-1">{errors.tvaNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">{t('siretNumber')}</label>
            <input
              type="text"
              inputMode="numeric"
              value={data.siretNumber}
              onChange={handleSiretChange}
              placeholder={t('siretPlaceholder')}
              maxLength={14}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.siretNumber ? 'border-error' : 'border-gray-300'
              }`}
            />
            <p className="text-sm text-gray-500 mt-1">{t('siretHelp')}</p>
            {errors.siretNumber && <p className="text-sm text-error mt-1">{errors.siretNumber}</p>}
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-semibold mb-2">{t('description')}</label>
        <textarea
          value={data.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder={t('descriptionPlaceholder')}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
}
