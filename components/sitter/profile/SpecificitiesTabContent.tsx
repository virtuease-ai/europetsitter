'use client';

import { useTranslations } from 'next-intl';
import type { SpecificitiesTabData } from '@/types/sitterProfileForm';
import {
  HOUSING_OPTIONS,
  CHILDREN_OPTIONS,
  WALKING_OPTIONS,
  EXPERIENCE_OPTIONS,
  YEARS_EXPERIENCE_OPTIONS,
} from '@/types/sitterProfileForm';

interface SpecificitiesTabContentProps {
  data: SpecificitiesTabData;
  onChange: (data: SpecificitiesTabData) => void;
}

export function SpecificitiesTabContent({ data, onChange }: SpecificitiesTabContentProps) {
  const t = useTranslations('sitterDashboard.profilePage.specificsTab');
  const update = (partial: Partial<SpecificitiesTabData>) => onChange({ ...data, ...partial });

  const toggleWalking = (id: SpecificitiesTabData['walkingAreas'][0]) => {
    const walkingAreas = data.walkingAreas.includes(id)
      ? data.walkingAreas.filter((w) => w !== id)
      : [...data.walkingAreas, id];
    update({ walkingAreas });
  };

  const toggleExperience = (id: SpecificitiesTabData['experience'][0]) => {
    const experience = data.experience.includes(id)
      ? data.experience.filter((e) => e !== id)
      : [...data.experience, id];
    update({ experience });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-1">{t('housingTypeTitle')}</h3>
        <p className="text-sm text-gray-600 mb-3">{t('housingTypeSubtitle')}</p>
        <div className="space-y-2">
          {HOUSING_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name="housingType"
                value={opt.id}
                checked={data.housingType === opt.id}
                onChange={() => update({ housingType: opt.id })}
                className="border-gray-300 text-primary focus:ring-primary"
              />
              <span>{t(`housingTypes.${opt.id}`)}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-1">{t('childrenTitle')}</h3>
        <p className="text-sm text-gray-600 mb-3">{t('childrenSubtitle')}</p>
        <div className="space-y-2">
          {CHILDREN_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name="children"
                value={opt.id}
                checked={data.children === opt.id}
                onChange={() => update({ children: opt.id })}
                className="border-gray-300 text-primary focus:ring-primary"
              />
              <span>{t(`childrenOptions.${opt.id}`)}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-1">{t('walkingTitle')}</h3>
        <p className="text-sm text-gray-600 mb-2">{t('walkingSubtitle')}</p>
        <p className="text-sm text-gray-500 mb-3">
          {t('walkingHelp')}
        </p>
        <div className="space-y-2">
          {WALKING_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={data.walkingAreas.includes(opt.id)}
                onChange={() => toggleWalking(opt.id)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span>{t(`walkingOptions.${opt.id}`)}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-1">{t('skillsTitle')}</h3>
        <p className="text-sm text-gray-600 mb-2">{t('skillsSubtitle')}</p>
        <p className="text-sm text-gray-500 mb-3">
          {t('skillsHelp')}
        </p>
        <div className="space-y-2">
          {EXPERIENCE_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={data.experience.includes(opt.id)}
                onChange={() => toggleExperience(opt.id)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span>{t(`skillsOptions.${opt.id}`)}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-1">{t('experienceTitle')}</h3>
        <p className="text-sm text-gray-600 mb-2">{t('experienceSubtitle')}</p>
        <p className="text-sm text-gray-500 mb-3">
          {t('experienceHelp')}
        </p>
        <div className="space-y-2">
          {YEARS_EXPERIENCE_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name="yearsOfExperience"
                value={opt.id}
                checked={data.yearsOfExperience === opt.id}
                onChange={() => update({ yearsOfExperience: opt.id })}
                className="border-gray-300 text-primary focus:ring-primary"
              />
              <span>{t(`experienceOptions.${opt.id}`)}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
