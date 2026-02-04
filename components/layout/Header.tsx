'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth/actions';
import { ChevronDown, LogOut, User, Settings, Menu, X } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('nav');
  const locale = useLocale();
  const { user, loading } = useAuth();
  const router = useRouter();

  // Fermer le menu utilisateur quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fermer le menu mobile quand on change de page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router]);

  // Bloquer le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    await signOut();
    router.push(`/${locale}/`);
    router.refresh();
  };

  const getDashboardLink = () => {
    return user?.role === 'sitter' 
      ? '/petsitter/tableau-de-bord' 
      : '/proprietaire/tableau-de-bord';
  };

  const getSettingsLink = () => {
    return user?.role === 'sitter' 
      ? '/petsitter/parametres' 
      : '/proprietaire/parametres';
  };
  
  return (
    <>
      <header className="sticky top-0 bg-white shadow-sm z-40">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl md:text-2xl font-bold text-primary z-50">
            EuroPetSitter
          </Link>
          
          {/* Navigation desktop */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/" className="hover:text-primary transition-colors text-sm">
              {t('home')}
            </Link>
            <Link href="/recherche" className="hover:text-primary transition-colors text-sm">
              {t('search')}
            </Link>
            <Link href="/a-propos" className="hover:text-primary transition-colors text-sm">
              {t('about')}
            </Link>
            <Link href="/comment-ca-marche" className="hover:text-primary transition-colors text-sm">
              {t('howItWorks')}
            </Link>
            <Link href="/devenir-petsitter" className="hover:text-primary transition-colors text-sm">
              {t('becomeSitter')}
            </Link>
            <Link href="/blog" className="hover:text-primary transition-colors text-sm">
              {t('blog')}
            </Link>
            <Link href="/contact" className="hover:text-primary transition-colors text-sm">
              {t('contact')}
            </Link>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {/* Sélecteur de langue */}
            <LanguageSwitcher />

            {/* Menu hamburger mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors z-50"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>

            {/* Actions utilisateur */}
            {loading ? (
              <div className="text-gray-400 text-sm hidden sm:block">Chargement...</div>
            ) : user ? (
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block font-medium text-gray-700 text-sm">{user.name || 'Mon compte'}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Menu déroulant utilisateur */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    
                    <Link
                      href={getDashboardLink()}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Tableau de bord
                    </Link>
                    
                    <Link
                      href={getSettingsLink()}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Paramètres
                    </Link>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/inscription/petsitter" className="hidden md:block">
                  <button className="bg-primary hover:bg-primary-hover text-white font-semibold px-4 md:px-6 py-2 rounded-full transition-all text-xs md:text-sm">
                    Devenir petsitter
                  </button>
                </Link>
                
                <Link href="/inscription/proprietaire" className="hidden sm:block">
                  <button className="bg-white hover:bg-gray-50 text-gray-900 font-semibold px-4 md:px-6 py-2 rounded-full border-2 border-gray-300 transition-all text-xs md:text-sm">
                    Inscription
                  </button>
                </Link>
                
                <Link href="/connexion" className="hidden sm:block">
                  <button className="border border-gray-300 hover:bg-gray-50 px-4 md:px-6 py-2 rounded-full transition-all text-xs md:text-sm text-gray-700">
                    {t('login')}
                  </button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Menu mobile plein écran */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-30 lg:hidden overflow-y-auto">
          <div className="container mx-auto px-4 pt-20 pb-8">
            {/* Navigation links */}
            <nav className="space-y-1 mb-8">
              <Link 
                href="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t('home')}
              </Link>
              <Link 
                href="/recherche" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t('search')}
              </Link>
              <Link 
                href="/a-propos" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t('about')}
              </Link>
              <Link 
                href="/comment-ca-marche" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t('howItWorks')}
              </Link>
              <Link 
                href="/devenir-petsitter" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t('becomeSitter')}
              </Link>
              <Link 
                href="/blog" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t('blog')}
              </Link>
              <Link 
                href="/contact" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t('contact')}
              </Link>
            </nav>

            {/* User section / Auth buttons */}
            <div className="border-t border-gray-200 pt-6 space-y-3">
              {user ? (
                <>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg mb-4">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link 
                    href={getDashboardLink()}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5" />
                    Tableau de bord
                  </Link>
                  <Link 
                    href={getSettingsLink()}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    Paramètres
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Se déconnecter
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/inscription/petsitter"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block"
                  >
                    <button className="w-full bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-full transition-all text-base">
                      Devenir petsitter
                    </button>
                  </Link>
                  <Link 
                    href="/inscription/proprietaire"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block"
                  >
                    <button className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold px-6 py-3 rounded-full border-2 border-gray-300 transition-all text-base">
                      Inscription
                    </button>
                  </Link>
                  <Link 
                    href="/connexion"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block"
                  >
                    <button className="w-full border border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-full transition-all text-base text-gray-700">
                      {t('login')}
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
