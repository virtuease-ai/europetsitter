'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Link, usePathname } from '@/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Calendar,
  User,
  Star,
  CreditCard,
  Settings,
  ClipboardList,
  Menu,
  X
} from 'lucide-react';

interface SitterLayoutProps {
  children: ReactNode;
}

export function SitterLayout({ children }: SitterLayoutProps) {
  const pathname = usePathname();
  const t = useTranslations('sitterDashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const navigation = [
    { name: t('nav.dashboard'), href: '/petsitter/tableau-de-bord', icon: LayoutDashboard },
    { name: t('nav.reservations'), href: '/petsitter/reservations', icon: ClipboardList },
    { name: t('nav.calendar'), href: '/petsitter/calendrier', icon: Calendar },
    { name: t('nav.profile'), href: '/petsitter/profil', icon: User },
    { name: t('nav.reviews'), href: '/petsitter/avis', icon: Star },
    { name: t('nav.subscription'), href: '/petsitter/abonnement', icon: CreditCard },
    { name: t('nav.settings'), href: '/petsitter/parametres', icon: Settings },
  ];

  const isActive = (href: string) => pathname === href;

  // Fermer la sidebar mobile quand on change de page
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  // Bloquer le scroll quand la sidebar mobile est ouverte
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileSidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen sticky top-16">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800">{t('space')}</h2>
          </div>

          <nav className="px-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay pour mobile */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar Mobile (drawer) */}
        <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">{t('space')}</h2>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={t('closeMenu')}
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <nav className="px-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 w-full">
          {/* Bouton menu mobile */}
          <div className="lg:hidden sticky top-16 bg-white border-b border-gray-200 px-4 py-3 z-30">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={t('menu')}
            >
              <Menu className="w-5 h-5 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">{t('menu')}</span>
            </button>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
