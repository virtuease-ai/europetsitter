'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

type InfoTab = 'owners' | 'app' | 'sitters';

export function InfoTabs() {
  const t = useTranslations('home');
  const [activeInfoTab, setActiveInfoTab] = useState<InfoTab>('owners');

  return (
    <div className="container mx-auto max-w-4xl relative z-10">
      <p className="text-primary font-semibold text-sm uppercase tracking-widest text-center mb-2">Informations</p>
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">Informations pratiques</h2>
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <button
          onClick={() => setActiveInfoTab('owners')}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            activeInfoTab === 'owners' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:text-gray-900 border-2 border-primary'
          }`}
        >
          {t('tabs.owners')}
        </button>
        <button
          onClick={() => setActiveInfoTab('app')}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            activeInfoTab === 'app' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:text-gray-900 border-2 border-primary'
          }`}
        >
          {t('tabs.app')}
        </button>
        <button
          onClick={() => setActiveInfoTab('sitters')}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            activeInfoTab === 'sitters' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:text-gray-900 border-2 border-primary'
          }`}
        >
          {t('tabs.sitters')}
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-10 shadow-sm">
        {activeInfoTab === 'owners' && (
          <>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">{t('ownersTab.title')}</h3>
            <p className="text-gray-600 mb-4">{t('ownersTab.shortText')}</p>
            <p className="text-gray-600 mb-6">{t('ownersTab.fullText')}</p>
            <Link href="/recherche">
              <button className="bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-2.5 rounded-full transition-all text-sm">
                {t('ownersTab.discoverBtn')}
              </button>
            </Link>
          </>
        )}

        {activeInfoTab === 'app' && (
          <>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">{t('appTab.title')}</h3>
            <p className="text-gray-600 mb-4">{t('appTab.shortText')}</p>
            <p className="text-gray-600">{t('appTab.fullText')}</p>
          </>
        )}

        {activeInfoTab === 'sitters' && (
          <>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">{t('sittersTab.title')}</h3>
            <p className="text-gray-600 mb-4">{t('sittersTab.shortText')}</p>
            <p className="text-gray-600 mb-6">{t('sittersTab.fullText')}</p>
            <Link href="/devenir-petsitter">
              <button className="bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-2.5 rounded-full transition-all text-sm">
                {t('sittersTab.becomeBtn')}
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
