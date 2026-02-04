'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  User,
  Star,
  CreditCard,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface SitterLayoutProps {
  children: ReactNode;
}

export function SitterLayout({ children }: SitterLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: 'Tableau de bord',
      href: '/petsitter/tableau-de-bord',
      icon: LayoutDashboard,
    },
    {
      name: 'Réservations',
      href: '/petsitter/reservations',
      icon: Calendar,
    },
    {
      name: 'Calendrier',
      href: '/petsitter/calendrier',
      icon: Calendar,
    },
    {
      name: 'Mon profil',
      href: '/petsitter/profil',
      icon: User,
    },
    {
      name: 'Avis reçus',
      href: '/petsitter/avis',
      icon: Star,
    },
    {
      name: 'Abonnement',
      href: '/petsitter/abonnement',
      icon: CreditCard,
    },
    {
      name: 'Paramètres',
      href: '/petsitter/parametres',
      icon: Settings,
    },
  ];

  const isActive = (href: string) => {
    return pathname?.includes(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mobile */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-xl font-bold">Dashboard Petsitter</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-8">Espace Petsitter</h2>
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary text-dark font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Sidebar Mobile */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold">Menu</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive(item.href)
                            ? 'bg-primary text-dark font-semibold'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
