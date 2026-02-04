'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

// Fuseau horaire de Bruxelles
const TIMEZONE = 'Europe/Brussels';

// Obtenir la date actuelle dans le fuseau horaire de Bruxelles au format YYYY-MM-DD
const getTodayInBrussels = (): string => {
  const now = new Date();
  return now.toLocaleDateString('sv-SE', { timeZone: TIMEZONE }); // sv-SE donne le format YYYY-MM-DD
};

// Créer une date locale à partir d'une chaîne YYYY-MM-DD sans décalage
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

interface BlockDatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dates: string[], reason: string) => Promise<void>;
}

export function BlockDatesModal({ isOpen, onClose, onConfirm }: BlockDatesModalProps) {
  const t = useTranslations('sitterDashboard.calendarPage.modal');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!startDate) {
      setError(t('errors.selectDate'));
      return;
    }

    setLoading(true);

    try {
      // Générer la liste des dates entre start et end (avec dates locales sans décalage)
      const dates: string[] = [];
      const start = parseLocalDate(startDate);
      const end = endDate ? parseLocalDate(endDate) : start;

      // Vérifier que end >= start
      if (end < start) {
        setError(t('errors.endBeforeStart'));
        setLoading(false);
        return;
      }

      let currentDate = new Date(start);
      while (currentDate <= end) {
        dates.push(format(currentDate, 'yyyy-MM-dd'));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      await onConfirm(dates, reason);

      // Reset form
      setStartDate('');
      setEndDate('');
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err.message || t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setStartDate('');
      setEndDate('');
      setReason('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t('title')}</h2>
            <p className="text-sm text-gray-600">{t('subtitle')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('startDate')} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={getTodayInBrussels()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('endDate')}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || getTodayInBrussels()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('endDateHelp')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('reasonLabel')}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={200}
              placeholder={t('reasonPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {reason.length}/200 {t('characters')}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? t('loading') : t('block')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
