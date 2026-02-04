'use client';

import { useTranslations } from 'next-intl';
import { SitterLayout } from '@/components/layout/SitterLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Star } from 'lucide-react';

function ReviewsContent() {
  const t = useTranslations('sitterDashboard.reviewsPage');

  return (
    <SitterLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-2">{t('subtitle')}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('averageRating')}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-4xl font-bold">5.0</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-6 h-6 text-primary fill-primary" />
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{t('reviewsCount')}</p>
              <p className="text-4xl font-bold mt-1">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12 text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">{t('noReviews')}</p>
            <p className="text-sm mt-2">{t('noReviewsText')}</p>
          </div>
        </div>
      </div>
    </SitterLayout>
  );
}

export default function SitterReviewsPage() {
  return (
    <AuthGuard requiredRole="sitter">
      <ReviewsContent />
    </AuthGuard>
  );
}
