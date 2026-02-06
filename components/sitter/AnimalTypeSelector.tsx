'use client';

import { useTranslations } from 'next-intl';
import { ANIMAL_TYPES } from '@/types/sitterProfileForm';
import type { AnimalType } from '@/types/sitterProfileForm';
import { Dog, Cat, Rabbit, Bird, Squirrel } from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'petit-chien': Dog,
  'moyen-chien': Dog,
  'grand-chien': Dog,
  'chien-attaque': Dog,
  'chien-garde': Dog,
  chat: Cat,
  lapin: Rabbit,
  rongeur: Squirrel,
  oiseau: Bird,
  volaille: Bird,
  nac: Bird,
};

interface AnimalTypeSelectorProps {
  value: AnimalType[];
  onChange: (animals: AnimalType[]) => void;
  label?: string;
}

export function AnimalTypeSelector({
  value,
  onChange,
  label,
}: AnimalTypeSelectorProps) {
  const t = useTranslations('sitterDashboard.profilePage.servicesTab');
  const displayLabel = label ?? t('animalTypes');

  const toggle = (id: AnimalType) => {
    if (value.includes(id)) {
      onChange(value.filter((a) => a !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-3">{displayLabel}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {ANIMAL_TYPES.map(({ id }) => {
          const Icon = ICONS[id] || Dog;
          const checked = value.includes(id);
          return (
            <label
              key={id}
              className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg cursor-pointer transition-colors min-w-0 ${
                checked ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-primary/50'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(id)}
                className="rounded border-gray-300 text-primary focus:ring-primary flex-shrink-0"
              />
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium leading-tight truncate">{t(`animals.${id}`)}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
