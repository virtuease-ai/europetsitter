'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Search page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Oups ! Une erreur est survenue
        </h1>

        <p className="text-gray-600 mb-6">
          Nous n&apos;avons pas pu charger les résultats de recherche.
          Veuillez réessayer ou retourner à l&apos;accueil.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-primary hover:bg-primary-hover text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>

          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Retour à l&apos;accueil
            </Link>
          </Button>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-gray-400">
            Code erreur: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
