'use client';

import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const router = useRouter();
  const t = useTranslations('auth');
  
  const handleSelectRole = (role: 'owner' | 'sitter') => {
    onClose();
    router.push(`/inscription/${role === 'owner' ? 'proprietaire' : 'petsitter'}`);
  };
  
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl p-8 max-w-4xl w-full shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <Dialog.Title className="text-2xl font-bold">
              {t('chooseProfile')}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => handleSelectRole('owner')}
              className="group p-8 border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-lg transition-all text-center"
            >
              <div className="text-6xl mb-4">🐕</div>
              <h3 className="text-xl font-bold mb-2">{t('ownerTitle')}</h3>
              <p className="text-gray-600 mb-4">{t('ownerSubtitle')}</p>
              <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                ✓ {t('ownerBadge')}
              </div>
              <div className="mt-4 py-3 bg-primary text-dark font-semibold rounded-lg group-hover:bg-primary-hover transition-colors">
                {t('continue')}
              </div>
            </button>
            
            <button
              onClick={() => handleSelectRole('sitter')}
              className="group p-8 border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-lg transition-all text-center"
            >
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-xl font-bold mb-2">{t('sitterTitle')}</h3>
              <p className="text-gray-600 mb-4">{t('sitterSubtitle')}</p>
              <div className="inline-block bg-primary-light text-primary-hover px-4 py-2 rounded-full text-sm font-semibold mb-6">
                🎁 {t('sitterBadge')}
              </div>
              <div className="mt-4 py-3 bg-primary text-dark font-semibold rounded-lg group-hover:bg-primary-hover transition-colors">
                {t('continue')}
              </div>
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
