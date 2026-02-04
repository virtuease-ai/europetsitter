'use client';

import { useTranslations } from 'next-intl';
import type { ServicesTabData, ServiceOptionKey, ServiceType } from '@/types/sitterProfileForm';
import {
  SERVICE_TYPES,
  SERVICE_OPTION_LABELS,
  hasDogSelected,
  hasCatSelected,
} from '@/types/sitterProfileForm';
import { AnimalTypeSelector } from '../AnimalTypeSelector';
import { ServiceOptionsSelector } from '../ServiceOptionsSelector';

interface ServicesTabContentProps {
  data: ServicesTabData;
  onChange: (data: ServicesTabData) => void;
}

const OPTION_KEYS: ServiceOptionKey[] = [
  'hebergementChien',
  'hebergementChat',
  'gardeChien',
  'gardeChat',
  'visiteChien',
  'visiteChat',
  'promenadeChien',
];

export function ServicesTabContent({ data, onChange }: ServicesTabContentProps) {
  const t = useTranslations('sitterDashboard.profilePage.servicesTab');
  const update = (partial: Partial<ServicesTabData>) => onChange({ ...data, ...partial });

  const toggleService = (type: keyof ServicesTabData['services'], active: boolean) => {
    const services = { ...data.services };
    services[type] = { ...services[type], active };
    update({ services });
  };

  const updateService = (type: keyof ServicesTabData['services'], field: string, value: string) => {
    const services = { ...data.services };
    services[type] = { ...services[type], [field]: value };
    update({ services });
  };

  const setServiceOptions = (key: ServiceOptionKey, selected: string[]) => {
    const serviceOptions = { ...data.serviceOptions };
    serviceOptions[key] = selected;
    update({ serviceOptions });
  };

  const hasDog = hasDogSelected(data.animals);
  const hasCat = hasCatSelected(data.animals);

  // Translate service options
  const getTranslatedOptions = (optionKey: ServiceOptionKey) => {
    return SERVICE_OPTION_LABELS[optionKey].map(opt => ({
      id: opt.id,
      label: t(`serviceOptions.${optionKey}.${opt.id}`)
    }));
  };

  return (
    <div className="space-y-8">
      <AnimalTypeSelector value={data.animals} onChange={(animals) => update({ animals })} />

      <div>
        <h3 className="text-lg font-semibold mb-4">{t('servicesOffered')}</h3>
        <div className="space-y-6">
          {SERVICE_TYPES.map(({ id, hasPricing }) => {
            const svc = data.services[id];
            const active = svc?.active ?? false;
            return (
              <div
                key={id}
                className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-4"
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => toggleService(id, e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="font-semibold">{t(`serviceTypes.${id}`)}</span>
                </label>

                {active && (
                  <>
                    {hasPricing && (
                      <div className="grid grid-cols-2 gap-4 pl-6">
                        <div>
                          <label className="block text-sm font-medium mb-1">{t('pricePerDay')}</label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={svc.price}
                            onChange={(e) => updateService(id, 'price', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">{t('pricePerWeek')}</label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={svc.priceWeek}
                            onChange={(e) => updateService(id, 'priceWeek', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                    <div className="pl-6">
                      <label className="block text-sm font-medium mb-1">{t('serviceDescription')}</label>
                      <textarea
                        value={svc.description}
                        onChange={(e) => updateService(id, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder={t('serviceDescriptionPlaceholder')}
                      />
                    </div>

                    {/* Options conditionnelles par service */}
                    {id === 'hebergement' && hasDog && (
                      <div className="pl-6">
                        <ServiceOptionsSelector
                          title={t('optionsForDogs')}
                          options={getTranslatedOptions('hebergementChien')}
                          selected={data.serviceOptions.hebergementChien || []}
                          onChange={(selected) => setServiceOptions('hebergementChien', selected)}
                        />
                      </div>
                    )}
                    {id === 'hebergement' && hasCat && (
                      <div className="pl-6">
                        <ServiceOptionsSelector
                          title={t('optionsForCats')}
                          options={getTranslatedOptions('hebergementChat')}
                          selected={data.serviceOptions.hebergementChat || []}
                          onChange={(selected) => setServiceOptions('hebergementChat', selected)}
                        />
                      </div>
                    )}
                    {id === 'garde' && hasDog && (
                      <div className="pl-6">
                        <ServiceOptionsSelector
                          title={t('optionsForDogs')}
                          options={getTranslatedOptions('gardeChien')}
                          selected={data.serviceOptions.gardeChien || []}
                          onChange={(selected) => setServiceOptions('gardeChien', selected)}
                        />
                      </div>
                    )}
                    {id === 'garde' && hasCat && (
                      <div className="pl-6">
                        <ServiceOptionsSelector
                          title={t('optionsForCats')}
                          options={getTranslatedOptions('gardeChat')}
                          selected={data.serviceOptions.gardeChat || []}
                          onChange={(selected) => setServiceOptions('gardeChat', selected)}
                        />
                      </div>
                    )}
                    {id === 'visite' && hasDog && (
                      <div className="pl-6">
                        <ServiceOptionsSelector
                          title={t('optionsForDogs')}
                          options={getTranslatedOptions('visiteChien')}
                          selected={data.serviceOptions.visiteChien || []}
                          onChange={(selected) => setServiceOptions('visiteChien', selected)}
                        />
                      </div>
                    )}
                    {id === 'visite' && hasCat && (
                      <div className="pl-6">
                        <ServiceOptionsSelector
                          title={t('optionsForCats')}
                          options={getTranslatedOptions('visiteChat')}
                          selected={data.serviceOptions.visiteChat || []}
                          onChange={(selected) => setServiceOptions('visiteChat', selected)}
                        />
                      </div>
                    )}
                    {id === 'promenade' && hasDog && (
                      <div className="pl-6">
                        <ServiceOptionsSelector
                          title={t('optionsForDogs')}
                          options={getTranslatedOptions('promenadeChien')}
                          selected={data.serviceOptions.promenadeChien || []}
                          onChange={(selected) => setServiceOptions('promenadeChien', selected)}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
