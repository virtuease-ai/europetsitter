'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  PawPrint, 
  Heart, 
  Settings,
  LogOut
} from 'lucide-react';
import { signOut } from '@/lib/auth/actions';
import { useRouter } from 'next/navigation';

const menuItems = [
  {
    href: '/proprietaire/tableau-de-bord',
    icon: LayoutDashboard,
    label: 'Tableau de bord',
  },
  {
    href: '/proprietaire/reservations',
    icon: Calendar,
    label: 'Mes réservations',
  },
  {
    href: '/proprietaire/mes-animaux',
    icon: PawPrint,
    label: 'Mes animaux',
  },
  {
    href: '/proprietaire/favoris',
    icon: Heart,
    label: 'Favoris',
  },
  {
    href: '/proprietaire/parametres',
    icon: Settings,
    label: 'Paramètres',
  },
];

export function OwnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/fr');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Mon Espace</h2>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.includes(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary text-dark font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 mt-8 w-full text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Se déconnecter</span>
        </button>
      </div>
    </aside>
  );
}
